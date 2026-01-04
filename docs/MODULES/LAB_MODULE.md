# MÓDULO DE LABORATORIO - DOCUMENTACIÓN COMPLETA

**Última Actualización**: 2026-01-02  
**Versión**: 2.0 (10 Etapas)

---

## 🎯 **OBJETIVO DEL MÓDULO**

El módulo de laboratorio gestiona el flujo completo de producción de prótesis dentales, desde la recepción de órdenes hasta la entrega final, con un sistema de 10 etapas que garantiza calidad y trazabilidad.

---

## 📊 **FLUJO DE TRABAJO (10 ETAPAS)**

### 1. **CLÍNICA** (`clinic_pending`)
- **Descripción**: Orden creada por la clínica, pendiente de envío
- **Responsable**: Clínica
- **Acciones**:
  - Clínica prepara muestras físicas
  - Clínica envía por mensajería externa
- **Siguiente**: INGRESOS (cuando lab recibe)

### 2. **INGRESOS** (`income_validation`)
- **Descripción**: Validación de muestras recibidas
- **Responsable**: Staff de Ingresos
- **Acciones**:
  - Verificar integridad de muestras
  - Validar datos de la orden
  - Registrar recepción
- **Siguiente**: YESOS

### 3. **YESOS** (`gypsum`)
- **Descripción**: Preparación de modelos en yeso
- **Responsable**: Técnico de Yesos
- **Acciones**:
  - Crear modelos en yeso
  - Verificar calidad
- **Siguiente**: DISEÑO

### 4. **DISEÑO** (`design`)
- **Descripción**: Diseño digital de la prótesis
- **Responsable**: Diseñador CAD
- **Acciones**:
  - Escanear modelos
  - Diseñar prótesis en software CAD
  - Generar archivos STL
- **Siguiente**: APRO CLIENTE

### 5. **APRO CLIENTE** (`client_approval`)
- **Descripción**: Aprobación del diseño por el doctor
- **Responsable**: Doctor (Clínica)
- **Acciones**:
  - Revisar diseño 3D
  - Aprobar o solicitar cambios
- **Siguiente**: NESTING (si aprobado)
- **Alternativa**: DISEÑO (si requiere cambios)

### 6. **NESTING** (`nesting`)
- **Descripción**: Optimización de piezas para impresión
- **Responsable**: Técnico de Nesting
- **Acciones**:
  - Organizar piezas en plataforma
  - Optimizar uso de material
  - Generar soportes
- **Siguiente**: MAN

### 7. **MAN** (`production_man`)
- **Descripción**: Manufactura/Producción
- **Responsable**: Operador de Máquinas
- **Acciones**:
  - Imprimir/fresar piezas
  - Post-procesamiento
  - Limpieza
- **Siguiente**: QA

### 8. **QA** (`qa`)
- **Descripción**: Control de Calidad
- **Responsable**: Inspector de Calidad
- **Acciones**:
  - Verificar dimensiones
  - Verificar ajuste
  - Verificar acabado
- **Siguiente**: BILLING (si aprobado)
- **Alternativa**: MAN (si rechazado)

### 9. **BILLING** (`billing`)
- **Descripción**: Facturación
- **Responsable**: Administración
- **Acciones**:
  - Generar factura en Odoo
  - Sincronizar con sistema
  - Notificar a clínica
- **Siguiente**: DELIVERY

### 10. **DELIVERY** (`delivery`)
- **Descripción**: Entrega final
- **Responsable**: Logística/Courier
- **Acciones**:
  - Empacar orden
  - Coordinar entrega
  - Confirmar recepción
- **Estado Final**: Orden completada

---

## 🔄 **LÓGICA DE ESTADOS INICIALES**

Cuando un doctor crea una orden, el estado inicial depende del **tipo de entrega**:

| Tipo de Entrega | Estado Inicial | Razón |
|-----------------|----------------|-------|
| **Digital** | `design` | Archivos digitales van directo a diseño |
| **Recolección** | `income_validation` | Courier recoge y entrega en lab |
| **Envío** | `clinic_pending` | Clínica envía por mensajería externa |

---

## 👥 **ROLES Y PERMISOS**

### Lab Admin (`lab_admin`)
- ✅ Ve TODAS las órdenes
- ✅ Puede mover órdenes entre cualquier etapa
- ✅ Acceso a configuración
- ✅ Gestión de servicios y SLA

