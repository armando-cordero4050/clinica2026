-- ============================================================================
-- RESET COMPLETO - Eliminar todos los datos de Odoo y datos semilla
-- ============================================================================
-- Este script limpia completamente la base de datos para poder
-- sincronizar desde cero con Odoo

-- ============================================================================
-- PASO 1: Eliminar todos los usuarios (excepto super_admin si existe)
-- ============================================================================

DO $$
DECLARE
    v_super_admin_id UUID;
BEGIN
    -- Buscar super_admin
    SELECT id INTO v_super_admin_id 
    FROM schema_core.users 
    WHERE role = 'super_admin' 
    LIMIT 1;
    
    -- Eliminar de auth.users (excepto super_admin)
    IF v_super_admin_id IS NOT NULL THEN
        DELETE FROM auth.users 
        WHERE id != v_super_admin_id;
    ELSE
        DELETE FROM auth.users;
    END IF;
    
    -- Eliminar de schema_core.users (excepto super_admin)
    IF v_super_admin_id IS NOT NULL THEN
        DELETE FROM schema_core.users 
        WHERE id != v_super_admin_id;
    ELSE
        DELETE FROM schema_core.users;
    END IF;
    
    RAISE NOTICE '✅ Usuarios eliminados (excepto super_admin)';
END $$;

-- ============================================================================
-- PASO 2: Eliminar todos los datos de clinic_staff
-- ============================================================================

DO $$
BEGIN
    DELETE FROM schema_medical.clinic_staff;
    RAISE NOTICE '✅ Todos los registros de clinic_staff eliminados';
END $$;

-- ============================================================================
-- PASO 3: Eliminar todas las clínicas
-- ============================================================================

DO $$
BEGIN
    DELETE FROM schema_medical.clinics;
    
    -- Eliminar de schema_core.clinics solo si existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'schema_core' AND table_name = 'clinics') THEN
        DELETE FROM schema_core.clinics;
    END IF;
    
    RAISE NOTICE '✅ Todas las clínicas eliminadas';
END $$;

-- ============================================================================
-- PASO 4: Eliminar todos los pacientes y datos médicos (si existen)
-- ============================================================================

DO $$
BEGIN
    -- Eliminar evolution_notes si existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'schema_medical' AND table_name = 'evolution_notes') THEN
        DELETE FROM schema_medical.evolution_notes;
    END IF;
    
    -- Eliminar clinical_findings si existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'schema_medical' AND table_name = 'clinical_findings') THEN
        DELETE FROM schema_medical.clinical_findings;
    END IF;
    
    -- Eliminar finding_types_config si existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'schema_medical' AND table_name = 'finding_types_config') THEN
        DELETE FROM schema_medical.finding_types_config;
    END IF;
    
    -- Eliminar patients si existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'schema_medical' AND table_name = 'patients') THEN
        DELETE FROM schema_medical.patients;
    END IF;
    
    RAISE NOTICE '✅ Todos los datos médicos eliminados';
END $$;

-- ============================================================================
-- PASO 5: Eliminar órdenes de laboratorio (si existen)
-- ============================================================================

DO $$
BEGIN
    -- Eliminar order_items si existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'schema_lab' AND table_name = 'order_items') THEN
        DELETE FROM schema_lab.order_items;
    END IF;
    
    -- Eliminar orders si existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'schema_lab' AND table_name = 'orders') THEN
        DELETE FROM schema_lab.orders;
    END IF;
    
    RAISE NOTICE '✅ Todas las órdenes de laboratorio eliminadas';
END $$;

-- ============================================================================
-- PASO 6: Limpiar logs de sincronización de Odoo (si existe)
-- ============================================================================

DO $$
BEGIN
    -- Buscar la tabla de logs en cualquier schema
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'odoo_sync_log') THEN
        -- Intentar eliminar de schema_odoo
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'schema_odoo' AND table_name = 'sync_log') THEN
            DELETE FROM schema_odoo.sync_log;
        END IF;
        
        -- Intentar eliminar de public
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'odoo_sync_log') THEN
            DELETE FROM public.odoo_sync_log;
        END IF;
        
        RAISE NOTICE '✅ Logs de sincronización eliminados';
    ELSE
        RAISE NOTICE 'ℹ️  No se encontró tabla de logs de Odoo';
    END IF;
END $$;

-- ============================================================================
-- PASO 7: Resetear secuencias (si existen)
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'schema_lab' AND sequencename = 'orders_sequence_number_seq') THEN
        ALTER SEQUENCE schema_lab.orders_sequence_number_seq RESTART WITH 1;
        RAISE NOTICE '✅ Secuencia de órdenes reseteada';
    END IF;
END $$;

-- ============================================================================
-- VERIFICACIÓN FINAL
-- ============================================================================

SELECT 
    'users' as tabla,
    COUNT(*) as registros
FROM schema_core.users
UNION ALL
SELECT 'clinic_staff', COUNT(*) FROM schema_medical.clinic_staff
UNION ALL
SELECT 'clinics (medical)', COUNT(*) FROM schema_medical.clinics
UNION ALL
SELECT 'clinics (core)', 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'schema_core' AND table_name = 'clinics')
        THEN (SELECT COUNT(*)::bigint FROM schema_core.clinics)
        ELSE 0
    END
UNION ALL
SELECT 'patients', 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'schema_medical' AND table_name = 'patients')
        THEN (SELECT COUNT(*)::bigint FROM schema_medical.patients)
        ELSE 0
    END
UNION ALL
SELECT 'orders', 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'schema_lab' AND table_name = 'orders')
        THEN (SELECT COUNT(*)::bigint FROM schema_lab.orders)
        ELSE 0
    END
ORDER BY tabla;

-- ============================================================================
-- ✅ RESET COMPLETO FINALIZADO
-- Base de datos limpia y lista para sincronizar desde Odoo
-- ============================================================================
