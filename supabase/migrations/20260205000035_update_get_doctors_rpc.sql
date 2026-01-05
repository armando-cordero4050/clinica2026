-- =====================================================
-- Migration: Update Get Doctors RPC
-- Date: 2026-02-05
-- Description: Updates get_doctors_rpc to return doctor name from users table
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_doctors_rpc()
RETURNS TABLE (
  id UUID,
  email TEXT,
  name TEXT,
  role TEXT
) AS $$
DECLARE
  v_clinic_id UUID;
BEGIN
  -- Get the clinic_id for the current user
  SELECT clinic_id INTO v_clinic_id
  FROM schema_medical.clinic_staff
  WHERE user_id = auth.uid()
  LIMIT 1;

  IF v_clinic_id IS NULL THEN
    RAISE EXCEPTION 'User is not associated with any clinic';
  END IF;

  -- Get doctors
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    COALESCE(u.name, u.email) as name,
    cs.role
  FROM schema_medical.clinic_staff cs
  JOIN schema_core.users u ON cs.user_id = u.id
  WHERE cs.clinic_id = v_clinic_id
    AND cs.role IN ('doctor', 'admin', 'clinic_doctor')
  ORDER BY u.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_doctors_rpc() TO authenticated;
COMMENT ON FUNCTION public.get_doctors_rpc IS 'Gets all doctors (name/email) in the current user''s clinic';
