-- EXPOSE APPOINTMENTS RPC

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

GRANT EXECUTE ON FUNCTION public.get_appointments_rpc(TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_appointment_rpc(UUID, TEXT, TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;
