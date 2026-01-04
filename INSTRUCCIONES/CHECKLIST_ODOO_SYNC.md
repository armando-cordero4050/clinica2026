# ✅ CHECKLIST PRE-SINCRONIZACIÓN ODOO (Fase 2)

**Fecha:** 2026-01-03  
**Usuario:** Probando módulo Core - Sincronización Odoo

---

## 🔍 VERIFICACIONES ANTES DE SINCRONIZAR

### 1. ✅ Migración de Base de Datos (Fase 2)

**Archivo:** `supabase/migrations/20260205000015_odoo_phase2_logic.sql`

**Columnas que deben existir:**
- [ ] `schema_core.odoo_customers.payment_term_id` (INTEGER)
- [ ] `schema_core.odoo_customers.payment_term_name` (TEXT)
- [ ] `schema_core.odoo_customers.payment_policy` (TEXT)
- [ ] `schema_core.odoo_customers.raw_data` (JSONB)
- [ ] `schema_core.odoo_products.raw_data` (JSONB)
- [ ] `schema_lab.services.raw_data` (JSONB)
- [ ] `schema_medical.clinics.payment_policy` (TEXT)
- [ ] `schema_medical.clinics.odoo_raw_data` (JSONB)
- [ ] `schema_core.odoo_field_mappings.is_visible` (BOOLEAN)
- [ ] `schema_core.odoo_field_mappings.can_read` (BOOLEAN)
- [ ] `schema_core.odoo_field_mappings.can_write` (BOOLEAN)

**RPCs actualizados:**
- [ ] `public.sync_clinic_from_odoo` - Acepta nuevos parámetros (payment_policy, raw_data)
- [ ] `public.sync_service_from_odoo` - Acepta raw_data

### 2. ✅ Código de Sincronización Actualizado

**Archivo:** `src/modules/odoo/actions/sync.ts`

**Funciones implementadas:**
- [x] `normalizeOdooValue()` - Normaliza valores falsos de Odoo
- [x] `normalizeObject()` - Normaliza objetos completos
- [x] `syncCustomersFromOdoo()` - Sincronización total con `fields: []`
- [x] `syncProductsFromOdoo()` - Sincronización total con `fields: []`
- [x] `syncInvoicesFromOdoo()` - Sincronización total con `fields: []`
- [x] `syncStaffFromOdoo()` - Sincronización total con `fields: []`

**Lógica de Payment Policy:**
- [x] Detecta `property_payment_term_id` de Odoo
- [x] Determina si es 'cash' o 'credit'
- [x] Almacena en `odoo_customers` y `clinics`

### 3. ⚠️ Configuración de Odoo

**IMPORTANTE:** Verifica que tengas configurado Odoo de una de estas formas:

#### Opción A: Base de Datos (Recomendado)
```sql
-- Verifica si existe configuración en DB
SELECT * FROM schema_core.odoo_config WHERE is_active = true;
```

Si NO existe, inserta una:
```sql
INSERT INTO schema_core.odoo_config (url, database, username, api_key, is_active)
VALUES (
  'http://localhost:8069',  -- Tu URL de Odoo
  'odoo',                   -- Nombre de tu base de datos Odoo
  'admin',                  -- Usuario de Odoo
  'admin',                  -- Contraseña/API Key
  true
);
```

#### Opción B: Variables de Entorno (.env)
```env
ODOO_URL=http://localhost:8069
ODOO_DB=odoo
ODOO_USERNAME=admin
ODOO_PASSWORD=admin
```

### 4. ⚠️ Odoo Debe Estar Corriendo

**Verifica que Odoo esté accesible:**
- [ ] Odoo está corriendo (Docker o local)
- [ ] Puedes acceder a la URL configurada
- [ ] Las credenciales son correctas

**Para verificar con Docker:**
```bash
docker ps | grep odoo
```

**Para probar conexión:**
- Navega a la URL de Odoo en el navegador
- Intenta hacer login con las credenciales

### 5. ✅ Datos de Prueba en Odoo

**Asegúrate de tener en Odoo:**
- [ ] Al menos 1 cliente/partner con `customer_rank > 0`
- [ ] Al menos 1 producto con `sale_ok = true`
- [ ] (Opcional) Facturas en estado 'posted'

---

## 🚀 CÓMO SINCRONIZAR

### Desde la UI de DentalFlow:

1. **Navega a:** `/dashboard/admin/odoo`
2. **Verifica conexión:** Click en "Probar Conexión"
   - Debe mostrar: ✅ "Conexión exitosa. UID: X"
