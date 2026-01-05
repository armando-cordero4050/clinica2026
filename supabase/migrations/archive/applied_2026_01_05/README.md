# Migraciones Aplicadas - 2026-01-05

Este directorio contiene migraciones que fueron marcadas como `EJECUTAR_AHORA_*` y que ya han sido aplicadas en la base de datos de producción.

## Estado de Verificación

Fecha de verificación: 2026-01-05
Método: Conexión directa a Supabase para verificar existencia de tablas, columnas y RPCs

## Migraciones Archivadas

| Archivo Original | Archivo Archivado | Estado | Verificación |
|-----------------|-------------------|--------|--------------|
| `EJECUTAR_AHORA_fix_appointment_creation.sql` | `APLICADO_fix_appointment_creation.sql` | ✅ Aplicada | RPC `create_appointment_rpc` existe |
| `EJECUTAR_AHORA_create_lab_catalog.sql` | `APLICADO_create_lab_catalog.sql` | ✅ Aplicada | Tabla `public.lab_configurations` existe |
| `EJECUTAR_AHORA_add_logistics.sql` | `APLICADO_add_logistics.sql` | ✅ Aplicada | Columna `shipping_type` en `lab_orders` |
| `EJECUTAR_AHORA_fix_get_doctors.sql` | `APLICADO_fix_get_doctors.sql` | ✅ Aplicada | RPC `get_doctors_rpc` existe |
| `EJECUTAR_AHORA_fix_pricing.sql` | `APLICADO_fix_pricing.sql` | ✅ Aplicada | Columna `margin_gtq` en `clinic_service_prices` |
| `EJECUTAR_AHORA_fix_qnan.sql` | `APLICADO_fix_qnan.sql` | ✅ Aplicada | RPC `get_active_lab_services` con precios |
| `EJECUTAR_AHORA_update_sync_rpc.sql` | `APLICADO_update_sync_rpc.sql` | ✅ Aplicada | RPC `sync_service_from_odoo` actualizado |

## Notas

- Estas migraciones NO deben ejecutarse nuevamente
- Se mantienen como referencia histórica
- Fueron verificadas mediante scripts de diagnóstico en `scripts/verify_migrations.ts`

## Contexto

Estas migraciones fueron creadas como "fixes urgentes" durante el desarrollo y fueron aplicadas manualmente o mediante scripts de deployment. Ahora se archivan para mantener limpio el directorio principal de migraciones.
