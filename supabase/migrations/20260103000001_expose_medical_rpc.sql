-- EXPOSE MEDICAL RPCs

-- 1. SEARCH PATIENTS
CREATE OR REPLACE FUNCTION public.search_patients_rpc(p_query TEXT)
RETURNS SETOF schema_medical.patients
LANGUAGE sql SECURITY DEFINER
SET search_path = schema_medical, public
AS $$
    SELECT * FROM schema_medical.get_patients(p_query);
$$;

-- 2. CREATE PATIENT
CREATE OR REPLACE FUNCTION public.create_patient_rpc(
    p_full_name TEXT,
    p_phone TEXT,
    p_email TEXT,
    p_dob DATE
)
RETURNS UUID
LANGUAGE sql SECURITY DEFINER
SET search_path = schema_medical, public
AS $$
    SELECT schema_medical.create_patient(p_full_name, p_phone, p_email, p_dob);
$$;

GRANT EXECUTE ON FUNCTION public.search_patients_rpc(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_patient_rpc(TEXT, TEXT, TEXT, DATE) TO authenticated;
