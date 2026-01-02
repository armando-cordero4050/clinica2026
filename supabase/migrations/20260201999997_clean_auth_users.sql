
-- Limpieza de usuarios de AUTH (GoTrue)
-- Intentamos borrar directo de auth.users usando permisos de service_role.
-- Si esto falla, es porque Supabase bloquea DELETE en auth schema por seguridad.

DELETE FROM auth.users 
WHERE email <> 'admin@dentalflow.com';

-- Asegurarnos que el admin existe y está confirmado
UPDATE auth.users
SET email_confirmed_at = now()
WHERE email = 'admin@dentalflow.com' AND email_confirmed_at IS NULL;
