-- =====================================================
-- EXPOSE DENTAL CHART FUNCTIONS TO PUBLIC
-- Description: Exposes the new dental chart (individual teeth/surfaces)
--              to the public schema for frontend access.
-- =====================================================

-- 1. Expose upsert_tooth_condition
CREATE OR REPLACE FUNCTION public.upsert_tooth_condition(
    p_patient_id UUID,
    p_tooth_number INTEGER,
    p_surface TEXT,
    p_condition TEXT,
    p_notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN schema_medical.upsert_tooth_condition(
        p_patient_id,
        p_tooth_number,
        p_surface,
        p_condition,
        p_notes
    );
END;
$$;

-- 2. Expose get_patient_dental_chart
CREATE OR REPLACE FUNCTION public.get_patient_dental_chart(p_patient_id UUID)
RETURNS TABLE (
    tooth_number INTEGER,
    surface TEXT,
    condition TEXT,
    notes TEXT,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY SELECT * FROM schema_medical.get_patient_dental_chart(p_patient_id);
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.upsert_tooth_condition(UUID, INTEGER, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_patient_dental_chart(UUID) TO authenticated;

-- Comments
COMMENT ON FUNCTION public.upsert_tooth_condition IS 'Exposed wrapper for schema_medical.upsert_tooth_condition';
COMMENT ON FUNCTION public.get_patient_dental_chart IS 'Exposed wrapper for schema_medical.get_patient_dental_chart';
