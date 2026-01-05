# Plan de Acción - Fase 2.5: Módulo Catálogo Lab

**Fecha de Creación:** 2026-01-04  
**Estado:** En Progreso  
**Prioridad:** Alta

---

## 📋 Contexto

Actualmente el sistema tiene:
- ✅ Wizard de Lab Orders funcional (Pasos 1-3)
- ✅ Odontograma con trigger para servicios de laboratorio
- ✅ Integración Odontograma → Wizard
- ❌ Catálogo de materiales hardcodeado (mock data)
- ❌ Sin módulo administrativo para gestionar materiales
- ❌ Sin lógica de "Orden Express"

**Objetivo:** Crear un sistema flexible y escalable para gestionar el catálogo de materiales de laboratorio desde la UI, sin necesidad de modificar código.

---

## 🎯 Fases del Plan

### **FASE 1: Backend - Estructura de Datos** ⏳

#### 1.1 Crear Tablas en Supabase
**Archivo:** `supabase/migrations/20260205000070_create_lab_catalog_tables.sql`  
**Estado:** Creado, pendiente de ejecución exitosa

**Acción Inmediata:**
```sql
-- Ejecutar manualmente en Supabase Dashboard > SQL Editor
-- O usar: supabase db push (si tienes CLI configurado)

DROP TABLE IF EXISTS public.lab_configurations CASCADE;
DROP TABLE IF EXISTS public.lab_materials CASCADE;

-- Helper Type
CREATE TYPE lab_price_type AS ENUM ('fixed', 'per_unit');

-- Tabla de Materiales (Categorías)
CREATE TABLE public.lab_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de Configuraciones (Variantes)
CREATE TABLE public.lab_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    material_id UUID NOT NULL REFERENCES public.lab_materials(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT,
    odoo_product_id TEXT,
    base_price NUMERIC(10,2) NOT NULL DEFAULT 0,
    price_type lab_price_type DEFAULT 'per_unit',
    sla_days INTEGER NOT NULL DEFAULT 3,
    is_express_allowed BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed Data Inicial (Imfohsalab)
-- [Ver archivo completo para INSERT statements]
```

**Verificación:**
```sql
SELECT COUNT(*) FROM lab_materials; -- Debe retornar 4
SELECT COUNT(*) FROM lab_configurations; -- Debe retornar 10
```

---

#### 1.2 Crear RPCs para CRUD
**Archivo:** `supabase/migrations/20260205000071_create_lab_catalog_rpcs.sql`  
**Estado:** Pendiente

**Funciones Requeridas:**
1. `get_lab_materials()` - Listar materiales activos
2. `get_lab_configurations(material_id)` - Listar configuraciones por material
3. `upsert_lab_material(data)` - Crear/Actualizar material
4. `upsert_lab_configuration(data)` - Crear/Actualizar configuración
5. `delete_lab_material(id)` - Soft delete (is_active = false)
6. `delete_lab_configuration(id)` - Soft delete

**Ejemplo:**
```sql
CREATE OR REPLACE FUNCTION get_lab_materials()
RETURNS TABLE (
    id UUID,
    name TEXT,
    description TEXT,
    config_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        m.name,
        m.description,
        COUNT(c.id) as config_count
    FROM lab_materials m
    LEFT JOIN lab_configurations c ON c.material_id = m.id AND c.is_active = true
    WHERE m.is_active = true
    GROUP BY m.id, m.name, m.description
    ORDER BY m.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

#### 1.3 Configurar RLS
**Archivo:** Mismo que 1.1  
**Estado:** Incluido en migración

**Políticas:**
- **Read:** Todos los usuarios autenticados pueden leer.
- **Write:** Solo roles `admin` y `lab_manager` pueden escribir.

**Nota:** Por ahora, políticas permisivas para facilitar desarrollo. Refinar en producción.

---

### **FASE 2: Frontend - Módulo Admin** ⏳

#### 2.1 Crear Estructura de Archivos
**Ubicación:** `src/modules/core/lab-materials/`

**Archivos a Crear:**
```
src/modules/core/lab-materials/
├── page.tsx                    # Página principal
├── components/
│   ├── materials-table.tsx     # Tabla de materiales
│   ├── material-form.tsx       # Formulario crear/editar material
│   ├── configurations-table.tsx # Tabla de configuraciones
│   └── configuration-form.tsx  # Formulario crear/editar config
└── actions/
    └── lab-catalog.ts          # Server actions (CRUD)
