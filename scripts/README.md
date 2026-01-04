# Scripts de Prueba: Odoo Sync

Scripts Python aislados para probar la sincronización de Odoo con Supabase.

---

## 📋 Requisitos

### Python
```bash
python --version  # Python 3.8+
```

### Dependencias
```bash
cd scripts
pip install -r requirements.txt
```

**Dependencias instaladas:**
- `python-dotenv` - Cargar variables de entorno
- `supabase` - Cliente de Supabase para Python

### Variables de Entorno

Asegúrate de tener configurado `.env.local` en la raíz del proyecto:

```bash
# Odoo
ODOO_URL=https://imfohsalab.odoo.com
ODOO_DB=imfohsalab
ODOO_USERNAME=admin@imfohsalab.com
ODOO_PASSWORD=tu_password

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

---

## 🧪 Scripts Disponibles

### 1. Test de Conexión con Odoo

**Archivo:** `test_odoo_connection.py`

**Propósito:** Verificar que la conexión con Odoo funciona correctamente.

**Qué hace:**
- ✅ Conecta a Odoo XML-RPC API
- ✅ Autentica con credenciales
- ✅ Lista primeros 5 partners (clientes)
- ✅ Lista primeros 5 productos (servicios)
- ✅ Guarda datos en JSON para referencia

**Cómo ejecutar:**
```bash
cd d:\DentalFlow
python scripts/test_odoo_connection.py
```

**Archivos generados:**
- `scripts/odoo_partners_sample.json` - Datos de partners
- `scripts/odoo_products_sample.json` - Datos de productos

**Salida esperada:**
```
🚀 Iniciando tests de conexión con Odoo...

============================================================
TEST 1: Conexión con Odoo
============================================================

📡 Conectando a: https://imfohsalab.odoo.com
📊 Base de datos: imfohsalab
👤 Usuario: admin@imfohsalab.com

✅ Autenticación exitosa! UID: 2

📦 Versión de Odoo:
   - Server: 16.0
   - Protocol: 1.0

============================================================
TEST 2: Listar Partners (Clientes)
============================================================

📋 Encontrados 5 partners (mostrando primeros 5)

────────────────────────────────────────────────────────────
Partner #1
────────────────────────────────────────────────────────────
ID:       7
Nombre:   Clinica 1
Email:    clinica1@example.com
...
```

---

### 2. Test de Operaciones en Supabase

**Archivo:** `test_supabase_operations.py`

**Propósito:** Verificar lectura y escritura en Supabase.

**Qué hace:**
- ✅ Conecta a Supabase
- ✅ Lee clínicas existentes
- ✅ Lee servicios existentes
- ✅ Inserta clínica de prueba
- ✅ Actualiza clínica de prueba
- ✅ Elimina clínica de prueba

**Cómo ejecutar:**
```bash
cd d:\DentalFlow
python scripts/test_supabase_operations.py
```

**Archivos generados:**
- `scripts/supabase_clinics_sample.json` - Datos de clínicas
- `scripts/supabase_services_sample.json` - Datos de servicios

**Salida esperada:**
```
🚀 Iniciando tests de Supabase...

============================================================
TEST 1: Conexión con Supabase
============================================================

📡 Conectando a: https://tu-proyecto.supabase.co
✅ Cliente de Supabase creado exitosamente

============================================================
TEST 2: Leer Clínicas (schema_medical.clinics)
============================================================

📋 Encontradas 3 clínicas (mostrando primeras 5)
...
```

---

### 3. Demo de Sincronización Completa

**Archivo:** `demo_complete_sync.py`

**Propósito:** Sincronizar datos de Odoo a Supabase (end-to-end).

**Qué hace:**
- ✅ Conecta a Odoo y Supabase
- ✅ Obtiene partners de Odoo
- ✅ Transforma partners → clinics
- ✅ Sincroniza clinics en Supabase
- ✅ Obtiene productos de Odoo
- ✅ Transforma productos → services
- ✅ Sincroniza services en Supabase
- ✅ Genera reporte de sincronización

**Cómo ejecutar:**
```bash
cd d:\DentalFlow
python scripts/demo_complete_sync.py
```

**Archivos generados:**
- `scripts/sync_report.json` - Reporte de sincronización

**Salida esperada:**
```
🚀 DEMO: Sincronización Completa Odoo → Supabase

============================================================
PASO 1: Conectando a Odoo
============================================================
✅ Conectado a Odoo (UID: 2)

============================================================
PASO 2: Conectando a Supabase
============================================================
✅ Conectado a Supabase

============================================================
PASO 3: Obteniendo Partners de Odoo (límite: 10)
============================================================
📋 Encontrados 6 partners
✅ Datos obtenidos de 6 partners

============================================================
PASO 4: Sincronizando 6 Clinics a Supabase
============================================================

