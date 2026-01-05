# Fixes Consolidados - Archivados

Este directorio contiene archivos de fixes y correcciones que fueron aplicados durante el desarrollo del proyecto.

## Fecha de Archivo
2026-01-05

## Categorías de Fixes

### 1. Fixes de RPC
- `fix_clinic_rpc.sql` / `fix_clinic_rpc_v2.sql`
- `fix_service_rpc_v2.sql`
- `fix_sync_staff_rpc_v2.sql` / `v3.sql` / `v4.sql`
- `fix_update_sla_config_rpc.sql` / `v2.sql`
- `create_get_users_with_sessions_rpc.sql`
- `fix_get_users_with_sessions_v2.sql` / `v3.sql`

### 2. Fixes de Datos
- `fix_duplicate_users_and_trigger.sql`
- `fix_id_mismatch_drpedro.sql`
- `fix_sync_and_clinics.sql`

### 3. Fixes de Permisos
- `fix_services_permissions.sql`

### 4. Fixes de Schema Lab (Críticos - 2026-01-05)
- `FIX_LAB_FK_POINTER.sql` - **Reapunta FK de lab_order_items a public.lab_configurations**
- `FIX_SYNC_LAB_DATA.sql` - Intento de sincronización de catálogo (superseded por FIX_LAB_FK_POINTER)

### 5. Archivos de Diagnóstico
- `diagnostic_user_mismatch.sql`
- `test_debug.sql`
- `select_1.sql`

### 6. Otros
- `add_clinic_invoices.sql`
- `CLEANUP_medical_module.sql`
- `sync_staff_rpc.sql`

## Estado

La mayoría de estos fixes fueron aplicados manualmente o integrados en migraciones timestamped posteriores. Se mantienen como referencia histórica.

## Fixes Críticos Aplicados Hoy (2026-01-05)

- ✅ **FIX_LAB_FK_POINTER.sql**: Aplicado - Resuelve error de Foreign Key en órdenes de laboratorio
- ⚠️ **FIX_SYNC_LAB_DATA.sql**: No aplicado (solución alternativa implementada)

## Acción Recomendada

- ✅ Mantener como referencia histórica
- ❌ NO ejecutar en producción sin verificación previa
- 📋 Documentar lecciones aprendidas en DECISIONS.md
