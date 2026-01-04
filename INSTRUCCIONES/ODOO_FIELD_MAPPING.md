# Mapeo de Campos: Odoo ↔ DentalFlow

**Fecha:** 2026-01-03  
**Objetivo:** Definir mapeo 1:1 entre campos de Odoo y campos de la aplicación

---

## 📊 Clientes / Clinics

### Campos de Odoo (res.partner)

```python
{
    'id': 7,                                    # INTEGER
    'name': 'Clinica Dental ABC',              # TEXT
    'email': 'contacto@clinicaabc.com',        # TEXT
    'phone': '+502 2345-6789',                 # TEXT
    'mobile': '+502 5555-1234',                # TEXT
    'vat': '12345678-9',                       # TEXT (NIT)
    'street': 'Av. Reforma 10-00',             # TEXT
    'city': 'Guatemala',                       # TEXT
    'country_id': [90, 'Guatemala'],           # MANY2ONE [id, name]
    'property_payment_term_id': [1, '30 días'],# MANY2ONE [id, name]
    'is_company': True,                        # BOOLEAN
    'customer_rank': 1,                        # INTEGER (>0 = es cliente)
}
```

### Campos de App (schema_medical.clinics)

```sql
{
    id: UUID,                                   -- PK
    name: TEXT NOT NULL,                        -- Nombre de la clínica
    email: TEXT,                                -- Email de contacto
    phone: TEXT,                                -- Teléfono principal
    address: TEXT,                              -- Dirección completa
    odoo_id: INTEGER UNIQUE,                    -- ID de Odoo
    payment_policy: TEXT DEFAULT 'cash',        -- 'cash' o 'credit'
    odoo_raw_data: JSONB DEFAULT '{}'::jsonb,   -- Datos completos de Odoo
    clinic_id: UUID,                            -- Multi-tenancy (self-reference)
    created_at: TIMESTAMPTZ DEFAULT NOW(),
    updated_at: TIMESTAMPTZ DEFAULT NOW()
}
```

### Mapeo Propuesto (Manzanas con Manzanas)

| Campo Odoo | Campo App | Transformación | Notas |
|------------|-----------|----------------|-------|
| `id` | `odoo_id` | Directo | Clave única |
| `name` | `name` | Directo | Nombre de la clínica |
| `email` | `email` | Directo | Email principal |
| `phone` \|\| `mobile` | `phone` | COALESCE | Preferir `mobile`, fallback a `phone` |
| `street` + `city` | `address` | Concatenar | `street, city` |
| `property_payment_term_id[0]` | - | No mapear | Solo para referencia |
| `property_payment_term_id[1]` | - | No mapear | Solo para referencia |
| `vat` | - | Guardar en `odoo_raw_data` | No tenemos campo VAT en clinics |
| `country_id` | - | Guardar en `odoo_raw_data` | No tenemos campo country en clinics |
| `is_company` | - | Filtro | Solo sincronizar si `is_company = True` |
| `customer_rank` | - | Filtro | Solo sincronizar si `customer_rank > 0` |
| (todo el objeto) | `odoo_raw_data` | JSON completo | Backup de datos originales |

### Lógica de `payment_policy`

```python
# Determinar payment_policy basado en payment_term_id
if payment_term_id == 1:  # Inmediato
    payment_policy = 'cash'
elif payment_term_id > 1:  # 15 días, 30 días, etc.
    payment_policy = 'credit'
else:
    payment_policy = 'cash'  # Default
```

---

## 📦 Productos / Services

### Campos de Odoo (product.product)

```python
{
    'id': 123,                                  # INTEGER
    'default_code': 'CORONA-001',              # TEXT (SKU)
    'name': 'Corona de Porcelana',             # TEXT
    'categ_id': [5, 'Prótesis'],               # MANY2ONE [id, name]
    'list_price': 1500.00,                     # DECIMAL (precio venta GTQ)
    'standard_price': 800.00,                  # DECIMAL (costo USD)
    'type': 'service',                         # TEXT
    'sale_ok': True,                           # BOOLEAN
    'purchase_ok': False,                      # BOOLEAN
    'active': True,                            # BOOLEAN
    'description': 'Corona de porcelana...',   # TEXT
    'image_1920': '<base64>',                  # BINARY (imagen)
}
```

### Campos de App (schema_lab.services)

```sql
{
    id: UUID,                                   -- PK
    odoo_id: INTEGER UNIQUE,                    -- ID de Odoo
    code: TEXT NOT NULL,                        -- SKU/Código
    name: TEXT NOT NULL,                        -- Nombre del servicio
    category: TEXT,                             -- Categoría
    cost_price_gtq: DECIMAL(10,2),             -- Precio en GTQ
    cost_price_usd: DECIMAL(10,2),             -- Precio en USD
    image_url: TEXT,                            -- URL de imagen
    description: TEXT,                          -- Descripción
    turnaround_days: INTEGER DEFAULT 7,         -- Días de entrega
    is_active: BOOLEAN DEFAULT TRUE,            -- Activo/Inactivo
    raw_data: JSONB DEFAULT '{}'::jsonb,        -- Datos completos de Odoo
    created_at: TIMESTAMPTZ DEFAULT NOW(),
    updated_at: TIMESTAMPTZ DEFAULT NOW()
}
```

