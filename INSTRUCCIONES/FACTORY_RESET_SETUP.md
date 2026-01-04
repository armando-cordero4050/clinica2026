# Factory Reset - Instrucciones de Aplicación

## ⚠️ PROBLEMA ACTUAL
El botón "Ejecutar Reset Total" no funciona porque el RPC `factory_reset_all_data()` no existe en Supabase.

## ✅ SOLUCIÓN

### Paso 1: Aplicar Migración en Supabase Dashboard

1. Ve a **Supabase Dashboard** → **SQL Editor**
2. Ejecuta el siguiente SQL:

```sql
CREATE OR REPLACE FUNCTION public.factory_reset_all_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- 1. ESQUEMA MEDICAL
    TRUNCATE TABLE schema_medical.payments CASCADE;
    TRUNCATE TABLE schema_medical.budget_items CASCADE;
    TRUNCATE TABLE schema_medical.budgets CASCADE;
    TRUNCATE TABLE schema_medical.clinical_history CASCADE;
    TRUNCATE TABLE schema_medical.appointments CASCADE;
    TRUNCATE TABLE schema_medical.appointment_services CASCADE;
    TRUNCATE TABLE schema_medical.clinic_service_prices CASCADE;
    TRUNCATE TABLE schema_medical.evolution_procedures CASCADE;
    TRUNCATE TABLE schema_medical.evolution_notes CASCADE;
    TRUNCATE TABLE schema_medical.evolutions CASCADE;
    TRUNCATE TABLE schema_medical.dental_chart CASCADE;
    TRUNCATE TABLE schema_medical.clinical_findings CASCADE;
    TRUNCATE TABLE schema_medical.odontograms CASCADE;
    TRUNCATE TABLE schema_medical.patients CASCADE;
    TRUNCATE TABLE schema_medical.clinic_staff CASCADE;
    TRUNCATE TABLE schema_medical.clinic_invoices CASCADE;
    TRUNCATE TABLE schema_medical.clinics CASCADE;

    -- 2. ESQUEMA LAB
    TRUNCATE TABLE schema_lab.order_items CASCADE;
    TRUNCATE TABLE schema_lab.orders CASCADE;
    TRUNCATE TABLE schema_lab.order_stage_times CASCADE;
    TRUNCATE TABLE schema_lab.order_pauses CASCADE;
    TRUNCATE TABLE schema_lab.courier_locations CASCADE;
    TRUNCATE TABLE schema_lab.courier_assignments CASCADE;
    TRUNCATE TABLE schema_lab.delivery_routes CASCADE;
    TRUNCATE TABLE schema_lab.route_checkpoints CASCADE;
    TRUNCATE TABLE schema_lab.services CASCADE;

    -- 3. ESQUEMA CORE
    TRUNCATE TABLE schema_core.notifications CASCADE;
    TRUNCATE TABLE schema_core.odoo_customers CASCADE;
    TRUNCATE TABLE schema_core.odoo_products CASCADE;
    -- PRESERVE: odoo_sync_log (for debugging and audit)
    -- PRESERVE: service_sync_log (for debugging and audit)
    
    -- Usuarios: Salvamos Super Admin
    DELETE FROM schema_core.users WHERE role != 'super_admin';

    -- FINAL: Asegurar acceso
    IF NOT EXISTS (SELECT 1 FROM schema_core.users WHERE role = 'super_admin') THEN
        INSERT INTO schema_core.users (id, email, role, name, is_active)
        SELECT id, email, 'super_admin', 'Super Admin', true
        FROM auth.users
        WHERE email = 'admin@dentalflow.com'
        LIMIT 1;
    END IF;

    RAISE NOTICE 'Factory reset completed - Sync logs preserved';
END;
$$;

GRANT EXECUTE ON FUNCTION public.factory_reset_all_data() TO authenticated;

COMMENT ON FUNCTION public.factory_reset_all_data() IS 'Factory reset: deletes all business data, keeps super_admin user and sync logs';
```

### Paso 2: Verificar que el RPC existe

Ejecuta este query para verificar:

```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'factory_reset_all_data';
```

Deberías ver 1 resultado.

### Paso 3: Probar el Botón Reset

1. Ve a `/dashboard/settings`
2. Click en "Ejecutar Reset Total"
3. Confirma 2 veces
4. Verás toasts mostrando el progreso:
   - 🔄 Iniciando Factory Reset...
   - 🗑️ Borrando pacientes...
   - 🗑️ Borrando clínicas...
   - 🗑️ Borrando órdenes del laboratorio...
   - 🗑️ Borrando datos de Odoo...
   - 🗑️ Limpiando usuarios...
   - ✅ Factory Reset Completado
   - ℹ️ Los logs de sincronización se han preservado

5. La página se recargará automáticamente después de 2 segundos

## 📋 Qué se BORRA

- ✅ Pacientes
- ✅ Clínicas
- ✅ Órdenes del laboratorio
- ✅ Servicios
- ✅ Presupuestos y pagos
- ✅ Datos sincronizados de Odoo (odoo_customers, odoo_products)
- ✅ Notificaciones
- ✅ Usuarios (excepto super_admin)

## 📋 Qué se PRESERVA

- ✅ **odoo_sync_log** - Historial de sincronizaciones
- ✅ **service_sync_log** - Historial de sincronización de servicios
- ✅ **Usuario super_admin**

## 🐛 Troubleshooting

### Error: "function public.factory_reset_all_data() does not exist"
- **Causa:** No aplicaste la migración
- **Solución:** Ejecuta el SQL del Paso 1

### Error: "permission denied for function factory_reset_all_data"
- **Causa:** Falta el GRANT
- **Solución:** Ejecuta: `GRANT EXECUTE ON FUNCTION public.factory_reset_all_data() TO authenticated;`

### Las clínicas siguen existiendo después del reset
- **Causa:** El RPC falló silenciosamente
- **Solución:** Abre la consola del navegador (F12) y busca errores. Verifica que el RPC existe.
