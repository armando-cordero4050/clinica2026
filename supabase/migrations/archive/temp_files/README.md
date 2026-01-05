# Archivos Temporales - Archivados

Este directorio contiene archivos SQL temporales que fueron creados durante el desarrollo y debugging del proyecto.

## Fecha de Archivo
2026-01-05

## Archivos Incluidos

1. **temp_check_columns.sql** - Script de diagnóstico para verificar columnas
2. **temp_direct_fix_carillas.sql** - Fix temporal para servicio de carillas
3. **temp_fix_carillas_service.sql** - Otro fix para carillas
4. **temp_fix_sync_rpc_columns.sql** - Fix de columnas en RPC de sincronización
5. **temp_update_sync_rpc.sql** - Actualización temporal de RPC de sync

## Estado

Estos archivos fueron creados como soluciones temporales durante el desarrollo. Las soluciones finales fueron integradas en migraciones timestamped oficiales.

## Acción Recomendada

- ✅ Mantener como referencia histórica
- ❌ NO ejecutar en producción
- 📋 Revisar si hay lógica que deba documentarse en migraciones oficiales
