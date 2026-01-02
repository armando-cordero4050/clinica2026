-- Add guardian_id and guardian_relationship to patients table
DO $$
BEGIN
  -- guardian_id FK
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'schema_medical' 
                 AND table_name = 'patients' 
                 AND column_name = 'guardian_id') THEN
    ALTER TABLE schema_medical.patients ADD COLUMN guardian_id UUID REFERENCES schema_medical.patients(id);
    
    CREATE INDEX idx_patients_guardian ON schema_medical.patients(guardian_id);
  END IF;

  -- Ensure guardian_relationship exists (it might already exist from previous migration but verify)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'schema_medical' 
                 AND table_name = 'patients' 
                 AND column_name = 'guardian_relationship') THEN
    ALTER TABLE schema_medical.patients ADD COLUMN guardian_relationship TEXT;
  END IF;

  -- Check constraint for id_type if we need to expand it or just ensure it accepts lower case
  -- Currently: CHECK (id_type IN ('dpi', 'passport', 'nit', 'other'))
  -- My code sends lowercase, so that's fine.

END $$;

-- Update public view
DROP VIEW IF EXISTS public.patients CASCADE;
CREATE OR REPLACE VIEW public.patients AS
SELECT 
  p.id, p.clinic_id, p.id_type, p.id_number, p.first_name, p.last_name,
  p.date_of_birth, p.gender, p.email, p.phone, p.mobile,
  p.address, p.city, p.state, p.country, p.zip_code,
  p.guardian_name, p.guardian_relationship, p.guardian_phone,
  p.guardian_id, -- Added this
  p.blood_type, p.allergies, p.chronic_conditions, p.current_medications,
  p.emergency_contact_name, p.emergency_contact_phone, p.emergency_contact_relationship,
  p.patient_code, p.insurance_provider, p.insurance_policy_number,
  p.acquisition_source, p.acquisition_source_detail, p.tags, p.patient_rating,
  p.administrative_notes, p.odoo_partner_id, p.is_active,
  p.created_at, p.updated_at, p.created_by
FROM schema_medical.patients p;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.patients TO authenticated;
