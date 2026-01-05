-- Migration: 20260205000065_update_dental_chart_rpc.sql
-- Description: Update get_patient_dental_chart to return lab_order_id

-- 0. Drop existing functions to allow return type change
DROP FUNCTION IF EXISTS public.get_patient_dental_chart(UUID);
DROP FUNCTION IF EXISTS schema_medical.get_patient_dental_chart(UUID);

-- 1. Update schema_medical.get_patient_dental_chart
CREATE OR REPLACE FUNCTION schema_medical.get_patient_dental_chart(p_patient_id UUID)
RETURNS TABLE (
    tooth_number INTEGER,
    surface TEXT,
    condition TEXT,
    notes TEXT,
    updated_at TIMESTAMPTZ,
    lab_order_id UUID
) AS $$
DECLARE
  v_clinic_id UUID;
BEGIN
  SELECT clinic_id INTO v_clinic_id
  FROM schema_medical.clinic_staff
  WHERE user_id = auth.uid()
  LIMIT 1;

  RETURN QUERY
  SELECT dc.tooth_number, dc.surface, dc.condition, dc.notes, dc.updated_at, dc.lab_order_id
  FROM schema_medical.dental_chart dc
  WHERE dc.patient_id = p_patient_id AND dc.clinic_id = v_clinic_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update public.get_patient_dental_chart wrapper
CREATE OR REPLACE FUNCTION public.get_patient_dental_chart(p_patient_id UUID)
RETURNS TABLE (
    tooth_number INTEGER,
    surface TEXT,
    condition TEXT,
    notes TEXT,
    updated_at TIMESTAMPTZ,
    lab_order_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY SELECT * FROM schema_medical.get_patient_dental_chart(p_patient_id);
END;
$$;

-- Grant permissions again just in case
GRANT EXECUTE ON FUNCTION public.get_patient_dental_chart(UUID) TO authenticated;
