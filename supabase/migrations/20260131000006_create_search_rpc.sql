-- =====================================================
-- Migration: Create RPC functions for appointments module
-- Date: 2026-01-31
-- Author: DentalFlow Team
-- Description: Creates RPC functions to search patients and get doctors
-- =====================================================

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS public.search_patients_rpc(TEXT);
DROP FUNCTION IF EXISTS public.get_doctors_rpc();

-- Function to search patients
CREATE OR REPLACE FUNCTION public.search_patients_rpc(
  p_query TEXT
)
RETURNS TABLE (
  id UUID,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  mobile TEXT
) AS $$
DECLARE
  v_clinic_id UUID;
  v_search_pattern TEXT;
BEGIN
  -- Get the clinic_id for the current user
  SELECT clinic_id INTO v_clinic_id
  FROM schema_medical.clinic_staff
  WHERE user_id = auth.uid()
  LIMIT 1;

  IF v_clinic_id IS NULL THEN
    RAISE EXCEPTION 'User is not associated with any clinic';
  END IF;

  -- Create search pattern with wildcards on both sides
  v_search_pattern := '%' || LOWER(p_query) || '%';

  -- Search patients
  RETURN QUERY
  SELECT 
    p.id,
    p.first_name,
    p.last_name,
    p.full_name,
    p.email,
    p.phone,
    p.mobile
  FROM schema_medical.patients p
  WHERE p.clinic_id = v_clinic_id
    AND p.is_active = true
    AND (
      LOWER(p.first_name) LIKE v_search_pattern OR
      LOWER(p.last_name) LIKE v_search_pattern OR
      LOWER(p.full_name) LIKE v_search_pattern OR
      LOWER(COALESCE(p.email, '')) LIKE v_search_pattern OR
      LOWER(COALESCE(p.phone, '')) LIKE v_search_pattern OR
      LOWER(COALESCE(p.mobile, '')) LIKE v_search_pattern
    )
  ORDER BY p.first_name
  LIMIT 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get doctors
CREATE OR REPLACE FUNCTION public.get_doctors_rpc()
RETURNS TABLE (
  id UUID,
  email TEXT,
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
    cs.role
  FROM schema_medical.clinic_staff cs
  JOIN schema_core.users u ON cs.user_id = u.id
  WHERE cs.clinic_id = v_clinic_id
    AND cs.role IN ('doctor', 'admin')
  ORDER BY u.email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.search_patients_rpc(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_doctors_rpc() TO authenticated;

-- Add comments
COMMENT ON FUNCTION public.search_patients_rpc IS 'Searches patients in the current user''s clinic';
COMMENT ON FUNCTION public.get_doctors_rpc IS 'Gets all doctors in the current user''s clinic';
