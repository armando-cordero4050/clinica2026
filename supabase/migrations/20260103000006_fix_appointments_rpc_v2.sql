-- 🩹 FIX: RE-EXPOSE APPOINTMENTS RPC (V2)
-- Run this script to force the creation of the API functions.

-- 1. CLEANUP (Drop old versions if exist to avoid signature conflicts)
DROP FUNCTION IF EXISTS public.get_appointments_rpc(TIMESTAMPTZ, TIMESTAMPTZ);
DROP FUNCTION IF EXISTS public.create_appointment_rpc(UUID, TEXT, TIMESTAMPTZ, TIMESTAMPTZ);

-- 2. GET APPOINTMENTS RPC
CREATE OR REPLACE FUNCTION public.get_appointments_rpc(p_start TIMESTAMPTZ, p_end TIMESTAMPTZ)
RETURNS TABLE (
    id UUID,
    patient_name TEXT,
    title TEXT,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    status TEXT
) LANGUAGE sql SECURITY DEFINER SET search_path = schema_medical, public AS $$
    SELECT * FROM schema_medical.get_appointments(p_start, p_end);
$$;

-- 3. CREATE APPOINTMENT RPC
CREATE OR REPLACE FUNCTION public.create_appointment_rpc(
    p_patient_id UUID,
    p_title TEXT,
    p_start TIMESTAMPTZ,
    p_end TIMESTAMPTZ
)
RETURNS UUID
LANGUAGE sql SECURITY DEFINER SET search_path = schema_medical, public AS $$
    SELECT schema_medical.create_appointment(p_patient_id, p_title, p_start, p_end);
$$;

-- 4. GRANTS
GRANT EXECUTE ON FUNCTION public.get_appointments_rpc(TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_appointment_rpc(UUID, TEXT, TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;

-- 5. RELOAD CACHE (Try to force Supabase to see the changes)
NOTIFY pgrst, 'reload config';
