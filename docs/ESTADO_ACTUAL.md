# 🔄 ESTADO ACTUAL DEL PROYECTO

> **ÚLTIMA ACTUALIZACIÓN**: 2026-01-05 17:11
> **ACTUALIZAR ESTE ARCHIVO**: Al final de cada sesión de trabajo importante

---

## 📊 **RESUMEN EJECUTIVO**

- **Estado General**: ✅ Funcional en desarrollo
- **Módulo Activo**: Lab Orders (Fase 2.5)
- **Último Problema Resuelto**: Foreign Key Lab Orders (2026-01-05)
- **Próximo Hito**: Completar Módulo de Logística (Sprint 1)

---

## 🗄️ **ESQUEMA DE BASE DE DATOS ACTUAL**

### Arquitectura Confirmada (2026-01-05)

```
┌─────────────────────────────────────────────────────┐
│ ESQUEMA: public                                     │
│ - lab_materials          (Catálogo: Materiales)     │
│ - lab_material_types     (Catálogo: Tipos)          │
│ - lab_configurations     (Catálogo: Configs) ⭐     │
│   └─> FUENTE DE VERDAD para frontend               │
└─────────────────────────────────────────────────────┘
                    ↓ FK
┌─────────────────────────────────────────────────────┐
│ ESQUEMA: schema_lab                                 │
│ - lab_orders             (Órdenes de laboratorio)   │
│ - lab_order_items        (Items de órdenes)         │
│   └─> configuration_id → public.lab_configurations │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ ESQUEMA: schema_medical                             │
│ - patients               (Pacientes)                │
│ - appointments           (Citas)                    │
│ - clinical_findings      (Hallazgos/Odontograma)    │
│ - budgets                (Presupuestos)             │
│ - payments               (Pagos)                    │
│ - clinics                (Clínicas)                 │
│ - clinic_staff           (Personal de clínica)      │
│ - clinic_service_prices  (Precios por clínica)      │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ ESQUEMA: auth                                       │
│ - users                  (Usuarios Supabase)        │
└─────────────────────────────────────────────────────┘
```

### ⚠️ Decisión Crítica (NO CAMBIAR sin consultar)
- **Catálogo Lab**: Vive en `public`, NO en `schema_lab`
- **Razón**: Frontend consume `public`, intentar duplicar en `schema_lab` causó errores
- **Fix aplicado**: `FIX_LAB_FK_POINTER.sql` (2026-01-05)

---

## 🔧 **CÓMO CONECTARSE A SUPABASE (Para Agentes IA)**

### Método 1: Scripts TypeScript con exec_sql

```typescript
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceRoleKey);

// Ejecutar SQL
const { data, error } = await supabase.rpc('exec_sql', { 
    sql_query: 'SELECT * FROM public.lab_configurations LIMIT 5' 
});
```

### Método 2: Verificar existencia de tablas/columnas

```typescript
const checkSql = `
SELECT column_name 
FROM information_schema.columns 
WHERE table_schema = 'schema_lab' 
  AND table_name = 'lab_orders' 
  AND column_name = 'shipping_type'
`;
const { data } = await supabase.rpc('exec_sql', { sql_query: checkSql });
```

### Método 3: Verificar RPCs

```typescript
const checkRpc = `
SELECT proname 
FROM pg_proc 
WHERE proname = 'create_lab_order_transaction_v2'
`;
const { data } = await supabase.rpc('exec_sql', { sql_query: checkRpc });
```

### Scripts de Referencia Creados
- ✅ `scripts/verify_migrations.ts` - Verificar migraciones aplicadas
- ✅ `scripts/check_qnan_fix.ts` - Verificar fix específico
- ✅ `scripts/check_lab_rpc.ts` - Verificar RPCs de lab
- ✅ `scripts/sync_lab_catalog.ts` - Sincronizar catálogo (NO usar, obsoleto)

---

## 🚨 **PROBLEMAS ACTUALES**

### ✅ Resueltos (2026-01-05)

1. **Foreign Key Lab Orders** ✅
   - **Problema**: `lab_order_items` apuntaba a `schema_lab.lab_configurations` (vacío)
   - **Solución**: Reapuntado a `public.lab_configurations`
   - **Migración**: `FIX_LAB_FK_POINTER.sql`
   - **Verificado**: ✅ Funcional

2. **Appointments Creation** ✅
   - **Problema**: Columna `price` no existía (debía ser `sale_price_gtq`)
   - **Solución**: `EJECUTAR_AHORA_fix_appointment_creation.sql`
   - **Verificado**: ✅ Funcional

