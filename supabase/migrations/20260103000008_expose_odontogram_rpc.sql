-- EXPOSE ODONTOGRAM RPCs

-- 1. GET
CREATE OR REPLACE FUNCTION public.get_odontogram_rpc(p_patient_id UUID)
RETURNS JSONB
LANGUAGE sql SECURITY DEFINER SET search_path = schema_medical, public AS $$
    SELECT schema_medical.get_odontogram(p_patient_id);
$$;

-- 2. SAVE
CREATE OR REPLACE FUNCTION public.save_odontogram_rpc(
    p_patient_id UUID,
    p_teeth_state JSONB
)
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER SET search_path = schema_medical, public AS $$
    SELECT schema_medical.save_odontogram(p_patient_id, p_teeth_state);
$$;

GRANT EXECUTE ON FUNCTION public.get_odontogram_rpc(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.save_odontogram_rpc(UUID, JSONB) TO authenticated;
