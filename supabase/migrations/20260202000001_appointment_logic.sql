-- Migration: Appointment Services & Enhanced RPC
-- Date: 2026-02-02
-- Description: Adds appointment_services table and robust scheduling RPC

-- 1. Create appointment_services table
CREATE TABLE IF NOT EXISTS schema_medical.appointment_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES schema_medical.clinics(id) ON DELETE CASCADE,
    appointment_id UUID NOT NULL REFERENCES schema_medical.appointments(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES schema_lab.services(id),
    price DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appt_services_appt ON schema_medical.appointment_services(appointment_id);
ALTER TABLE schema_medical.appointment_services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS appt_services_isolation ON schema_medical.appointment_services;
CREATE POLICY appt_services_isolation ON schema_medical.appointment_services
    FOR ALL USING (
        clinic_id IN (SELECT clinic_id FROM schema_medical.clinic_staff WHERE user_id = auth.uid())
    );

-- 2. Update create_appointment_rpc
CREATE OR REPLACE FUNCTION public.create_appointment_rpc(
  p_patient_id UUID,
  p_doctor_id UUID,
  p_title TEXT,
  p_start TIMESTAMPTZ,
  p_end TIMESTAMPTZ,
  p_appointment_type TEXT DEFAULT 'consultation',
  p_reason TEXT DEFAULT NULL,
  p_service_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_clinic_id UUID;
  v_new_id UUID;
  v_duration INTEGER;
BEGIN
  -- Get clinic_id
  SELECT clinic_id INTO v_clinic_id
  FROM schema_medical.clinic_staff
  WHERE user_id = auth.uid()
  LIMIT 1;

  IF v_clinic_id IS NULL THEN
    RAISE EXCEPTION 'User is not associated with any clinic';
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
    INSERT INTO schema_medical.appointment_services (clinic_id, appointment_id, service_id, price)
    SELECT 
        v_clinic_id, 
        v_new_id, 
        p_service_id, 
        price
    FROM schema_medical.clinic_service_prices
    WHERE service_id = p_service_id AND clinic_id = v_clinic_id
    LIMIT 1;

    -- If no price found (maybe redundant but safe), insert with null or 0? 
    -- If INSERT 0 rows above, we might want to insert just the service_id with null price.
    IF NOT FOUND THEN
        INSERT INTO schema_medical.appointment_services (clinic_id, appointment_id, service_id, price)
        VALUES (v_clinic_id, v_new_id, p_service_id, 0); 
    END IF;
  END IF;

  RETURN v_new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant new signature
GRANT EXECUTE ON FUNCTION public.create_appointment_rpc(UUID, UUID, TEXT, TIMESTAMPTZ, TIMESTAMPTZ, TEXT, TEXT, UUID) TO authenticated;
