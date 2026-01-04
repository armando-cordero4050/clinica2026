# Módulo de Logística - Especificación Completa v2.0

**Fecha de Creación**: 2026-01-02  
**Versión**: 2.0  
**Estado**: En Desarrollo - Sprint 1

---

## 🎯 Objetivo General

Crear un módulo completo de logística que permita:
1. Gestión de órdenes con 3 tipos de entrega (Digital, Recolección, Envío)
2. Optimización de rutas con IA
3. Tracking en tiempo real de mensajeros
4. SLA automático basado en servicios de Odoo

---

## 📋 Tipos de Entrega

### 1. Digital
- Doctor adjunta archivos STL/PLY/PDF
- Orden va directo a etapa `design`
- No requiere logística física
- SLA calculado automáticamente

### 2. Física - Recolección
- Logística coordina recolección
- Orden inicia en `clinic_pending`
- Courier recoge en clínica
- Aparece en mapa de rutas

### 3. Física - Envío
- Doctor envía por mensajería externa
- Ingresa No. de guía + empresa
- Orden va a `digital_picking`
- Lab espera recepción

---

## 🗄️ Base de Datos

### Tabla: `schema_lab.orders` (Modificaciones)

```sql
ALTER TABLE schema_lab.orders
ADD COLUMN IF NOT EXISTS delivery_type TEXT CHECK (delivery_type IN ('digital', 'pickup', 'shipping')),
ADD COLUMN IF NOT EXISTS digital_files JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS shipping_info JSONB,
ADD COLUMN IF NOT EXISTS lab_location JSONB;

COMMENT ON COLUMN schema_lab.orders.delivery_type IS 'Tipo de entrega: digital, pickup (recolección), shipping (envío)';
COMMENT ON COLUMN schema_lab.orders.digital_files IS 'Array de URLs de archivos digitales [{name, url, size, type}]';
COMMENT ON COLUMN schema_lab.orders.shipping_info IS 'Info de envío: {courier, tracking_number, estimated_arrival}';
COMMENT ON COLUMN schema_lab.orders.lab_location IS 'Ubicación del laboratorio {lat, lng, address}';
```

### Tabla: `schema_lab.courier_locations` (Nueva)

```sql
CREATE TABLE schema_lab.courier_locations (
    courier_id UUID PRIMARY KEY REFERENCES schema_core.users(id) ON DELETE CASCADE,
    lat DECIMAL(10,8) NOT NULL,
    lng DECIMAL(11,8) NOT NULL,
    accuracy DECIMAL(10,2), -- Precisión en metros
    heading DECIMAL(5,2), -- Dirección en grados (0-360)
    speed DECIMAL(5,2), -- Velocidad en m/s
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_courier_locations_updated ON schema_lab.courier_locations(updated_at DESC);

COMMENT ON TABLE schema_lab.courier_locations IS 'Ubicación en tiempo real de los mensajeros';
```

### Tabla: `schema_lab.delivery_routes` (Ya definida)

