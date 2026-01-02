-- Drop existing view if it exists
DROP VIEW IF EXISTS public.clinic_staff;

-- Create public view for clinic_staff to expose it to Supabase client
CREATE OR REPLACE VIEW public.clinic_staff AS
SELECT 
  id,
  clinic_id,
  user_id,
  odoo_contact_id,
  role,
  is_primary,
  title,
  job_position,
  phone,
  mobile,
  odoo_raw_data,
  created_at,
  updated_at
FROM schema_medical.clinic_staff;

-- Grant access to authenticated users
GRANT SELECT ON public.clinic_staff TO authenticated;
GRANT SELECT ON public.clinic_staff TO anon;

COMMENT ON VIEW public.clinic_staff IS 'Public view of clinic staff for Supabase client access';