3. **Sincronizar:**
   - Click en "Sincronizar Clientes" (probará la Fase 2)
   - Click en "Sincronizar Productos"
   - O click en "Sincronizar Todo"

### Desde el Código (Server Action):

```typescript
import { syncCustomersFromOdoo, syncProductsFromOdoo } from '@/modules/odoo/actions/sync'

// Sincronizar clientes
const result = await syncCustomersFromOdoo()
console.log(result)

// Sincronizar productos
const result2 = await syncProductsFromOdoo()
console.log(result2)
```

---

## 🔍 QUÉ ESPERAR (Fase 2)

### Sincronización de Clientes

**Antes (Fase 1):**
- Solo traía campos básicos: name, email, phone

**Ahora (Fase 2):**
- ✅ Trae TODOS los campos de Odoo (`fields: []`)
- ✅ Detecta política de pago (cash/credit) basado en `property_payment_term_id`
- ✅ Normaliza valores `false/null` → `""` o `0`
- ✅ Almacena objeto completo en `raw_data` (JSONB)
- ✅ Actualiza tanto `odoo_customers` como `clinics` atómicamente

**Ejemplo de datos guardados:**
```json
{
  "odoo_customer_id": 7,
  "name": "Clínica Dental ABC",
  "email": "contacto@clinicaabc.com",
  "phone": "+502 1234-5678",
  "payment_term_id": 2,
  "payment_term_name": "30 Days",
  "payment_policy": "credit",
  "raw_data": {
    "id": 7,
    "name": "Clínica Dental ABC",
    "email": "contacto@clinicaabc.com",
    "phone": "+502 1234-5678",
    "mobile": false,  // ← Normalizado a ""
    "vat": "12345678-9",
    "street": "Calle Principal",
    "city": "Guatemala",
    "country_id": [90, "Guatemala"],
    "property_payment_term_id": [2, "30 Days"],
    // ... TODOS los demás campos de Odoo
  }
}
```

### Sincronización de Productos

**Ahora incluye:**
- ✅ Todos los campos de Odoo
- ✅ `raw_data` completo
- ✅ Normalización de valores

---

## ⚠️ POSIBLES ERRORES Y SOLUCIONES

### Error: "No hay configuración de Odoo activa"
**Solución:** Configura Odoo en DB o en `.env` (ver sección 3)

### Error: "Error de conexión: ECONNREFUSED"
**Solución:** Odoo no está corriendo. Inicia Docker o servidor Odoo

### Error: "function sync_clinic_from_odoo does not exist"
**Solución:** La migración no se aplicó. Ejecuta:
```bash
npx ts-node scripts/apply_migration.ts supabase/migrations/20260205000015_odoo_phase2_logic.sql
```

### Error: "column 'payment_policy' does not exist"
**Solución:** Misma que arriba, aplica la migración

### Error: "Cannot read property 'property_payment_term_id'"
**Solución:** Normal, algunos clientes no tienen términos de pago. El código maneja esto.

---

## 📊 VERIFICAR RESULTADOS

### En Supabase:

```sql
-- Ver clientes sincronizados con política de pago
SELECT 
  odoo_customer_id,
  name,
  payment_policy,
  payment_term_name,
  jsonb_pretty(raw_data) as raw_data_preview
FROM schema_core.odoo_customers
LIMIT 5;

-- Ver clínicas con política de pago
SELECT 
  id,
  name,
  payment_policy,
  odoo_id
FROM schema_medical.clinics
WHERE odoo_id IS NOT NULL;

-- Ver productos con raw_data
SELECT 
  odoo_product_id,
  name,
  jsonb_pretty(raw_data) as raw_data_preview
FROM schema_core.odoo_products
LIMIT 5;

-- Ver log de sincronización
SELECT * FROM schema_core.odoo_sync_log
ORDER BY created_at DESC
LIMIT 10;
```

---

## ✅ CHECKLIST FINAL

Antes de sincronizar, confirma:

- [ ] Migración `20260205000015_odoo_phase2_logic.sql` aplicada
- [ ] Odoo está corriendo y accesible
- [ ] Configuración de Odoo está en DB o `.env`
- [ ] Hay datos de prueba en Odoo (clientes y productos)
- [ ] El código de `sync.ts` está actualizado (con normalización)

**Si todos los checks están OK, ¡puedes sincronizar! 🚀**

---

**Última actualización:** 2026-01-03 19:06
