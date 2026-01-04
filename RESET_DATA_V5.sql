-- ==============================================================================
-- RESET DATA V5 - DENTALFLOW (STABLE)
-- Mantiene funciones y esquemas. 
-- Borra solo datos de negocio. Las vistas en public se limpian solas.
-- ==============================================================================

DO $$ 
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
    TRUNCATE TABLE schema_core.odoo_sync_log CASCADE;
    TRUNCATE TABLE schema_core.service_sync_log CASCADE;
    
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

END $$;
