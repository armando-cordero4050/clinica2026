-- Updated RPC with 24-hour window for online status
-- This is more practical since last_sign_in_at only updates on login

DROP FUNCTION IF EXISTS public.get_all_users_with_sessions();

CREATE OR REPLACE FUNCTION public.get_all_users_with_sessions()
RETURNS TABLE (
    id UUID,
    email TEXT,
    role TEXT,
    is_active BOOLEAN,
    created_at TIMESTAMPTZ,
    last_sign_in_at TIMESTAMPTZ,
    has_active_session BOOLEAN,
    session_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = schema_core, auth, public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.email,
        u.role,
        u.is_active,
        u.created_at,
        au.last_sign_in_at,
        -- Consider user online if they logged in within the last 24 hours
        CASE 
            WHEN au.last_sign_in_at IS NOT NULL 
            AND au.last_sign_in_at > (NOW() - INTERVAL '24 hours')
            THEN TRUE
            ELSE FALSE
        END as has_active_session,
        -- Session count is 1 if recently active, 0 otherwise
        CASE 
            WHEN au.last_sign_in_at IS NOT NULL 
            AND au.last_sign_in_at > (NOW() - INTERVAL '24 hours')
            THEN 1
            ELSE 0
        END::INTEGER as session_count
    FROM schema_core.users u
    LEFT JOIN auth.users au ON u.id = au.id
    ORDER BY u.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_all_users_with_sessions TO authenticated;

COMMENT ON FUNCTION public.get_all_users_with_sessions IS 
  'Returns all users with online status based on recent login activity (last 24 hours)';