3. **Reorganización de Migraciones** ✅
   - **Problema**: 186 archivos desordenados
   - **Solución**: 35 archivos archivados en carpetas organizadas
   - **Verificado**: ✅ Completado

### ⏳ Pendientes

1. **Módulo de Logística - Sprint 1** (60% completado)
   - ✅ Tablas creadas
   - ✅ RPCs creados
   - ⏳ Componente FileUploader
   - ⏳ Componente ShippingInfoForm
   - ⏳ Integración Google Maps

2. **Órdenes Express** (Documentado, no implementado)
   - ⏳ Checkbox en UI
   - ⏳ Lógica de validación
   - ⏳ Alerta de consulta a asesor
   - ⏳ Cálculo de SLA reducido

---

## 🔑 **CONOCIMIENTO CLAVE DE ESTA SESIÓN**

### Lecciones Aprendidas

1. **No duplicar catálogos entre esquemas**
   - Intentar mantener `lab_configurations` en `public` Y `schema_lab` causó problemas
   - Solución: Un solo esquema como fuente de verdad

2. **Verificar antes de asumir**
   - Siempre verificar en Supabase si una migración está aplicada
   - No confiar solo en la existencia del archivo

3. **exec_sql tiene limitaciones**
   - No puede ejecutar múltiples statements separados por `;` directamente
   - Usar bloques `DO $$ ... END $$` para transacciones complejas
   - Revisar `data.error` además de `error` del RPC

4. **Permisos de esquemas**
   - `schema_lab` requiere `GRANT USAGE` explícito para `service_role`
   - No asumir que los permisos se heredan

### Comandos Útiles Ejecutados Hoy

```bash
# Verificar migraciones
npx tsx scripts/verify_migrations.ts

# Verificar fix específico
npx tsx scripts/check_qnan_fix.ts

# Listar archivos SQL
Get-ChildItem -Path "d:\DentalFlow\supabase\migrations" -Filter "*.sql"

# Contar archivos
(Get-ChildItem -Path "..." -Filter "*.sql" | Measure-Object).Count
```

---

## 📋 **TAREAS COMPLETADAS HOY (2026-01-05)**

- [x] Fix Foreign Key Lab Orders
- [x] Verificación de 7 migraciones `EJECUTAR_AHORA_*`
- [x] Reorganización de 35 archivos de migraciones
- [x] Creación de sistema de documentación (INDEX.md + PROMPTS_SUGERIDOS.md)
- [x] Actualización de PR_LOG.md
- [x] Creación de READMEs en carpetas de archivo

---

## 🎯 **PRÓXIMOS PASOS SUGERIDOS**

1. **Completar Módulo de Logística**
   - Implementar FileUploader component
   - Implementar ShippingInfoForm component
   - Integrar Google Maps API

2. **Implementar Órdenes Express** (Opcional)
   - Definir lógica de pricing
   - Implementar checkbox en wizard
   - Agregar validaciones

3. **Testing End-to-End**
   - Crear orden desde odontograma
   - Verificar flujo completo hasta entrega
   - Validar sincronización con Odoo

---

## 🔄 **CÓMO ACTUALIZAR ESTE DOCUMENTO**

### Al final de cada sesión importante:

1. Actualizar fecha en "ÚLTIMA ACTUALIZACIÓN"
2. Añadir problemas resueltos a sección "PROBLEMAS ACTUALES"
3. Actualizar "TAREAS COMPLETADAS HOY"
4. Añadir lecciones aprendidas a "CONOCIMIENTO CLAVE"
5. Revisar "PRÓXIMOS PASOS SUGERIDOS"

### Comando rápido para actualizar:

```bash
# Abrir archivo
code d:\DentalFlow\docs\ESTADO_ACTUAL.md

# Actualizar secciones relevantes
# Guardar y commit
```

---

**Mantenido por**: Agente IA + Usuario
**Versión**: 1.0

###  Feature - Express Orders Visuals (2026-01-05)
- [x] Implementado badge **EXPRESS** con ícono de fuego 
- [x] Lógica de bordes rojos en tarjetas prioritarias
- [x] Rediseño de **LabStatsGrid** para métricas agrupadas
- [x] Exposición de métrica \express_count\ via RPC
- [x] Limpieza de repositorio (.gitignore + cleanup)
- [x] Migración SQL aplicada via script

###  Próxima Sesión
- Verificar flujo E2E
- Continuar con módulo de Logística

> **�ltima Actualizaci�n (Real):** 2026-01-05 23:13

