-- 20260202000002_clinical_records.sql
-- Description: Tables for Clinical Evolutions and Dental Chart (Odontogram)

-- 1. Dental Chart (Current State of Teeth)
-- Store the *current* condition of the patient's teeth.
CREATE TABLE IF NOT EXISTS schema_medical.dental_chart (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES schema_medical.clinics(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES schema_medical.patients(id) ON DELETE CASCADE,
    tooth_number INTEGER NOT NULL,
    surface TEXT NOT NULL, -- 'mesial', 'distal', 'oclusal', 'vestibular', 'lingual', 'whole'
    condition TEXT NOT NULL, -- 'healthy', 'caries', 'amalgam', 'composite', 'sealant', 'missing', 'crown', 'endodontic', etc.
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(clinic_id, patient_id, tooth_number, surface)
);

-- 2. Clinical Evolutions (History Log)
-- Records of visits, treatments performed, and notes.
CREATE TABLE IF NOT EXISTS schema_medical.evolutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES schema_medical.clinics(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES schema_medical.patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES schema_core.users(id) ON DELETE SET NULL,
    appointment_id UUID REFERENCES schema_medical.appointments(id) ON DELETE SET NULL,
    
    date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    description TEXT NOT NULL, -- The main narrative
    symptoms TEXT,
    diagnosis TEXT,
    treatment_plan TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Evolution Details (optional, specific procedures done in an evolution)
-- Often needed to link specific chart changes to an evolution.
CREATE TABLE IF NOT EXISTS schema_medical.evolution_procedures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evolution_id UUID NOT NULL REFERENCES schema_medical.evolutions(id) ON DELETE CASCADE,
    service_id UUID REFERENCES schema_lab.services(id), -- If linked to a catalog item
    procedure_name TEXT NOT NULL, -- Snapshot of name in case service changes
    tooth_number INTEGER,
    surface TEXT,
    cost DECIMAL(10,2),
    price DECIMAL(10,2),
    notes TEXT
);

-- RLS
ALTER TABLE schema_medical.dental_chart ENABLE ROW LEVEL SECURITY;
ALTER TABLE schema_medical.evolutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE schema_medical.evolution_procedures ENABLE ROW LEVEL SECURITY;

-- Policies (Standard Clinic Isolation)
CREATE POLICY "Clinic Isolation Select" ON schema_medical.dental_chart
    FOR SELECT USING (clinic_id IN (SELECT clinic_id FROM schema_medical.clinic_staff WHERE user_id = auth.uid()));

CREATE POLICY "Clinic Isolation Insert" ON schema_medical.dental_chart
    FOR INSERT WITH CHECK (clinic_id IN (SELECT clinic_id FROM schema_medical.clinic_staff WHERE user_id = auth.uid()));

CREATE POLICY "Clinic Isolation Update" ON schema_medical.dental_chart
    FOR UPDATE USING (clinic_id IN (SELECT clinic_id FROM schema_medical.clinic_staff WHERE user_id = auth.uid()));

CREATE POLICY "Clinic Isolation Delete" ON schema_medical.dental_chart
    FOR DELETE USING (clinic_id IN (SELECT clinic_id FROM schema_medical.clinic_staff WHERE user_id = auth.uid()));

-- Repeat for Evolutions
CREATE POLICY "Clinic Isolation Select" ON schema_medical.evolutions
    FOR SELECT USING (clinic_id IN (SELECT clinic_id FROM schema_medical.clinic_staff WHERE user_id = auth.uid()));

CREATE POLICY "Clinic Isolation Insert" ON schema_medical.evolutions
    FOR INSERT WITH CHECK (clinic_id IN (SELECT clinic_id FROM schema_medical.clinic_staff WHERE user_id = auth.uid()));

CREATE POLICY "Clinic Isolation Update" ON schema_medical.evolutions
    FOR UPDATE USING (clinic_id IN (SELECT clinic_id FROM schema_medical.clinic_staff WHERE user_id = auth.uid()));

-- Repeat for Procedures
CREATE POLICY "Clinic Isolation Select" ON schema_medical.evolution_procedures
    FOR SELECT USING (evolution_id IN (SELECT id FROM schema_medical.evolutions WHERE clinic_id IN (SELECT clinic_id FROM schema_medical.clinic_staff WHERE user_id = auth.uid())));
-- Note: Simplified policy for procedures relying on evolution link, essentially same scope.

-- Indexes
CREATE INDEX idx_chart_patient ON schema_medical.dental_chart(patient_id);
CREATE INDEX idx_evolutions_patient ON schema_medical.evolutions(patient_id);
CREATE INDEX idx_evolutions_date ON schema_medical.evolutions(date DESC);

-- RPC to get full dental chart for a patient
CREATE OR REPLACE FUNCTION schema_medical.get_patient_dental_chart(p_patient_id UUID)
RETURNS TABLE (
    tooth_number INTEGER,
    surface TEXT,
    condition TEXT,
    notes TEXT,
    updated_at TIMESTAMPTZ
) AS $$
DECLARE
  v_clinic_id UUID;
BEGIN
  SELECT clinic_id INTO v_clinic_id
  FROM schema_medical.clinic_staff
  WHERE user_id = auth.uid()
  LIMIT 1;

  RETURN QUERY
  SELECT dc.tooth_number, dc.surface, dc.condition, dc.notes, dc.updated_at
  FROM schema_medical.dental_chart dc
  WHERE dc.patient_id = p_patient_id AND dc.clinic_id = v_clinic_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- RPC to save dental chart finding (Upsert)
CREATE OR REPLACE FUNCTION schema_medical.upsert_tooth_condition(
    p_patient_id UUID,
    p_tooth_number INTEGER,
    p_surface TEXT,
    p_condition TEXT,
    p_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_clinic_id UUID;
  v_id UUID;
BEGIN
  SELECT clinic_id INTO v_clinic_id
  FROM schema_medical.clinic_staff
  WHERE user_id = auth.uid()
  LIMIT 1;

  IF v_clinic_id IS NULL THEN
    RAISE EXCEPTION 'User not in clinic';
  END IF;

  INSERT INTO schema_medical.dental_chart (clinic_id, patient_id, tooth_number, surface, condition, notes)
  VALUES (v_clinic_id, p_patient_id, p_tooth_number, p_surface, p_condition, p_notes)
  ON CONFLICT (clinic_id, patient_id, tooth_number, surface)
  DO UPDATE SET 
    condition = EXCLUDED.condition,
    notes = EXCLUDED.notes,
    updated_at = NOW()
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
