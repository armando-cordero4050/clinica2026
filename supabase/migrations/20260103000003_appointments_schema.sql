-- 📅 SCHEMA MEDICAL: APPOINTMENTS

CREATE TABLE schema_medical.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL,
    patient_id UUID REFERENCES schema_medical.patients(id) ON DELETE CASCADE,
    doctor_id UUID, -- Optional linkage to schema_core.users
    title TEXT NOT NULL, -- e.g. "Limpieza", "Consulta General"
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE schema_medical.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Access Appointments" ON schema_medical.appointments
    FOR ALL TO authenticated
    USING (true);

-- RPC: Get Appointments by Range
CREATE OR REPLACE FUNCTION schema_medical.get_appointments(p_start TIMESTAMPTZ, p_end TIMESTAMPTZ)
RETURNS TABLE (
    id UUID,
    patient_name TEXT,
    title TEXT,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    status TEXT
) LANGUAGE sql SECURITY DEFINER SET search_path = schema_medical, public AS $$
    SELECT 
        a.id,
        p.full_name as patient_name,
        a.title,
        a.start_time,
        a.end_time,
        a.status
    FROM schema_medical.appointments a
    JOIN schema_medical.patients p ON a.patient_id = p.id
    WHERE a.start_time >= p_start AND a.end_time <= p_end
    ORDER BY a.start_time ASC;
$$;

-- RPC: Create Appointment
CREATE OR REPLACE FUNCTION schema_medical.create_appointment(
    p_patient_id UUID,
    p_title TEXT,
    p_start TIMESTAMPTZ,
    p_end TIMESTAMPTZ
)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = schema_medical, public AS $$
DECLARE
    v_id UUID;
BEGIN
    INSERT INTO schema_medical.appointments (clinic_id, patient_id, title, start_time, end_time)
    VALUES ('00000000-0000-0000-0000-000000000000', p_patient_id, p_title, p_start, p_end)
    RETURNING id INTO v_id;
    return v_id;
END;
$$;
