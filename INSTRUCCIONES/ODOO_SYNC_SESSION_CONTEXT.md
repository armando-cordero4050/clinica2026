# Contexto de Sesión: Odoo Sync Debugging

**Fecha:** 2026-01-03  
**Objetivo:** Depurar y arreglar sincronización de Odoo con Supabase

---

## 📋 Resumen Ejecutivo

Estamos trabajando en la integración de Odoo con DentalFlow. El objetivo es sincronizar:
- **Clientes (Clinics)** desde Odoo → Supabase
- **Productos (Services)** desde Odoo → Supabase

### Estado Actual
- ✅ Conexión RPC con Odoo funciona
- ❌ Sincronización de clientes falla por desajuste de campos
- ❌ Sincronización de productos no probada aún

---

## 🔍 Errores Encontrados y Soluciones

### Error 1: Column `odoo_partner_id` vs `odoo_customer_id`
**Problema:** El RPC Phase 2 espera `odoo_customer_id` pero la tabla tiene `odoo_partner_id`

**Solución Aplicada:**
```sql
ALTER TABLE schema_core.odoo_customers 
RENAME COLUMN odoo_partner_id TO odoo_customer_id;
```

**Archivo:** `supabase/migrations/20260205000016_fix_odoo_customer_column_name.sql`

---

### Error 2: Column `mobile` no existe
**Problema:** RPC espera campo `mobile` que no existe en la tabla original

**Solución Aplicada:**
```sql
ALTER TABLE schema_core.odoo_customers 
ADD COLUMN IF NOT EXISTS mobile TEXT;

ALTER TABLE schema_core.odoo_customers 
ADD COLUMN IF NOT EXISTS country_id INTEGER;
```

**Archivo:** `supabase/migrations/20260205000017_add_missing_odoo_customer_columns.sql`

---

### Error 3: Múltiples columnas faltantes
**Problema:** RPC Phase 2 espera columnas que no existen:
- `payment_term_id`
- `payment_term_name`
- `payment_policy`
- `raw_data`
- `updated_at`

**Solución Aplicada:**
```sql
ALTER TABLE schema_core.odoo_customers 
ADD COLUMN IF NOT EXISTS payment_term_id INTEGER;

ALTER TABLE schema_core.odoo_customers 
ADD COLUMN IF NOT EXISTS payment_term_name TEXT;

ALTER TABLE schema_core.odoo_customers 
ADD COLUMN IF NOT EXISTS payment_policy TEXT;

ALTER TABLE schema_core.odoo_customers 
ADD COLUMN IF NOT EXISTS raw_data JSONB DEFAULT '{}'::jsonb;

ALTER TABLE schema_core.odoo_customers 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
```

**Archivo:** `supabase/migrations/20260205000018_add_all_missing_odoo_customer_columns.sql`

---

## 📊 Estructura Actual de Tablas

### `schema_core.odoo_customers` (Después de migraciones)

```sql
CREATE TABLE schema_core.odoo_customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    odoo_customer_id INTEGER UNIQUE NOT NULL,  -- ✅ Renombrado
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    mobile TEXT,                                -- ✅ Agregado
    vat TEXT,
    street TEXT,
    city TEXT,
    country TEXT,                               -- ⚠️ Existe pero RPC usa country_id
    country_id INTEGER,                         -- ✅ Agregado
    is_company BOOLEAN DEFAULT FALSE,
    payment_term_id INTEGER,                    -- ✅ Agregado
    payment_term_name TEXT,                     -- ✅ Agregado
    payment_policy TEXT,                        -- ✅ Agregado
    raw_data JSONB DEFAULT '{}'::jsonb,        -- ✅ Agregado
    last_synced TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),       -- ✅ Agregado
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `schema_medical.clinics` (Tabla de negocio)

```sql
CREATE TABLE schema_medical.clinics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    odoo_id INTEGER UNIQUE,
    payment_policy TEXT DEFAULT 'cash',
    odoo_raw_data JSONB DEFAULT '{}'::jsonb,
    clinic_id UUID,  -- Multi-tenancy
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🔄 Flujo de Sincronización Actual

```
Odoo API
   ↓
TypeScript Action (src/modules/odoo/actions/sync.ts)
   ↓
Supabase RPC: sync_clinic_from_odoo(13 params)
   ↓
1. INSERT/UPDATE → schema_core.odoo_customers
2. INSERT/UPDATE → schema_medical.clinics
```

---

## 🐛 Sistema de Logging

**Archivo:** `INSTRUCCIONES/ODOO_SYNC_LOG.md`

**Utilidad:** `src/modules/odoo/utils/sync-logger.ts`

**Funciones:**
- `logSyncStart(module)` - Registra inicio
- `logSyncSuccess(module, data)` - Registra éxito
- `logSyncError(module, error, context)` - Registra error

---

## 📁 Archivos Clave

### Migraciones
- `supabase/migrations/20260130000013_odoo_integration_module.sql` - Migración original
- `supabase/migrations/20260205000015_odoo_phase2_logic.sql` - RPC Phase 2
- `supabase/migrations/20260205000016_fix_odoo_customer_column_name.sql` - Fix 1
- `supabase/migrations/20260205000017_add_missing_odoo_customer_columns.sql` - Fix 2
- `supabase/migrations/20260205000018_add_all_missing_odoo_customer_columns.sql` - Fix 3

### Código TypeScript
- `src/modules/odoo/actions/sync.ts` - Lógica de sincronización
- `src/modules/odoo/utils/sync-logger.ts` - Sistema de logging
- `src/modules/odoo/lib/odoo-client.ts` - Cliente RPC Odoo

