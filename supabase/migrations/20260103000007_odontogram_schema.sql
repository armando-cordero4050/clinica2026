-- 🦷 SCHEMA MEDICAL: ODONTOGRAMS
-- Description: Stores the graphical state of a patient's mouth.

-- 1. ODONTOGRAMS TABLE
CREATE TABLE schema_medical.odontograms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL,
    patient_id UUID REFERENCES schema_medical.patients(id) ON DELETE CASCADE,
    teeth_state JSONB DEFAULT '{}'::JSONB, -- Key: Tooth ID (11-85), Value: { condition, surfaces, notes }
    last_update_by UUID, -- Link to user
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraint: One odontogram per patient (for now)
    UNIQUE(patient_id)
);

ALTER TABLE schema_medical.odontograms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Access Odontograms" ON schema_medical.odontograms
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- 2. INSERT TRIGGER (Auto-create odontogram when patient created? Or manual?)
-- Let's keep it manual or on-demand via UPSERT for simplicity.

-- 3. RPC: GET ODONTOGRAM
CREATE OR REPLACE FUNCTION schema_medical.get_odontogram(p_patient_id UUID)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = schema_medical, public AS $$
DECLARE
    v_state JSONB;
BEGIN
    SELECT teeth_state INTO v_state
    FROM schema_medical.odontograms
    WHERE patient_id = p_patient_id;
    
    RETURN v_state;
END;
$$;

-- 4. RPC: SAVE ODONTOGRAM (UPSERT)
CREATE OR REPLACE FUNCTION schema_medical.save_odontogram(
    p_patient_id UUID,
    p_teeth_state JSONB
)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER SET search_path = schema_medical, public AS $$
DECLARE
    v_clinic_id UUID := '00000000-0000-0000-0000-000000000000'; -- Default for Sprint Zero
BEGIN
    INSERT INTO schema_medical.odontograms (clinic_id, patient_id, teeth_state, updated_at)
    VALUES (v_clinic_id, p_patient_id, p_teeth_state, NOW())
    ON CONFLICT (patient_id) 
    DO UPDATE SET 
        teeth_state = EXCLUDED.teeth_state,
        updated_at = NOW();
        
    RETURN TRUE;
END;
$$;
