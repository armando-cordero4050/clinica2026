-- Drop and recreate public.users view to expose name field
DROP VIEW IF EXISTS public.users CASCADE;

CREATE OR REPLACE VIEW public.users AS
SELECT 
  id,
  email,
  name,
  role,
  is_pending_activation,
  created_at,
  updated_at
FROM schema_core.users;

-- Grant access
GRANT SELECT ON public.users TO authenticated;
GRANT SELECT ON public.users TO anon;

COMMENT ON VIEW public.users IS 'Public view of users with name field for Supabase client access';
