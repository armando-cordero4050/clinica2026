-- Migration: Allow manual clinic_id in create_appointment_rpc
-- Date: 2026-02-05
-- Description: Updates create_appointment_rpc to accept an optional p_clinic_id.
--              This allows Super Admin (who has no clinic_staff record) to create appointments
--              by explicitly providing the clinic context (e.g. derived from the selected doctor).

-- 1. Drop the old function signature to avoid confusion/overloading issues
DROP FUNCTION IF EXISTS public.create_appointment_rpc(UUID, UUID, TEXT, TIMESTAMPTZ, TIMESTAMPTZ, TEXT, TEXT, UUID);

-- 2. Create the updated function with p_clinic_id parameter
CREATE OR REPLACE FUNCTION public.create_appointment_rpc(
  p_patient_id UUID,
  p_doctor_id UUID,
  p_title TEXT,
  p_start TIMESTAMPTZ,
  p_end TIMESTAMPTZ,
  p_appointment_type TEXT DEFAULT 'consultation',
  p_reason TEXT DEFAULT NULL,
  p_service_id UUID DEFAULT NULL,
  p_clinic_id UUID DEFAULT NULL  -- New optional parameter
)
RETURNS UUID AS $$
DECLARE
  v_clinic_id UUID;
  v_new_id UUID;
  v_duration INTEGER;
BEGIN
  -- Determine clinic_id
  IF p_clinic_id IS NOT NULL THEN
    v_clinic_id := p_clinic_id;
  ELSE
    -- Fallback: Try to get from clinic_staff for current user
    SELECT clinic_id INTO v_clinic_id
    FROM schema_medical.clinic_staff
    WHERE user_id = auth.uid()
    LIMIT 1;
  END IF;

  IF v_clinic_id IS NULL THEN
    RAISE EXCEPTION 'User is not associated with any clinic and no clinic_id was provided.';
  END IF;

  -- Validate Doctor Availability (Overlap Check)
  IF p_doctor_id IS NOT NULL THEN
      IF EXISTS (
        SELECT 1 FROM schema_medical.appointments
        WHERE clinic_id = v_clinic_id
          AND doctor_id = p_doctor_id
          AND status NOT IN ('cancelled', 'no_show')
          AND (
            (p_start >= (appointment_date || ' ' || start_time)::TIMESTAMPTZ AND p_start < (appointment_date || ' ' || end_time)::TIMESTAMPTZ)
            OR
            (p_end > (appointment_date || ' ' || start_time)::TIMESTAMPTZ AND p_end <= (appointment_date || ' ' || end_time)::TIMESTAMPTZ)
            OR
            (p_start <= (appointment_date || ' ' || start_time)::TIMESTAMPTZ AND p_end >= (appointment_date || ' ' || end_time)::TIMESTAMPTZ)
          )
      ) THEN
        RAISE EXCEPTION 'El doctor seleccionado ya tiene una cita en ese horario.';
      END IF;
  END IF;

  -- Calculate duration
  v_duration := EXTRACT(EPOCH FROM (p_end - p_start)) / 60;

  -- Insert Appointment
  INSERT INTO schema_medical.appointments (
    clinic_id,
    patient_id,
    doctor_id,
    title,
    appointment_date,
    start_time,
    end_time,
    duration_minutes,
    appointment_type,
    reason,
    status
  ) VALUES (
    v_clinic_id,
    p_patient_id,
    p_doctor_id,
    p_title,
    p_start::DATE,
    p_start::TIME,
    p_end::TIME,
    v_duration,
    p_appointment_type,
    p_reason,
    'scheduled'
  )
  RETURNING id INTO v_new_id;

  -- Link Service if provided
  IF p_service_id IS NOT NULL THEN
    -- Try to find price for this specific clinic
    INSERT INTO schema_medical.appointment_services (clinic_id, appointment_id, service_id, price)
    SELECT 
        v_clinic_id, 
        v_new_id, 
        p_service_id, 
        price
    FROM schema_medical.clinic_service_prices
    WHERE service_id = p_service_id AND clinic_id = v_clinic_id
    LIMIT 1;

    -- If no price found, insert with 0 price to ensure the service is linked
    IF NOT FOUND THEN
        INSERT INTO schema_medical.appointment_services (clinic_id, appointment_id, service_id, price)
        VALUES (v_clinic_id, v_new_id, p_service_id, 0); 
    END IF;
  END IF;

  RETURN v_new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_appointment_rpc(UUID, UUID, TEXT, TIMESTAMPTZ, TIMESTAMPTZ, TEXT, TEXT, UUID, UUID) TO authenticated;
