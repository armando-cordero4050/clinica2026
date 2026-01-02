
-- Forzar Rol Super Admin
UPDATE schema_core.users
SET role = 'super_admin'
WHERE email = 'admin@dentalflow.com';

-- Validación
SELECT email, role FROM schema_core.users WHERE email = 'admin@dentalflow.com';
