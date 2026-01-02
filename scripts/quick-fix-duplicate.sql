-- ============================================================================
-- SCRIPT RÁPIDO: Eliminar registro duplicado de clinic_staff
-- ============================================================================
-- Basado en tu resultado, eliminaremos el registro que tiene user_name = null

-- PASO 1: Eliminar el registro de clinic_staff con staff_id específico
-- (El que tiene user_name = null)
DELETE FROM schema_medical.clinic_staff
WHERE id = 'e8718bdb-e4c9-48b0-af64-3885e7f67e54';

-- PASO 2: Verificar que solo queda un registro
SELECT 
    cs.id as staff_id,
    cs.role,
    cs.title,
    cs.job_position,
    cs.is_primary,
    u.email as user_email,
    u.name as user_name,
    c.name as clinic_name
FROM schema_medical.clinic_staff cs
JOIN schema_core.users u ON u.id = cs.user_id
JOIN schema_medical.clinics c ON c.id = cs.clinic_id
WHERE u.email = 'drpedro@clinica.com';

-- ============================================================================
-- Resultado esperado: SOLO UN registro con user_name = 'Dr Pedro el escamoso'
-- ============================================================================
