-- 🔨 DATA REPAIR: ROLES & PERMISSIONS
-- Ensures our test users have the correct roles in V5 schema_core.

-- 1. Sync any missing users from auth.users to schema_core.users
INSERT INTO schema_core.users (id, email, role)
SELECT id, email, 'patient'
FROM auth.users
WHERE id NOT IN (SELECT id FROM schema_core.users)
ON CONFLICT (id) DO NOTHING;

-- 2. Force set roles for critical accounts
UPDATE schema_core.users SET role = 'super_admin' WHERE email = 'superadmin@smartnetgt.com';
UPDATE schema_core.users SET role = 'lab_admin' WHERE email = 'labadmin@smartnetgt.com';
UPDATE schema_core.users SET role = 'clinic_admin' WHERE email = 'admin2@smartnetgt.com';
UPDATE schema_core.users SET role = 'dentist' WHERE email = 'tester@smartnetgt.com';

-- 3. Ensure the RPC returns the correct data
CREATE OR REPLACE FUNCTION public.get_my_profile()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = schema_core, public
AS $$
DECLARE
    v_profile JSONB;
BEGIN
    SELECT jsonb_build_object(
        'id', id,
        'email', email,
        'role', role,
        'is_active', is_active
    ) INTO v_profile
    FROM schema_core.users
    WHERE id = auth.uid();
    
    -- Fallback if not found (shouldn't happen with sync above but for safety)
    IF v_profile IS NULL THEN
        RETURN jsonb_build_object('role', 'patient', 'error', 'Profile not found in schema_core');
    END IF;

    RETURN v_profile;
END;
$$;