[1/6] Sincronizando: Clinica 1
   Odoo ID: 7
   Email: clinica1@example.com
   Phone: +502 5555-1234
   Payment: credit
   ✅ Sincronizado (ID: abc-123-def)

...

============================================================
RESUMEN DE SINCRONIZACIÓN
============================================================

📊 Clínicas:
   ✅ Sincronizadas: 6
   ❌ Errores: 0

📦 Servicios:
   ✅ Sincronizados: 5
   ❌ Errores: 0

🎯 Total:
   ✅ Sincronizados: 11
   ❌ Errores: 0

💾 Reporte guardado en 'scripts/sync_report.json'

============================================================
✅ SINCRONIZACIÓN COMPLETADA
============================================================
```

---

## 🔍 Troubleshooting

### Error: "ModuleNotFoundError: No module named 'dotenv'"

**Solución:**
```bash
pip install python-dotenv
```

### Error: "ModuleNotFoundError: No module named 'supabase'"

**Solución:**
```bash
pip install supabase
```

### Error: "Authentication failed"

**Causa:** Credenciales de Odoo incorrectas

**Solución:**
1. Verifica que `.env.local` tenga las credenciales correctas
2. Verifica que el usuario tenga permisos en Odoo
3. Verifica que la URL de Odoo sea correcta

### Error: "column 'odoo_id' does not exist"

**Causa:** Tabla de Supabase no tiene la columna `odoo_id`

**Solución:**
1. Aplica las migraciones pendientes en Supabase
2. Verifica que las tablas `clinics` y `services` tengan la columna `odoo_id`

### Error: "Invalid API key"

**Causa:** Service Role Key de Supabase incorrecta

**Solución:**
1. Ve a Supabase Dashboard → Settings → API
2. Copia el "service_role" key (NO el "anon" key)
3. Actualiza `SUPABASE_SERVICE_ROLE_KEY` en `.env.local`

---

## 📊 Estructura de Datos

### Partner de Odoo → Clinic de App

```python
# Odoo Partner
{
    'id': 7,
    'name': 'Clinica 1',
    'email': 'clinica1@example.com',
    'phone': '+502 2345-6789',
    'mobile': '+502 5555-1234',
    'street': 'Av. Reforma 10-00',
    'city': 'Guatemala',
    'property_payment_term_id': [2, '30 días']
}

# App Clinic
{
    'odoo_id': 7,
    'name': 'Clinica 1',
    'email': 'clinica1@example.com',
    'phone': '+502 5555-1234',  # Preferir mobile
    'address': 'Av. Reforma 10-00, Guatemala',
    'payment_policy': 'credit',  # Derivado de payment_term_id
    'odoo_raw_data': {...}  # JSON completo del partner
}
```

### Producto de Odoo → Service de App

```python
# Odoo Product
{
    'id': 123,
    'default_code': 'CORONA-001',
    'name': 'Corona de Porcelana',
    'categ_id': [5, 'Prótesis'],
    'list_price': 1500.00,
    'standard_price': 800.00,
    'active': True
}

# App Service
{
    'odoo_id': 123,
    'code': 'CORONA-001',
    'name': 'Corona de Porcelana',
    'category': 'Prótesis',
    'cost_price_gtq': 1500.00,
    'cost_price_usd': 800.00,
    'turnaround_days': 10,  # Derivado de categoría
    'is_active': True,
    'raw_data': {...}  # JSON completo del producto
}
```

---

## 📝 Notas Importantes

1. **Scripts Aislados:** Estos scripts NO afectan la aplicación principal
2. **Idempotencia:** Puedes ejecutar los scripts múltiples veces sin duplicar datos
3. **Datos de Prueba:** El script de Supabase crea y elimina datos de prueba automáticamente
4. **Logs Detallados:** Todos los scripts imprimen logs detallados para debugging
5. **Archivos JSON:** Los datos se guardan en JSON para análisis posterior

---

## 🚀 Próximos Pasos

Después de ejecutar los scripts exitosamente:

1. ✅ Verificar que la conexión con Odoo funciona
2. ✅ Verificar que la conexión con Supabase funciona
3. ✅ Revisar los archivos JSON generados
4. ✅ Ejecutar sincronización completa
5. ✅ Verificar datos en Supabase Dashboard
6. ⏭️ Integrar lógica en la aplicación TypeScript

---

## 📚 Documentación Relacionada

- [ODOO_SYNC_SESSION_CONTEXT.md](../INSTRUCCIONES/ODOO_SYNC_SESSION_CONTEXT.md) - Contexto completo de la sesión
- [ODOO_FIELD_MAPPING.md](../INSTRUCCIONES/ODOO_FIELD_MAPPING.md) - Mapeo detallado de campos
- [Odoo XML-RPC API](https://www.odoo.com/documentation/16.0/developer/reference/external_api.html)
- [Supabase Python Client](https://supabase.com/docs/reference/python/introduction)

---

**Última actualización:** 2026-01-03 20:35
