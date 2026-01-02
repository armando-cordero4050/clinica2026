-- 🏥 SCHEMA MEDICAL: PATIENTS & CLINICAL DATA
-- Description: Core tables for the Clinical Module

-- 1. PATIENTS
CREATE TABLE schema_medical.patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL, -- Multitenancy
    full_name TEXT NOT NULL,
    date_of_birth DATE,
    phone TEXT,
    email TEXT,
    address TEXT,
    allergies JSONB DEFAULT '[]'::JSONB, -- Array of strings
    medical_conditions JSONB DEFAULT '[]'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraint: Email unique PER CLINIC (not globally, maybe?) 
    -- Let's keep it simple for now: unique per clinic
    UNIQUE(clinic_id, email)
);

-- 2. CLINICAL HISTORY (Notes/Visits)
CREATE TABLE schema_medical.clinical_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES schema_medical.patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES schema_core.users(id), -- If doctor is user
    visit_date TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    treatments JSONB DEFAULT '[]'::JSONB, -- List of done procedures
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RLS POLICIES
ALTER TABLE schema_medical.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE schema_medical.clinical_history ENABLE ROW LEVEL SECURITY;

-- Policy: Clinic Staff/Doctors can view/edit their own clinic's patients
CREATE POLICY "Clinic Internal Access" ON schema_medical.patients
    FOR ALL TO authenticated
    USING ( true ) -- For Sprint Zero, we assume single clinic or unrestricted internal access. 
                   -- In prod, this would be: clinic_id = auth.user_metadata->>'clinic_id'
    WITH CHECK ( true );

CREATE POLICY "History Access" ON schema_medical.clinical_history
    FOR ALL TO authenticated
    USING ( true );

-- 4. RPCs (Expose to Public for Dashboard Bypass)
-- GET PATIENTS
CREATE OR REPLACE FUNCTION schema_medical.get_patients(p_search TEXT DEFAULT NULL)
RETURNS SETOF schema_medical.patients
LANGUAGE sql SECURITY DEFINER
SET search_path = schema_medical, public
AS $$
    SELECT * FROM schema_medical.patients
    WHERE 
        (p_search IS NULL OR full_name ILIKE '%' || p_search || '%')
    ORDER BY created_at DESC
    LIMIT 50;
$$;

-- CREATE PATIENT
CREATE OR REPLACE FUNCTION schema_medical.create_patient(
    p_full_name TEXT,
    p_phone TEXT,
    p_email TEXT,
    p_dob DATE
)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = schema_medical, public
AS $$
DECLARE
    v_id UUID;
    -- Dummy clinic ID for Sprint Zero
    v_clinic_id UUID := '00000000-0000-0000-0000-000000000000';
BEGIN
    INSERT INTO schema_medical.patients (clinic_id, full_name, phone, email, date_of_birth)
    VALUES (v_clinic_id, p_full_name, p_phone, p_email, p_dob)
    RETURNING id INTO v_id;
    
    RETURN v_id;
END;
$$;