```

---

#### 2.2 Implementar Server Actions
**Archivo:** `src/modules/core/lab-materials/actions/lab-catalog.ts`

**Funciones:**
```typescript
export async function getLabMaterials() {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('get_lab_materials');
  return { success: !error, data, error };
}

export async function getLabConfigurations(materialId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('lab_configurations')
    .select('*')
    .eq('material_id', materialId)
    .eq('is_active', true);
  return { success: !error, data, error };
}

export async function upsertLabMaterial(material: LabMaterial) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('lab_materials')
    .upsert(material)
    .select()
    .single();
  return { success: !error, data, error };
}

// ... más funciones
```

---

#### 2.3 Crear UI del Módulo
**Archivo:** `src/modules/core/lab-materials/page.tsx`

**Diseño:**
```
┌─────────────────────────────────────────────────┐
│  Catálogo de Materiales de Laboratorio          │
├─────────────────────────────────────────────────┤
│  [+ Nuevo Material]                             │
├─────────────────────────────────────────────────┤
│  Materiales                                     │
│  ┌──────────────┬──────────┬──────────┐         │
│  │ Nombre       │ Configs  │ Acciones │         │
│  ├──────────────┼──────────┼──────────┤         │
│  │ Zirconio     │ 4        │ [✏️] [🗑️] │         │
│  │ Disilicato   │ 2        │ [✏️] [🗑️] │         │
│  └──────────────┴──────────┴──────────┘         │
│                                                  │
│  [Click en fila para ver configuraciones]       │
│                                                  │
│  Configuraciones de "Zirconio"                  │
│  ┌──────────────┬────────┬──────┬──────────┐    │
│  │ Nombre       │ Precio │ SLA  │ Acciones │    │
│  ├──────────────┼────────┼──────┼──────────┤    │
│  │ Alemán LD004 │ Q890   │ 5d   │ [✏️] [🗑️] │    │
│  │ Monolayer    │ Q890   │ 4d   │ [✏️] [🗑️] │    │
│  └──────────────┴────────┴──────┴──────────┘    │
│  [+ Nueva Configuración]                        │
└─────────────────────────────────────────────────┘
```

**Componentes a Usar:**
- `DataTable` (shadcn/ui)
- `Dialog` para formularios
- `Form` + `react-hook-form` + `zod` para validación

---

#### 2.4 Agregar Ruta al Menú
**Archivo:** `src/components/layout/sidebar.tsx`

**Agregar en sección "Configuración Lab":**
```typescript
{
  title: 'Materiales',
  icon: Package,
  href: '/core/lab-materials',
  roles: ['admin', 'lab_manager']
}
```

---

### **FASE 3: Integración con Wizard** ⏳

#### 3.1 Actualizar Wizard - Paso 1 (Material Selection)
**Archivo:** `src/components/lab/wizard/order-wizard.tsx`

**Cambios:**
- Reemplazar mock data con fetch real de `lab_materials`.
- Usar `getLabMaterials()` en `useEffect`.
- Mostrar materiales dinámicamente.

**Antes:**
```typescript
const materials = [
  { id: 'zirc', name: 'Zirconio' },
  { id: 'emax', name: 'E-MAX' }
];
```

**Después:**
```typescript
const [materials, setMaterials] = useState([]);

useEffect(() => {
  getLabMaterials().then(result => {
    if (result.success) {
      setMaterials(result.data);
    }
  });
}, []);
```

---

#### 3.2 Actualizar Wizard - Paso 2 (Configuration Selection)
**Archivo:** Mismo que 3.1

**Cambios:**
- Al seleccionar material, fetch `lab_configurations` para ese material.
- Mostrar variantes con precio y SLA.
- Calcular fecha de entrega automáticamente basada en `sla_days`.

**Lógica de Fecha:**
```typescript
function calculateDeliveryDate(sladays: number): Date {
  let date = new Date();
  let daysAdded = 0;
  
  while (daysAdded < sladays) {
    date.setDate(date.getDate() + 1);
    // Skip weekends
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      daysAdded++;
    }
  }
  
  return date;
}
```

---

#### 3.3 Implementar Lógica "Orden Express"
**Archivo:** Mismo que 3.1

**UI:**
```tsx
<div className="flex items-center gap-2">
  <Checkbox 
    id="express"
    checked={isExpress}
    onCheckedChange={setIsExpress}
  />
  <Label htmlFor="express">Orden Express</Label>
</div>

{isExpress && (
  <Alert variant="warning">
    <AlertTriangle className="h-4 w-4" />
    <AlertDescription>
      Consulte a su asesor para validar el costo del servicio express.
    </AlertDescription>
  </Alert>
)}