### Mapeo Propuesto (Manzanas con Manzanas)

| Campo Odoo | Campo App | Transformación | Notas |
|------------|-----------|----------------|-------|
| `id` | `odoo_id` | Directo | Clave única |
| `default_code` | `code` | Directo | SKU del producto |
| `name` | `name` | Directo | Nombre del servicio |
| `categ_id[1]` | `category` | Extraer nombre | Solo el nombre de la categoría |
| `list_price` | `cost_price_gtq` | Directo | Precio en GTQ |
| `standard_price` | `cost_price_usd` | Directo | Costo en USD |
| `image_1920` | `image_url` | Convertir a URL | Subir a Supabase Storage |
| `description` | `description` | Directo | Descripción del servicio |
| `active` | `is_active` | Directo | Estado activo/inactivo |
| (todo el objeto) | `raw_data` | JSON completo | Backup de datos originales |
| - | `turnaround_days` | Default 7 | No viene de Odoo |

### Lógica de `turnaround_days`

```python
# Mapeo de categoría a días de entrega
TURNAROUND_MAP = {
    'Prótesis': 10,
    'Ortodoncia': 7,
    'Implantes': 14,
    'Coronas': 5,
    'Default': 7
}

turnaround_days = TURNAROUND_MAP.get(category, 7)
```

---

## 🔄 Flujo de Sincronización Simplificado

### Clientes (Odoo → App)

```
1. Fetch de Odoo API
   ↓
   odoo.execute_kw('res.partner', 'search_read', [[
       ('is_company', '=', True),
       ('customer_rank', '>', 0)
   ]], {
       'fields': ['id', 'name', 'email', 'phone', 'mobile', 
                  'vat', 'street', 'city', 'country_id',
                  'property_payment_term_id']
   })

2. Transformación
   ↓
   {
       odoo_id: partner['id'],
       name: partner['name'],
       email: partner['email'],
       phone: partner['mobile'] or partner['phone'],
       address: f"{partner['street']}, {partner['city']}",
       payment_policy: 'credit' if partner['property_payment_term_id'][0] > 1 else 'cash',
       odoo_raw_data: partner  # JSON completo
   }

3. Inserción en Supabase
   ↓
   supabase.table('clinics').upsert({...}, on_conflict='odoo_id')
```

### Productos (Odoo → App)

```
1. Fetch de Odoo API
   ↓
   odoo.execute_kw('product.product', 'search_read', [[
       ('sale_ok', '=', True),
       ('active', '=', True),
       ('type', '=', 'service')
   ]], {
       'fields': ['id', 'default_code', 'name', 'categ_id',
                  'list_price', 'standard_price', 'description',
                  'image_1920']
   })

2. Transformación
   ↓
   {
       odoo_id: product['id'],
       code: product['default_code'],
       name: product['name'],
       category: product['categ_id'][1],
       cost_price_gtq: product['list_price'],
       cost_price_usd: product['standard_price'],
       description: product['description'],
       is_active: product['active'],
       turnaround_days: TURNAROUND_MAP.get(product['categ_id'][1], 7),
       raw_data: product  # JSON completo
   }

3. Inserción en Supabase
   ↓
   supabase.table('services').upsert({...}, on_conflict='odoo_id')
```

---

## ✅ Validaciones

### Antes de Sincronizar

- [ ] Verificar que `odoo_id` no sea NULL
- [ ] Verificar que `name` no esté vacío
- [ ] Verificar que `email` tenga formato válido (si existe)
- [ ] Verificar que `phone` no esté vacío
- [ ] Verificar que `payment_policy` sea 'cash' o 'credit'

### Después de Sincronizar

- [ ] Verificar que el registro se creó en Supabase
- [ ] Verificar que `odoo_raw_data` contiene el JSON completo
- [ ] Verificar que `updated_at` se actualizó
- [ ] Verificar que no hay duplicados por `odoo_id`

---

## 🚫 Campos que NO Sincronizamos

### De Odoo a App

**Clientes:**
- `vat` - No tenemos campo NIT en `clinics`
- `country_id` - No tenemos campo país en `clinics`
- `property_payment_term_id` - Solo usamos para derivar `payment_policy`
- `is_company` - Solo es filtro, no se guarda
- `customer_rank` - Solo es filtro, no se guarda

**Productos:**
- `image_1920` - Por ahora no subimos imágenes (futuro: Supabase Storage)
- `type` - Solo es filtro, no se guarda
- `sale_ok` - Solo es filtro, no se guarda
- `purchase_ok` - No relevante para servicios

### De App a Odoo

**NO sincronizamos de App → Odoo** (unidireccional por ahora)

---

## 📝 Notas Importantes

1. **Sincronización Unidireccional:** Solo Odoo → App, no al revés
2. **Idempotencia:** Podemos ejecutar la sincronización múltiples veces sin duplicar datos
3. **Preservación de Datos:** `odoo_raw_data` guarda el objeto completo de Odoo
4. **Filtros:** Solo sincronizamos clientes (is_company=True) y servicios (sale_ok=True)
5. **Conflictos:** `ON CONFLICT (odoo_id) DO UPDATE` maneja duplicados

---

**Última actualización:** 2026-01-03 20:30
