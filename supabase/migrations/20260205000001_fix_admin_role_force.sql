-- FORCE UPDATE ADMIN ROLE
-- Run this in Supabase SQL Editor if CLI fails

BEGIN;

UPDATE public.profiles
SET role = 'super_admin'
WHERE id IN (
    SELECT id FROM auth.users WHERE email = 'admin@dentalflow.com'
);

-- Verify
SELECT email, role 
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'admin@dentalflow.com';

COMMIT;
