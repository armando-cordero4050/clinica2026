-- 👥 GET LAB USERS RPC
-- Description: Return list of lab users for performance dashboard

CREATE OR REPLACE FUNCTION public.get_lab_users()
RETURNS TABLE (
    id UUID,
    email TEXT,
    role TEXT
) 
LANGUAGE sql 
SECURITY DEFINER
SET search_path = schema_core, public
AS $$
    SELECT id, email, role
    FROM schema_core.users
    WHERE role IN ('lab_admin', 'lab_coordinator', 'lab_staff')
    ORDER BY email;
$$;

GRANT EXECUTE ON FUNCTION public.get_lab_users TO authenticated;
