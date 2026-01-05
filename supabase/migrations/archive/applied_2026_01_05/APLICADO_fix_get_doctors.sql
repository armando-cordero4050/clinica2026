-- =====================================================
-- EJECUTAR AHORA: Fix Get Doctors RPC for Super Admin
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
  v_user_role TEXT;
BEGIN
  -- Get the user's role
  SELECT u.role INTO v_user_role
  FROM schema_core.users u
  WHERE u.id = auth.uid();

  -- If super_admin, return all doctors from all clinics
  IF v_user_role = 'super_admin' THEN
    RETURN QUERY
    SELECT 
      u.id,
      u.email,
      COALESCE(u.name, u.email) as name,
      cs.role
    FROM schema_medical.clinic_staff cs
    JOIN schema_core.users u ON cs.user_id = u.id
    WHERE cs.role IN ('doctor', 'admin', 'clinic_doctor', 'clinic_admin')
    ORDER BY u.name;
    RETURN;
  END IF;

  -- Get the clinic_id for the current user
  SELECT clinic_id INTO v_clinic_id
  FROM schema_medical.clinic_staff
  WHERE user_id = auth.uid()
  LIMIT 1;

  IF v_clinic_id IS NULL THEN
    RAISE EXCEPTION 'User is not associated with any clinic';
  END IF;

  -- Get doctors from the user's clinic
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    COALESCE(u.name, u.email) as name,
    cs.role
  FROM schema_medical.clinic_staff cs
  JOIN schema_core.users u ON cs.user_id = u.id
  WHERE cs.clinic_id = v_clinic_id
    AND cs.role IN ('doctor', 'admin', 'clinic_doctor', 'clinic_admin')
  ORDER BY u.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verify it works (Commented out to prevent SQL Editor error)
-- SELECT * FROM public.get_doctors_rpc();
