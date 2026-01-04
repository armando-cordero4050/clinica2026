-- Factory Reset RPC Function
-- Date: 2026-01-03
-- Purpose: Enable factory reset button to delete all business data

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

    RAISE NOTICE 'Factory reset completed successfully';
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.factory_reset_all_data() TO authenticated;

-- Add comment
COMMENT ON FUNCTION public.factory_reset_all_data() IS 'Factory reset: deletes all business data, keeps super_admin user';
