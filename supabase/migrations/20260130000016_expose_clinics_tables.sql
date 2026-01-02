-- Expose Medical tables to public schema for PostgREST access

-- 1. Create view for clinics
CREATE OR REPLACE VIEW public.clinics AS
SELECT * FROM schema_medical.clinics;

-- 2. Create view for clinic_staff
CREATE OR REPLACE VIEW public.clinic_staff AS
SELECT * FROM schema_medical.clinic_staff;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clinics TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clinic_staff TO authenticated;