### Documentación
- `INSTRUCCIONES/ODOO_SYNC_LOG.md` - Log de sincronización
- `INSTRUCCIONES/ERRORES_Y_SOLUCIONES.md` - Errores y soluciones
- `docs/DECISIONS.md` - Decisiones de arquitectura

---

## 🎯 Próximos Pasos (Nueva Estrategia)

### 1. Mapeo Limpio de Campos (Manzanas con Manzanas)

**Objetivo:** Alinear campos de Odoo con campos de la app 1:1

**Campos de Odoo Partner (res.partner):**
```python
{
    'id': int,
    'name': str,
    'email': str,
    'phone': str,
    'mobile': str,
    'vat': str,
    'street': str,
    'city': str,
    'country_id': [id, name],
    'property_payment_term_id': [id, name],
    'property_payment_policy': str
}
```

**Campos de App (schema_medical.clinics):**
```sql
{
    id: UUID,
    name: TEXT,
    email: TEXT,
    phone: TEXT,
    address: TEXT,
    odoo_id: INTEGER,
    payment_policy: TEXT
}
```

**Mapeo Propuesto:**
```
Odoo.id                          → clinics.odoo_id
Odoo.name                        → clinics.name
Odoo.email                       → clinics.email
Odoo.phone OR Odoo.mobile        → clinics.phone
Odoo.street + Odoo.city          → clinics.address
Odoo.property_payment_policy     → clinics.payment_policy
```

### 2. Scripts Python Aislados

**Script 1:** `scripts/test_odoo_connection.py`
- Probar conexión con Odoo
- Listar primeros 5 partners
- Mostrar estructura de datos

**Script 2:** `scripts/test_odoo_sync.py`
- Sincronizar 1 partner de Odoo → Supabase
- Mostrar antes/después
- Validar datos

**Script 3:** `scripts/test_supabase_read.py`
- Leer datos de `odoo_customers`
- Leer datos de `clinics`
- Mostrar relación

**Script 4:** `scripts/test_supabase_write.py`
- Insertar registro de prueba
- Actualizar registro
- Eliminar registro

**Script 5:** `scripts/demo_complete_sync.py`
- Demo end-to-end completo
- Sincronizar 10 clientes
- Generar reporte

---

## 🔧 Configuración Necesaria

### Variables de Entorno (.env.local)
```bash
# Odoo
ODOO_URL=https://imfohsalab.odoo.com
ODOO_DB=imfohsalab
ODOO_USERNAME=admin@imfohsalab.com
ODOO_PASSWORD=***

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://***
NEXT_PUBLIC_SUPABASE_ANON_KEY=***
SUPABASE_SERVICE_ROLE_KEY=***
```

### Dependencias Python
```bash
pip install python-dotenv supabase xmlrpc
```

---

## 📝 Decisiones de Diseño

### 1. ¿Por qué dos tablas? (`odoo_customers` + `clinics`)

**Razón:** Separación de responsabilidades
- `odoo_customers` = Tabla de sincronización (espejo de Odoo)
- `clinics` = Tabla de negocio (lógica de la app)

**Ventaja:** 
- Podemos resincronizar sin afectar lógica de negocio
- Auditabilidad: sabemos qué vino de Odoo vs qué modificó el usuario

### 2. ¿Por qué `country_id` INTEGER y `country` TEXT?

**Problema:** Odoo usa relaciones many2one que devuelven `[id, name]`

**Solución Actual:** Guardar ambos
- `country_id` = ID de Odoo
- `country` = Nombre del país (legacy)

**Propuesta:** Eliminar `country` TEXT y usar solo `country_id`

### 3. ¿Por qué `raw_data` JSONB?

**Razón:** Flexibilidad
- Odoo puede tener campos custom
- No queremos perder información
- Facilita debugging

---

## ⚠️ Problemas Conocidos

### Error 4: Column `odoo_id` no existe en `clinics`
**Problema:** RPC Phase 2 espera `odoo_id` en tabla `clinics` pero existe `odoo_partner_id`

**Solución Aplicada:**
```sql
ALTER TABLE schema_medical.clinics 
ADD COLUMN IF NOT EXISTS odoo_id INTEGER UNIQUE;

UPDATE schema_medical.clinics 
SET odoo_id = odoo_partner_id 
WHERE odoo_partner_id IS NOT NULL AND odoo_id IS NULL;
```

**Archivo:** `supabase/migrations/20260205000019_add_odoo_id_to_clinics.sql`

---

## 🎉 Solución Final y Validación

### 1. Filtro de "Administrator"
**Problema:** Sincronización traía al usuario admin de Odoo como una clínica.
**Solución:** Se implementó filtro en `sync.ts` para omitir IDs ≤ 6 y nombres reservados.

### 2. Factory Reset Completo
**Implementación:** Nuevo RPC `factory_reset_all_data` que:
- Borra TODOS los datos de negocio
- PRESERVA el usuario super_admin
- PRESERVA los logs de sincronización (`odoo_sync_log`, `service_sync_log`)
- Feedback visual con toasts en UI

### 3. Resultado Final
- ✅ **Sincronización:** Exitosa (100%), 0 errores
- ✅ **Datos:** Clinica 1 y Clinica 2 sincronizadas correctamente
- ✅ **Logs:** Visibles y preservados post-reset
- ✅ **Reset:** Funcional y seguro

**Última actualización:** 2026-01-03 21:15 - ✅ PROYECTO ESTABILIZADO
