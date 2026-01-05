-- RPC to get all users with their active session status
-- This checks auth.sessions to determine if users have active sessions globally

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
        -- Check if user has any active sessions (not expired)
        EXISTS (
            SELECT 1 
            FROM auth.sessions s 
            WHERE s.user_id = u.id 
            AND s.not_after > NOW()
        ) as has_active_session,
        -- Count active sessions
        COALESCE((
            SELECT COUNT(*)::INTEGER
            FROM auth.sessions s
            WHERE s.user_id = u.id
            AND s.not_after > NOW()
        ), 0) as session_count
    FROM schema_core.users u
    LEFT JOIN auth.users au ON u.id = au.id
    ORDER BY u.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_all_users_with_sessions TO authenticated;

COMMENT ON FUNCTION public.get_all_users_with_sessions IS 
  'Returns all users with their active session status by checking auth.sessions table';