```sql
CREATE TABLE schema_lab.delivery_routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    courier_id UUID REFERENCES schema_core.users(id),
    route_name TEXT NOT NULL,
    route_date DATE NOT NULL,
    order_ids UUID[], 
    optimized_sequence JSONB,
    total_distance_km DECIMAL(10,2),
    estimated_duration_minutes INTEGER,
    status TEXT CHECK (status IN ('draft', 'active', 'completed', 'cancelled')) DEFAULT 'draft',
    google_maps_url TEXT,
    google_maps_route_data JSONB,
    ai_optimization_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🔧 RPCs y Funciones

### RPC: `create_lab_order_rpc` (Actualizado)

```sql
CREATE OR REPLACE FUNCTION public.create_lab_order_rpc(
    p_clinic_id UUID,
    p_patient_id UUID,
    p_patient_name TEXT,
    p_service_ids UUID[],
    p_delivery_type TEXT DEFAULT 'pickup',
    p_digital_files JSONB DEFAULT '[]'::jsonb,
    p_shipping_info JSONB DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, schema_lab
AS $$
DECLARE
    v_order_id UUID;
    v_total_price NUMERIC := 0;
    v_sla_hours INTEGER;
    v_due_date TIMESTAMPTZ;
    v_status TEXT;
BEGIN
    -- 1. Calcular precio total
    SELECT COALESCE(SUM(base_price), 0)
    INTO v_total_price
    FROM schema_lab.services
    WHERE id = ANY(p_service_ids);

    -- 2. Obtener SLA del primer servicio
    SELECT sla_hours INTO v_sla_hours
    FROM schema_lab.services
    WHERE id = p_service_ids[1];

    -- 3. Calcular fecha de entrega (INDISCUTIBLE)
    v_due_date := NOW() + (v_sla_hours || ' hours')::INTERVAL;

    -- 4. Determinar estado inicial según tipo de entrega
    v_status := CASE 
        WHEN p_delivery_type = 'digital' THEN 'design'
        WHEN p_delivery_type = 'pickup' THEN 'clinic_pending'
        WHEN p_delivery_type = 'shipping' THEN 'digital_picking'
        ELSE 'clinic_pending'
    END;

    -- 5. Insertar orden
    INSERT INTO schema_lab.orders (
        clinic_id,
        patient_id,
        patient_name,
        doctor_name,
        status,
        priority,
        delivery_type,
        digital_files,
        shipping_info,
        due_date,
        total_price,
        price,
        created_at
    ) VALUES (
        p_clinic_id,
        p_patient_id,
        p_patient_name,
        'Doctor',
        v_status,
        'normal',
        p_delivery_type,
        p_digital_files,
        p_shipping_info,
        v_due_date,
        v_total_price,
        v_total_price,
        NOW()
    )
    RETURNING id INTO v_order_id;

    -- 6. Insertar items
    INSERT INTO schema_lab.order_items (order_id, service_id, quantity, unit_price)
    SELECT v_order_id, service_id, 1, base_price
    FROM schema_lab.services
    WHERE id = ANY(p_service_ids);

    RETURN v_order_id;
END;
$$;
```

### RPC: `get_pending_pickups_with_distance`

```sql
CREATE OR REPLACE FUNCTION public.get_pending_pickups_with_distance()
RETURNS TABLE (
    order_id UUID,
    order_number TEXT,
    clinic_name TEXT,
    clinic_address TEXT,
    clinic_lat DECIMAL,
    clinic_lng DECIMAL,
    patient_name TEXT,
    service_name TEXT,
    due_date TIMESTAMPTZ,
    priority TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = schema_lab, schema_medical, public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id as order_id,
        COALESCE(o.order_number, o.id::text) as order_number,
        c.name as clinic_name,
        c.address as clinic_address,
        NULL::DECIMAL as clinic_lat, -- TODO: Agregar coordenadas a clinics
        NULL::DECIMAL as clinic_lng,
        o.patient_name,
        (SELECT s.name FROM schema_lab.order_items oi 
         JOIN schema_lab.services s ON oi.service_id = s.id 
         WHERE oi.order_id = o.id LIMIT 1) as service_name,
        o.due_date,
        o.priority
    FROM schema_lab.orders o
    LEFT JOIN schema_medical.clinics c ON o.clinic_id = c.id
    WHERE o.status = 'clinic_pending'
    AND o.delivery_type = 'pickup'
    ORDER BY o.due_date ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_pending_pickups_with_distance() TO authenticated;
```

---

## 📱 Frontend - Sprint 1

### 1. Modificar Modal de Orden

**Archivo**: `src/modules/medical/components/order-modal.tsx`

**Cambios**:
1. Agregar radio buttons para tipo de entrega
2. Mostrar/ocultar campos según selección
3. Implementar upload de archivos (Supabase Storage)
4. Eliminar input de fecha de entrega
5. Mostrar fecha calculada automáticamente

**Componentes nuevos**:
- `FileUploader.tsx` - Drag & drop de archivos
- `ShippingInfoForm.tsx` - Form para info de envío

### 2. Crear Componente de Upload

**Archivo**: `src/components/file-uploader.tsx`

**Funcionalidades**:
- Drag & drop
- Preview de archivos
- Validación de tipos (STL, PLY, PDF, JPG, PNG)
- Upload a Supabase Storage
- Progress bar
- Eliminar archivos

### 3. Actualizar Server Action

**Archivo**: `src/modules/medical/actions/orders.ts`

**Función**: `createLabOrder`

**Cambios**:
- Agregar parámetros de delivery_type, digital_files, shipping_info
- Llamar al RPC actualizado
- Manejar upload de archivos

---

## 🗺️ Google Maps Integration

### APIs Necesarias
1. **Maps JavaScript API**
2. **Geocoding API**
3. **Distance Matrix API**
4. **Directions API**
5. **Routes API** (para optimización)

### Configuración

**Variables de entorno**:
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
GOOGLE_MAPS_SERVER_API_KEY=your_server_key_here
```

**Restricciones de API Key**:
- Client key: Solo dominios autorizados
- Server key: Solo IPs autorizadas

---

## 🔄 Flujos Actualizados

### Flujo Digital
```
1. Doctor crea orden (Digital)
2. Adjunta archivos STL/PLY
3. Sistema calcula due_date = NOW() + service.sla_hours
4. Orden va directo a 'design'
5. Diseñador descarga archivos
6. Continúa flujo normal (design → client_approval → nesting → ...)
```

### Flujo Física - Recolección
```
1. Doctor crea orden (Física - Recolección)
2. Sistema calcula due_date
3. Orden va a 'clinic_pending'
4. Logística ve orden en mapa
5. Logística crea ruta optimizada
6. Courier recoge
7. Orden pasa a 'digital_picking'
8. Continúa flujo normal
```

### Flujo Física - Envío
```
1. Doctor crea orden (Física - Envío)
2. Doctor ingresa No. guía + empresa
3. Sistema calcula due_date
4. Orden va a 'digital_picking'
5. Lab espera recepción
6. Al recibir, continúa flujo normal
```

---

## 📊 Sprint 1 - Tareas

### Base de Datos
- [ ] Crear migración para campos de delivery en orders
- [ ] Actualizar RPC create_lab_order_rpc
- [ ] Crear bucket en Supabase Storage para archivos

### Backend
- [ ] Actualizar createLabOrder action
- [ ] Crear función de upload de archivos
- [ ] Crear función de cálculo de SLA

### Frontend
- [ ] Modificar OrderModal con tipos de entrega
- [ ] Crear componente FileUploader
- [ ] Crear componente ShippingInfoForm
- [ ] Actualizar UI para mostrar SLA calculado
- [ ] Agregar validaciones

### Testing
- [ ] Probar creación de orden Digital
- [ ] Probar creación de orden Recolección
- [ ] Probar creación de orden Envío
- [ ] Verificar cálculo de SLA
- [ ] Verificar upload de archivos

---

## 🚀 Próximos Sprints

### Sprint 2: Módulo de Rutas
- Crear página de planificador
- Integrar Google Maps
- Mostrar órdenes en mapa
- Calcular distancias

### Sprint 3: Optimización IA
- Implementar algoritmo de optimización
- Permitir reordenar manual
- Guardar rutas

### Sprint 4: Tracking en Tiempo Real
- Geolocalización de couriers
- Vista de tracking para doctor
- Supabase Realtime

---

**Fin del Documento**