<div>
  <Label>Fecha de Entrega</Label>
  <Input 
    type="date"
    value={deliveryDate}
    onChange={(e) => setDeliveryDate(e.target.value)}
    disabled={!isExpress}
  />
</div>
```

**Backend:**
- Agregar campo `is_express` al payload de creación de orden.
- Guardar en `lab_orders.is_express`.

---

### **FASE 4: Impacto Visual (Kamba & Stats)** ⏳

#### 4.1 Actualizar Tarjetas en Kamba
**Archivo:** `src/modules/lab/components/kanban-board.tsx`

**Cambios:**
```tsx
<Card className={cn(
  "cursor-pointer hover:shadow-lg transition-all",
  order.is_express && "border-red-500 border-2"
)}>
  <CardHeader>
    <div className="flex items-center justify-between">
      <CardTitle>Orden #{order.id.slice(0,8)}</CardTitle>
      {order.is_express && (
        <Badge variant="destructive" className="gap-1">
          <Flame className="h-3 w-3" />
          EXPRESS
        </Badge>
      )}
    </div>
  </CardHeader>
  {/* ... resto del contenido */}
</Card>
```

---

#### 4.2 Actualizar Estadísticas
**Archivo:** `src/modules/lab/components/dashboard-stats.tsx`

**Agregar Métricas:**
- Total Órdenes Express
- % Cumplimiento SLA (Express vs Normal)
- Tiempo Promedio de Entrega (Express vs Normal)

**Query:**
```sql
SELECT 
  COUNT(*) FILTER (WHERE is_express = true) as express_count,
  COUNT(*) FILTER (WHERE is_express = false) as normal_count,
  AVG(EXTRACT(EPOCH FROM (delivered_at - created_at))/86400) 
    FILTER (WHERE is_express = true) as avg_express_days
FROM lab_orders
WHERE status = 'delivered';
```

---

## 📅 Timeline Estimado

| Fase | Tareas | Tiempo Estimado | Prioridad |
|------|--------|-----------------|-----------|
| **1. Backend** | Tablas + RPCs + RLS | 2-3 horas | 🔴 Alta |
| **2. Frontend Admin** | CRUD Module | 4-6 horas | 🔴 Alta |
| **3. Wizard Integration** | Conectar a DB real | 2-3 horas | 🟡 Media |
| **4. Visual Impact** | Kamba + Stats | 1-2 horas | 🟢 Baja |

**Total:** ~10-14 horas de desarrollo

---

## ✅ Checklist de Validación

### Backend
- [ ] Tablas `lab_materials` y `lab_configurations` creadas
- [ ] Seed data insertado (4 materiales, 10 configuraciones)
- [ ] RPCs funcionando correctamente
- [ ] RLS configurado y probado

### Frontend Admin
- [ ] Módulo accesible desde menú
- [ ] Tabla de materiales muestra datos reales
- [ ] Formulario de creación funciona
- [ ] Formulario de edición funciona
- [ ] Soft delete funciona
- [ ] Validaciones de formulario activas

### Wizard
- [ ] Paso 1 muestra materiales de DB
- [ ] Paso 2 muestra configuraciones de DB
- [ ] Precio se calcula correctamente
- [ ] SLA se calcula correctamente
- [ ] Checkbox "Orden Express" funciona
- [ ] Fecha manual solo si Express
- [ ] Advertencia se muestra correctamente

### Visual
- [ ] Tarjetas Express tienen borde rojo
- [ ] Badge "EXPRESS" visible
- [ ] Icono 🔥 presente
- [ ] Estadísticas muestran conteo Express

---

## 🚨 Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Migración SQL falla | Media | Alto | Ejecutar manualmente en Dashboard |
| RLS bloquea acceso | Baja | Medio | Políticas permisivas inicialmente |
| Performance con muchos materiales | Baja | Bajo | Paginación en tabla |
| Conflicto con Odoo sync | Baja | Medio | Campo `odoo_product_id` opcional |

---

## 📚 Documentos de Referencia

- `INSTRUCCIONES/SESSION_2026_01_04_LAB_CATALOG.md` - Contexto completo de la sesión
- `INSTRUCCIONES/DECISIONS.md` - ADR-0021 a ADR-0024
- `INSTRUCCIONES/SUPABASE_SCHEMA.md` - Esquema actual de DB
- `docs/LAB_ORDER_LOGIC.md` - Lógica de negocio de órdenes
- `docs/GUIA_TRABAJOS_DENTALES.md` - Catálogo de servicios

---

**Última Actualización:** 2026-01-04 22:00 CST
