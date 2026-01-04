-- Create public view for patients
DROP VIEW IF EXISTS public.patients CASCADE;

CREATE VIEW public.patients AS
SELECT * FROM schema_medical.patients;

-- Grant access
GRANT SELECT, INSERT, UPDATE, DELETE ON public.patients TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.patients TO service_role;

-- Comment
COMMENT ON VIEW public.patients IS 'Public view of patients table for Supabase client access';
