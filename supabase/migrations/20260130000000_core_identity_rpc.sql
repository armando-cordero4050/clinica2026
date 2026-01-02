-- 🦅 CORE: IDENTITY EXPOSURE
-- Description: Safely expose user role/profile to frontend from schema_core.

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
    
    RETURN v_profile;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_my_profile() TO authenticated;
