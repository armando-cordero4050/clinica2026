-- 🔢 EXPOSE SEQUENCES (CORRELATIVES) VIA RPC
-- Description: Allow frontend to read and update sequence configuration

-- RPC to get sequences
CREATE OR REPLACE FUNCTION public.get_sequences()
RETURNS TABLE (
    code TEXT,
    prefix TEXT,
    next_value INTEGER,
    last_reset TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) 
LANGUAGE sql 
SECURITY DEFINER
SET search_path = schema_core, public
AS $$
    SELECT code, prefix, next_value, last_reset, updated_at
    FROM schema_core.sequences
    ORDER BY code;
$$;

-- RPC to update sequence configuration
CREATE OR REPLACE FUNCTION public.update_sequence_config(
    p_code TEXT,
    p_prefix TEXT,
    p_next_value INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = schema_core, public
AS $$
DECLARE
    v_role TEXT;
BEGIN
    -- Check if user is admin
    SELECT role INTO v_role FROM schema_core.users WHERE id = auth.uid();
    
    IF v_role NOT IN ('super_admin', 'lab_admin') THEN
        RAISE EXCEPTION 'No tienes permisos para modificar correlativos';
    END IF;

    UPDATE schema_core.sequences
    SET 
        prefix = p_prefix,
        next_value = p_next_value,
        updated_at = NOW()
    WHERE code = p_code;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_sequences TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_sequence_config TO authenticated;
