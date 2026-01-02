-- ============================================================================
-- INVESTIGAR Y LIMPIAR DUPLICADOS DE drpedro@clinica.com
-- ============================================================================

-- PASO 1: Ver TODOS los usuarios con email drpedro@clinica.com
SELECT 
    id,
    email,
    name,
    role,
    is_pending_activation,
    created_at
FROM schema_core.users 
WHERE email = 'drpedro@clinica.com'
ORDER BY created_at ASC;

-- PASO 2: Ver TODOS los registros de clinic_staff para drpedro@clinica.com
SELECT 
    cs.id as staff_id,
    cs.user_id,
    cs.clinic_id,
    cs.role,
    cs.title,
    cs.job_position,
    cs.is_primary,
    cs.created_at,
    u.name as user_name,
    u.email,
    c.name as clinic_name
FROM schema_medical.clinic_staff cs
JOIN schema_core.users u ON u.id = cs.user_id
JOIN schema_medical.clinics c ON c.id = cs.clinic_id
WHERE u.email = 'drpedro@clinica.com'
ORDER BY cs.created_at ASC;

-- ============================================================================
-- PASO 3: LIMPIAR DUPLICADOS
-- ============================================================================
-- Ejecutar SOLO después de revisar los resultados de PASO 1 y PASO 2
-- Vamos a mantener el usuario con nombre "Dr Pedro el escamoso" y eliminar el que tiene null

-- 3.1: Identificar el user_id CORRECTO (el que tiene nombre)
-- Deberías ver el ID del usuario con name = 'Dr Pedro el escamoso'

-- 3.2: Identificar el user_id INCORRECTO (el que tiene null como nombre)
-- Deberías ver el ID del usuario con name = null

-- 3.3: Eliminar el registro de clinic_staff del usuario incorrecto
-- REEMPLAZA 'USER_ID_INCORRECTO' con el ID real del usuario sin nombre
DELETE FROM schema_medical.clinic_staff
WHERE user_id = 'USER_ID_INCORRECTO'  -- REEMPLAZAR con el UUID del usuario null
  AND clinic_id IN (SELECT id FROM schema_medical.clinics WHERE name LIKE '%Sonrisas%');

-- 3.4: Eliminar el usuario incorrecto de schema_core.users
-- REEMPLAZA 'USER_ID_INCORRECTO' con el ID real del usuario sin nombre
DELETE FROM schema_core.users
WHERE id = 'USER_ID_INCORRECTO'  -- REEMPLAZAR con el UUID del usuario null
  AND email = 'drpedro@clinica.com'
  AND name IS NULL;

-- ============================================================================
-- PASO 4: VERIFICAR que solo queda un registro
-- ============================================================================

-- 4.1: Verificar usuarios
SELECT 
    id,
    email,
    name,
    role
FROM schema_core.users 
WHERE email = 'drpedro@clinica.com';

-- 4.2: Verificar clinic_staff
SELECT 
    cs.id as staff_id,
    cs.role,
    cs.title,
    u.email,
    u.name as user_name,
    c.name as clinic_name
FROM schema_medical.clinic_staff cs
JOIN schema_core.users u ON u.id = cs.user_id
JOIN schema_medical.clinics c ON c.id = cs.clinic_id
WHERE u.email = 'drpedro@clinica.com';

-- ============================================================================
-- NOTAS:
-- El resultado final debería mostrar SOLO UN registro para drpedro@clinica.com
-- ============================================================================
