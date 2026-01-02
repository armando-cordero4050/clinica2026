-- =====================================================
-- Migration: Create Appointments System (IDEMPOTENT)
-- Date: 2026-01-31
-- Author: DentalFlow Team
-- Description: Drops and recreates appointments table, RPC functions, and RLS policies
-- =====================================================

-- Step 0: Drop existing objects (idempotent cleanup)
DROP TRIGGER IF EXISTS tr_update_appointments_timestamp ON schema_medical.appointments;
DROP FUNCTION IF EXISTS schema_medical.update_appointments_timestamp();
DROP FUNCTION IF EXISTS public.get_appointments_rpc(TIMESTAMPTZ, TIMESTAMPTZ);
DROP FUNCTION IF EXISTS public.create_appointment_rpc(UUID, UUID, TEXT, TIMESTAMPTZ, TIMESTAMPTZ, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.create_appointment_rpc(UUID, TEXT, TIMESTAMPTZ, TIMESTAMPTZ);
DROP TABLE IF EXISTS schema_medical.appointments CASCADE;

-- Step 1: Create appointments table
CREATE TABLE schema_medical.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES schema_medical.clinics(id),
  patient_id UUID NOT NULL REFERENCES schema_medical.patients(id) ON DELETE CASCADE,
  
  -- Información de la Cita
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes INTEGER,
  
  -- Personal
  doctor_id UUID REFERENCES schema_core.users(id),
  
  -- Tipo y Estado
  appointment_type TEXT CHECK (appointment_type IN (
    'consultation', 'treatment', 'follow_up', 'emergency', 'other'
  )),
  status TEXT DEFAULT 'scheduled' CHECK (status IN (
    'scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'
  )),
  
  -- Detalles
  title TEXT NOT NULL,
  reason TEXT,
  notes TEXT,
  reminder_sent BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT
);

-- Step 2: Create indexes
CREATE INDEX idx_appointments_clinic ON schema_medical.appointments(clinic_id);
CREATE INDEX idx_appointments_patient ON schema_medical.appointments(patient_id);
CREATE INDEX idx_appointments_doctor ON schema_medical.appointments(doctor_id);
CREATE INDEX idx_appointments_date ON schema_medical.appointments(appointment_date, start_time);
CREATE INDEX idx_appointments_status ON schema_medical.appointments(status);

-- Step 3: Enable RLS
ALTER TABLE schema_medical.appointments ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies
CREATE POLICY appointments_clinic_isolation ON schema_medical.appointments
  FOR ALL USING (
    clinic_id IN (
      SELECT clinic_id FROM schema_medical.clinic_staff WHERE user_id = auth.uid()
    )
  );

-- Step 5: Create trigger for updated_at
CREATE FUNCTION schema_medical.update_appointments_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_update_appointments_timestamp
  BEFORE UPDATE ON schema_medical.appointments
  FOR EACH ROW
  EXECUTE FUNCTION schema_medical.update_appointments_timestamp();

-- Step 6: Create RPC function to get appointments
CREATE FUNCTION public.get_appointments_rpc(
  p_start TIMESTAMPTZ,
  p_end TIMESTAMPTZ
)
RETURNS TABLE (
  id UUID,
  patient_name TEXT,
  title TEXT,
  start_time TEXT,
  end_time TEXT,
  status TEXT,
  doctor_name TEXT,
  patient_id UUID,
  doctor_id UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    COALESCE(p.first_name || ' ' || p.last_name, 'Unknown Patient') AS patient_name,
    a.title,
    (a.appointment_date || ' ' || a.start_time)::TEXT AS start_time,
    (a.appointment_date || ' ' || a.end_time)::TEXT AS end_time,
    a.status,
    COALESCE(u.email, 'Unassigned') AS doctor_name,
    a.patient_id,
    a.doctor_id
  FROM schema_medical.appointments a
  LEFT JOIN schema_medical.patients p ON a.patient_id = p.id
  LEFT JOIN schema_core.users u ON a.doctor_id = u.id
  WHERE a.clinic_id IN (
    SELECT clinic_id FROM schema_medical.clinic_staff WHERE user_id = auth.uid()
  )
  AND (a.appointment_date || ' ' || a.start_time)::TIMESTAMPTZ >= p_start
  AND (a.appointment_date || ' ' || a.end_time)::TIMESTAMPTZ <= p_end
  ORDER BY a.appointment_date, a.start_time;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Create RPC function to create appointment
CREATE FUNCTION public.create_appointment_rpc(
  p_patient_id UUID,
  p_doctor_id UUID,
  p_title TEXT,
  p_start TIMESTAMPTZ,
  p_end TIMESTAMPTZ,
  p_appointment_type TEXT DEFAULT 'consultation',
  p_reason TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_clinic_id UUID;
  v_new_id UUID;
  v_duration INTEGER;
BEGIN
  -- Get the clinic_id for the current user
  SELECT clinic_id INTO v_clinic_id
  FROM schema_medical.clinic_staff
  WHERE user_id = auth.uid()
  LIMIT 1;

  IF v_clinic_id IS NULL THEN
    RAISE EXCEPTION 'User is not associated with any clinic';
  END IF;

  -- Calculate duration in minutes
  v_duration := EXTRACT(EPOCH FROM (p_end - p_start)) / 60;

  -- Insert the appointment
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

  RETURN v_new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 8: Grant permissions
GRANT EXECUTE ON FUNCTION public.get_appointments_rpc(TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_appointment_rpc(UUID, UUID, TEXT, TIMESTAMPTZ, TIMESTAMPTZ, TEXT, TEXT) TO authenticated;

-- Step 9: Add comments
COMMENT ON TABLE schema_medical.appointments IS 'Stores patient appointments for dental clinics';
COMMENT ON FUNCTION public.get_appointments_rpc IS 'Fetches appointments for the current user''s clinic within a date range';
COMMENT ON FUNCTION public.create_appointment_rpc IS 'Creates a new appointment for a patient';
