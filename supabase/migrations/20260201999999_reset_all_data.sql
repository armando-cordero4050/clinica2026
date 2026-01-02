
-- ==============================================================================
-- RESET COMPLETO DE DATOS (Mantiene Estructura y Sincroniza Admin)
-- ==============================================================================
-- 1. LIMPIEZA TOTAL DE TABLAS DE NEGOCIO
TRUNCATE TABLE schema_lab.order_items CASCADE;
TRUNCATE TABLE schema_lab.orders CASCADE;
TRUNCATE TABLE schema_lab.services CASCADE; 
TRUNCATE TABLE schema_medical.clinic_service_prices CASCADE;
TRUNCATE TABLE schema_medical.evolution_notes CASCADE;
TRUNCATE TABLE schema_medical.clinical_findings CASCADE;
TRUNCATE TABLE schema_medical.finding_types_config CASCADE;
TRUNCATE TABLE schema_medical.appointments CASCADE;
TRUNCATE TABLE schema_medical.patients CASCADE;
TRUNCATE TABLE schema_medical.clinic_staff CASCADE;
TRUNCATE TABLE schema_medical.clinics CASCADE;
TRUNCATE TABLE schema_core.odoo_sync_log CASCADE;

-- 2. LIMPIEZA TOTAL DE USUARIOS 
-- Usamos WHERE true para calmar al parser de Supabase/pg-safeupdate que requiere WHERE en DELETEs
DELETE FROM schema_core.users WHERE true;

-- 3. INSERTAR ADMIN SINCRONIZADO CON AUTH
INSERT INTO schema_core.users (
    id, 
    email, 
    role, 
    is_active, 
    name, 
    is_pending_activation
)
SELECT 
    id, 
    email, 
    'super_admin', 
    true, 
    'Super Admin', 
    false
FROM auth.users 
WHERE email = 'admin@dentalflow.com';

-- 4. FALLBACK 
INSERT INTO schema_core.users (
    id, 
    email, 
    role, 
    is_active, 
    name, 
    is_pending_activation
)
SELECT 
    '00000000-0000-0000-0000-000000000000', 
    'admin@dentalflow.com', 
    'super_admin', 
    true, 
    'Super Admin', 
    false
WHERE NOT EXISTS (SELECT 1 FROM schema_core.users WHERE email = 'admin@dentalflow.com');
