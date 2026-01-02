-- ELIMINAR USUARIO DUPLICADO
-- Hay 2 usuarios con drpedro@clinica.com, eliminar el que NO tiene clinic_staff

-- PASO 1: Verificar cuál es el usuario correcto (el que tiene clinic_staff)
SELECT 
    u.id as user_id,
    u.email,
    u.name,
    cs.id as staff_id,
    CASE 
        WHEN cs.id IS NOT NULL THEN '✅ MANTENER'
        ELSE '❌ ELIMINAR'
    END as accion
FROM schema_core.users u
LEFT JOIN schema_medical.clinic_staff cs ON cs.user_id = u.id
WHERE u.email = 'drpedro@clinica.com'
ORDER BY cs.id DESC NULLS LAST;

-- PASO 2: Eliminar el usuario SIN clinic_staff (el que tiene name = null)
-- IMPORTANTE: También eliminar de auth.users
DELETE FROM auth.users 
WHERE id = '277163ee-5c5c-4f52-b7b5-b2cf5788329b';

DELETE FROM schema_core.users 
WHERE id = '277163ee-5c5c-4f52-b7b5-b2cf5788329b';

-- PASO 3: Verificar que solo queda UN usuario
SELECT 
    u.id as user_id,
    u.email,
    u.name,
    cs.id as staff_id,
    cs.clinic_id,
    c.name as clinic_name
FROM schema_core.users u
LEFT JOIN schema_medical.clinic_staff cs ON cs.user_id = u.id
LEFT JOIN schema_medical.clinics c ON c.id = cs.clinic_id
WHERE u.email = 'drpedro@clinica.com';

-- RESULTADO ESPERADO: Solo 1 fila con user_id = 43729db6-0fd7-4730-a110-ae994205053d