### Lab Staff (`lab_staff`)
- ✅ Ve TODAS las órdenes
- ✅ Puede mover órdenes según su área
- ❌ No acceso a configuración

### Courier
- ✅ Ve órdenes pendientes de recolección
- ✅ Puede mover: `clinic_pending` → `income_validation`
- ✅ Puede mover: `billing` → `delivery`

### Clínica (Doctor/Admin)
- ✅ Ve solo SUS órdenes
- ✅ Puede aprobar/rechazar en `client_approval`
- ❌ No puede mover entre otras etapas

---

## 📋 **TABLAS PRINCIPALES**

### `schema_lab.orders`
```sql
- id: UUID (PK)
- clinic_id: UUID (FK → clinics)
- patient_id: UUID (FK → patients)
- status: TEXT (10 etapas)
- delivery_type: TEXT (digital, pickup, shipping)
- digital_files: JSONB
- shipping_info: JSONB
- due_date: TIMESTAMPTZ (calculado automáticamente)
- total_price: DECIMAL
- odoo_sync_status: TEXT
- created_at: TIMESTAMPTZ
```

### `schema_lab.order_items`
```sql
- id: UUID (PK)
- order_id: UUID (FK → orders)
- service_id: UUID (FK → services)
- quantity: INTEGER
- unit_price: DECIMAL
```

### `schema_lab.services`
```sql
- id: UUID (PK)
- name: TEXT
- base_price: DECIMAL
- sla_hours: INTEGER (para cálculo automático de due_date)
- odoo_product_id: INTEGER
```

---

## 🔐 **SEGURIDAD (RLS)**

### Clínicas
```sql
-- Solo ven órdenes de SU clínica
WHERE clinic_id IN (
    SELECT clinic_id FROM clinic_staff WHERE user_id = auth.uid()
)
```

### Lab/Admin
```sql
-- Ven TODAS las órdenes
WHERE role IN ('super_admin', 'lab_admin', 'lab_staff', 'courier')
```

---

## 🎨 **COMPONENTES PRINCIPALES**

### 1. **Dashboard Lab** (`/dashboard/lab`)
- Estadísticas por etapa
- Gráfico de producción
- Tabla de órdenes recientes
- SLA en tiempo real

### 2. **KAMBA** (`/dashboard/lab/kamba`)
- Tablero Kanban con 10 columnas
- Drag & drop entre etapas
- Filtros por clínica/prioridad
- Timers de SLA en cada tarjeta

### 3. **Rendimiento** (`/dashboard/lab/performance`)
- KPIs de producción
- Tiempos promedio por etapa
- Órdenes completadas vs pendientes

---

## ⚙️ **FUNCIONALIDADES ESPECIALES**

### SLA Automático
```typescript
// El due_date se calcula automáticamente:
due_date = NOW() + service.sla_hours
```

### Pausar Órdenes
- Cualquier etapa puede pausarse
- Requiere justificación
- El timer de SLA se detiene

### Retornar Órdenes
- Desde `client_approval` → `design` (cambios solicitados)
- Desde `qa` → `production_man` (rechazo de calidad)

### Sincronización Odoo
- Facturación automática en etapa `billing`
- Sincronización de precios y servicios
- Estado: `pending`, `synced`, `error`

---

## 📊 **MÉTRICAS Y KPIs**

### Por Etapa
- Órdenes actuales
- Tiempo promedio
- Tasa de rechazo (QA)

### Globales
- Órdenes completadas (mes/semana/día)
- SLA cumplido (%)
- Tiempo promedio total

---

## 🔄 **FLUJO COMPLETO (Ejemplo)**

```
1. Doctor crea orden → clinic_pending
2. Courier recoge → income_validation
3. Staff valida → gypsum
4. Técnico hace yesos → design
5. Diseñador crea CAD → client_approval
6. Doctor aprueba → nesting
7. Técnico optimiza → production_man
8. Operador produce → qa
9. Inspector aprueba → billing
10. Admin factura → delivery
11. Courier entrega → COMPLETADO
```

---

## 🚀 **PRÓXIMAS MEJORAS**

- [ ] Notificaciones en tiempo real
- [ ] App móvil para couriers
- [ ] Tracking GPS de entregas
- [ ] Optimización de rutas con IA
- [ ] Reportes avanzados

---

**Fin del Documento**
