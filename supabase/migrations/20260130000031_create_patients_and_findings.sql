-- =====================================================
-- SPRINT 1: EXTENSIÓN DE MÓDULO DE PACIENTES Y HALLAZGOS CLÍNICOS
-- =====================================================
-- Fecha: 30/12/2025
-- Descripción: Extiende tabla de pacientes existente y agrega hallazgos clínicos
-- IMPORTANTE: La tabla schema_medical.patients YA EXISTE (migración 20260103000000)
-- Esta migración solo AGREGA campos faltantes y tablas nuevas
-- =====================================================

-- =====================================================
-- 1. EXTENDER TABLA EXISTENTE: patients
-- =====================================================

-- Agregar campos faltantes a la tabla patients (solo si no existen)
DO $$
BEGIN
  -- ID Type
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'schema_medical' 
                 AND table_name = 'patients' 
                 AND column_name = 'id_type') THEN
    ALTER TABLE schema_medical.patients ADD COLUMN id_type TEXT 
      CHECK (id_type IN ('dpi', 'passport', 'nit', 'other'));
  END IF;

  -- ID Number
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'schema_medical' 
                 AND table_name = 'patients' 
                 AND column_name = 'id_number') THEN
    ALTER TABLE schema_medical.patients ADD COLUMN id_number TEXT;
  END IF;

  -- First Name (renombrar full_name a first_name)
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_schema = 'schema_medical' 
             AND table_name = 'patients' 
             AND column_name = 'full_name') THEN
    -- Primero agregar first_name y last_name si no existen
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'schema_medical' 
                   AND table_name = 'patients' 
                   AND column_name = 'first_name') THEN
      ALTER TABLE schema_medical.patients ADD COLUMN first_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'schema_medical' 
                   AND table_name = 'patients' 
                   AND column_name = 'last_name') THEN
      ALTER TABLE schema_medical.patients ADD COLUMN last_name TEXT;
    END IF;
    
    -- Migrar datos de full_name a first_name/last_name
    UPDATE schema_medical.patients 
    SET first_name = split_part(full_name, ' ', 1),
        last_name = CASE 
          WHEN array_length(string_to_array(full_name, ' '), 1) > 1 
          THEN substring(full_name FROM position(' ' IN full_name) + 1)
          ELSE ''
        END
    WHERE first_name IS NULL;
  END IF;

  -- Gender
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'schema_medical' 
                 AND table_name = 'patients' 
                 AND column_name = 'gender') THEN
    ALTER TABLE schema_medical.patients ADD COLUMN gender TEXT 
      CHECK (gender IN ('male', 'female', 'other'));
  END IF;

  -- Mobile
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'schema_medical' 
                 AND table_name = 'patients' 
                 AND column_name = 'mobile') THEN
    ALTER TABLE schema_medical.patients ADD COLUMN mobile TEXT;
  END IF;

  -- City, State, Country, Zip Code
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'schema_medical' 
                 AND table_name = 'patients' 
                 AND column_name = 'city') THEN
    ALTER TABLE schema_medical.patients ADD COLUMN city TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'schema_medical' 
                 AND table_name = 'patients' 
                 AND column_name = 'state') THEN
    ALTER TABLE schema_medical.patients ADD COLUMN state TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'schema_medical' 
                 AND table_name = 'patients' 
                 AND column_name = 'country') THEN
    ALTER TABLE schema_medical.patients ADD COLUMN country TEXT DEFAULT 'Guatemala';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'schema_medical' 
                 AND table_name = 'patients' 
                 AND column_name = 'zip_code') THEN
    ALTER TABLE schema_medical.patients ADD COLUMN zip_code TEXT;
  END IF;

  -- Guardian (Tutor)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'schema_medical' 
                 AND table_name = 'patients' 
                 AND column_name = 'guardian_name') THEN
    ALTER TABLE schema_medical.patients ADD COLUMN guardian_name TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'schema_medical' 
                 AND table_name = 'patients' 
                 AND column_name = 'guardian_relationship') THEN
    ALTER TABLE schema_medical.patients ADD COLUMN guardian_relationship TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'schema_medical' 
                 AND table_name = 'patients' 
                 AND column_name = 'guardian_phone') THEN
    ALTER TABLE schema_medical.patients ADD COLUMN guardian_phone TEXT;
  END IF;

  -- Blood Type
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'schema_medical' 
                 AND table_name = 'patients' 
                 AND column_name = 'blood_type') THEN
    ALTER TABLE schema_medical.patients ADD COLUMN blood_type TEXT 
      CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'));
  END IF;

  -- Current Medications
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'schema_medical' 
                 AND table_name = 'patients' 
                 AND column_name = 'current_medications') THEN
    ALTER TABLE schema_medical.patients ADD COLUMN current_medications TEXT[] DEFAULT ARRAY[]::TEXT[];
  END IF;

  -- Chronic Conditions (renombrar medical_conditions)
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_schema = 'schema_medical' 
             AND table_name = 'patients' 
             AND column_name = 'medical_conditions'
             AND data_type = 'jsonb') THEN
    -- Migrar de JSONB a TEXT[]
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'schema_medical' 
                   AND table_name = 'patients' 
                   AND column_name = 'chronic_conditions') THEN
      ALTER TABLE schema_medical.patients ADD COLUMN chronic_conditions TEXT[] DEFAULT ARRAY[]::TEXT[];
    END IF;
  END IF;

  -- Emergency Contact
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'schema_medical' 
                 AND table_name = 'patients' 
                 AND column_name = 'emergency_contact_name') THEN
    ALTER TABLE schema_medical.patients ADD COLUMN emergency_contact_name TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'schema_medical' 
                 AND table_name = 'patients' 
                 AND column_name = 'emergency_contact_phone') THEN
    ALTER TABLE schema_medical.patients ADD COLUMN emergency_contact_phone TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'schema_medical' 
                 AND table_name = 'patients' 
                 AND column_name = 'emergency_contact_relationship') THEN
    ALTER TABLE schema_medical.patients ADD COLUMN emergency_contact_relationship TEXT;
  END IF;

  -- Patient Code
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'schema_medical' 
                 AND table_name = 'patients' 
                 AND column_name = 'patient_code') THEN
    ALTER TABLE schema_medical.patients ADD COLUMN patient_code TEXT;
  END IF;

  -- Insurance
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'schema_medical' 
                 AND table_name = 'patients' 
                 AND column_name = 'insurance_provider') THEN
    ALTER TABLE schema_medical.patients ADD COLUMN insurance_provider TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'schema_medical' 
                 AND table_name = 'patients' 
                 AND column_name = 'insurance_policy_number') THEN
    ALTER TABLE schema_medical.patients ADD COLUMN insurance_policy_number TEXT;
  END IF;

  -- Marketing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'schema_medical' 
                 AND table_name = 'patients' 
                 AND column_name = 'acquisition_source') THEN
    ALTER TABLE schema_medical.patients ADD COLUMN acquisition_source TEXT 
      CHECK (acquisition_source IN ('instagram', 'facebook', 'google', 'referral', 'walk_in', 'other'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'schema_medical' 
                 AND table_name = 'patients' 
                 AND column_name = 'acquisition_source_detail') THEN
    ALTER TABLE schema_medical.patients ADD COLUMN acquisition_source_detail TEXT;
  END IF;

  -- Tags
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'schema_medical' 
                 AND table_name = 'patients' 
                 AND column_name = 'tags') THEN
    ALTER TABLE schema_medical.patients ADD COLUMN tags TEXT[] DEFAULT ARRAY[]::TEXT[];
  END IF;

  -- Patient Rating
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'schema_medical' 
                 AND table_name = 'patients' 
                 AND column_name = 'patient_rating') THEN
    ALTER TABLE schema_medical.patients ADD COLUMN patient_rating INTEGER 
      CHECK (patient_rating BETWEEN 1 AND 5);
  END IF;

  -- Administrative Notes
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'schema_medical' 
                 AND table_name = 'patients' 
                 AND column_name = 'administrative_notes') THEN
    ALTER TABLE schema_medical.patients ADD COLUMN administrative_notes TEXT;
  END IF;

  -- Odoo Integration
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'schema_medical' 
                 AND table_name = 'patients' 
                 AND column_name = 'odoo_partner_id') THEN
    ALTER TABLE schema_medical.patients ADD COLUMN odoo_partner_id INTEGER UNIQUE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'schema_medical' 
                 AND table_name = 'patients' 
                 AND column_name = 'odoo_raw_data') THEN
    ALTER TABLE schema_medical.patients ADD COLUMN odoo_raw_data JSONB;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'schema_medical' 
                 AND table_name = 'patients' 
                 AND column_name = 'last_synced_to_odoo') THEN
    ALTER TABLE schema_medical.patients ADD COLUMN last_synced_to_odoo TIMESTAMPTZ;
  END IF;

  -- Active Status
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'schema_medical' 
                 AND table_name = 'patients' 
                 AND column_name = 'is_active') THEN
    ALTER TABLE schema_medical.patients ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
  END IF;

  -- Created By
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'schema_medical' 
                 AND table_name = 'patients' 
                 AND column_name = 'created_by') THEN
    ALTER TABLE schema_medical.patients ADD COLUMN created_by UUID REFERENCES schema_core.users(id);
  END IF;

END $$;

-- Agregar constraint único para patient_code por clínica (si no existe)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint 
                 WHERE conname = 'unique_patient_code_per_clinic') THEN
    ALTER TABLE schema_medical.patients 
      ADD CONSTRAINT unique_patient_code_per_clinic UNIQUE (clinic_id, patient_code);
  END IF;
END $$;

-- Índices adicionales (solo si no existen)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes 
                 WHERE schemaname = 'schema_medical' 
                 AND tablename = 'patients' 
                 AND indexname = 'idx_patients_active') THEN
    CREATE INDEX idx_patients_active ON schema_medical.patients(clinic_id, is_active);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes 
                 WHERE schemaname = 'schema_medical' 
                 AND tablename = 'patients' 
                 AND indexname = 'idx_patients_odoo') THEN
    CREATE INDEX idx_patients_odoo ON schema_medical.patients(odoo_partner_id) WHERE odoo_partner_id IS NOT NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes 
                 WHERE schemaname = 'schema_medical' 
                 AND tablename = 'patients' 
                 AND indexname = 'idx_patients_code') THEN
    CREATE INDEX idx_patients_code ON schema_medical.patients(patient_code);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes 
                 WHERE schemaname = 'schema_medical' 
                 AND tablename = 'patients' 
                 AND indexname = 'idx_patients_search') THEN
    CREATE INDEX idx_patients_search ON schema_medical.patients USING gin(
      to_tsvector('spanish', 
        COALESCE(first_name, '') || ' ' || 
        COALESCE(last_name, '') || ' ' || 
        COALESCE(patient_code, '') || ' ' ||
        COALESCE(email, '')
      )
    );
  END IF;
END $$;

-- =====================================================
-- 2. CREAR TABLAS NUEVAS (solo si no existen)
-- =====================================================

-- Table: clinical_findings
CREATE TABLE IF NOT EXISTS schema_medical.clinical_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES schema_medical.clinics(id) ON DELETE RESTRICT,
  patient_id UUID NOT NULL REFERENCES schema_medical.patients(id) ON DELETE CASCADE,
  
  tooth_number INTEGER NOT NULL CHECK (tooth_number BETWEEN 11 AND 85),
  surfaces TEXT[] DEFAULT ARRAY[]::TEXT[],
  finding_type TEXT NOT NULL,
  diagnosis TEXT,
  treatment_proposed TEXT,
  treatment_notes TEXT,
  material TEXT,
  color_code TEXT,
  status TEXT DEFAULT 'initial' CHECK (status IN ('initial', 'evolution', 'completed', 'discharged')),
  finding_date DATE NOT NULL DEFAULT CURRENT_DATE,
  budget_item_id UUID,
  mapped_service_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES schema_core.users(id),
  
  CONSTRAINT valid_tooth_surfaces CHECK (
    surfaces <@ ARRAY['mesial', 'distal', 'oclusal', 'vestibular', 'lingual', 'full']::TEXT[]
  )
);

-- Índices para clinical_findings
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_findings_clinic') THEN
    CREATE INDEX idx_findings_clinic ON schema_medical.clinical_findings(clinic_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_findings_patient') THEN
    CREATE INDEX idx_findings_patient ON schema_medical.clinical_findings(patient_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_findings_tooth') THEN
    CREATE INDEX idx_findings_tooth ON schema_medical.clinical_findings(tooth_number);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_findings_status') THEN
    CREATE INDEX idx_findings_status ON schema_medical.clinical_findings(status);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_findings_type') THEN
    CREATE INDEX idx_findings_type ON schema_medical.clinical_findings(finding_type);
  END IF;
END $$;

-- RLS para clinical_findings
ALTER TABLE schema_medical.clinical_findings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS findings_clinic_isolation ON schema_medical.clinical_findings;
CREATE POLICY findings_clinic_isolation ON schema_medical.clinical_findings
  FOR ALL
  USING (
    clinic_id IN (
      SELECT clinic_id 
      FROM schema_medical.clinic_staff 
      WHERE user_id = auth.uid()
    )
  );

-- Table: finding_types_config
CREATE TABLE IF NOT EXISTS schema_medical.finding_types_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES schema_medical.clinics(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  color_hex TEXT DEFAULT '#000000',
  icon_name TEXT,
  default_service_id UUID,
  auto_add_to_budget BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_code_per_clinic UNIQUE (clinic_id, code)
);

-- Índices
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_finding_types_clinic') THEN
    CREATE INDEX idx_finding_types_clinic ON schema_medical.finding_types_config(clinic_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_finding_types_active') THEN
    CREATE INDEX idx_finding_types_active ON schema_medical.finding_types_config(clinic_id, is_active);
  END IF;
END $$;

-- RLS
ALTER TABLE schema_medical.finding_types_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS finding_types_clinic_isolation ON schema_medical.finding_types_config;
CREATE POLICY finding_types_clinic_isolation ON schema_medical.finding_types_config
  FOR ALL
  USING (
    clinic_id IN (
      SELECT clinic_id 
      FROM schema_medical.clinic_staff 
      WHERE user_id = auth.uid()
    )
  );

-- Table: evolution_notes
CREATE TABLE IF NOT EXISTS schema_medical.evolution_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES schema_medical.clinics(id) ON DELETE RESTRICT,
  patient_id UUID NOT NULL REFERENCES schema_medical.patients(id) ON DELETE CASCADE,
  note_date DATE NOT NULL DEFAULT CURRENT_DATE,
  note_content TEXT NOT NULL,
  note_type TEXT CHECK (note_type IN ('consultation', 'treatment', 'follow_up', 'observation', 'emergency', 'other')),
  doctor_id UUID REFERENCES schema_core.users(id),
  attachments JSONB DEFAULT '[]'::JSONB,
  vital_signs JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES schema_core.users(id)
);

-- Índices
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_evolution_clinic') THEN
    CREATE INDEX idx_evolution_clinic ON schema_medical.evolution_notes(clinic_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_evolution_patient') THEN
    CREATE INDEX idx_evolution_patient ON schema_medical.evolution_notes(patient_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_evolution_date') THEN
    CREATE INDEX idx_evolution_date ON schema_medical.evolution_notes(note_date DESC);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_evolution_doctor') THEN
    CREATE INDEX idx_evolution_doctor ON schema_medical.evolution_notes(doctor_id);
  END IF;
END $$;

-- RLS
ALTER TABLE schema_medical.evolution_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS evolution_clinic_isolation ON schema_medical.evolution_notes;
CREATE POLICY evolution_clinic_isolation ON schema_medical.evolution_notes
  FOR ALL
  USING (
    clinic_id IN (
      SELECT clinic_id 
      FROM schema_medical.clinic_staff 
      WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- 3. VISTAS PÚBLICAS (Recrear siempre)
-- =====================================================

DROP VIEW IF EXISTS public.patients CASCADE;
CREATE OR REPLACE VIEW public.patients AS
SELECT 
  id, clinic_id, id_type, id_number, first_name, last_name,
  date_of_birth, gender, email, phone, mobile,
  address, city, state, country, zip_code,
  guardian_name, guardian_relationship, guardian_phone,
  blood_type, allergies, chronic_conditions, current_medications,
  emergency_contact_name, emergency_contact_phone, emergency_contact_relationship,
  patient_code, insurance_provider, insurance_policy_number,
  acquisition_source, acquisition_source_detail, tags, patient_rating,
  administrative_notes, odoo_partner_id, is_active,
  created_at, updated_at, created_by
FROM schema_medical.patients;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.patients TO authenticated;

DROP VIEW IF EXISTS public.clinical_findings CASCADE;
CREATE OR REPLACE VIEW public.clinical_findings AS
SELECT 
  id, clinic_id, patient_id, tooth_number, surfaces,
  finding_type, diagnosis, treatment_proposed, treatment_notes,
  material, color_code, status, finding_date,
  budget_item_id, mapped_service_id,
  created_at, updated_at, created_by
FROM schema_medical.clinical_findings;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.clinical_findings TO authenticated;

DROP VIEW IF EXISTS public.finding_types_config CASCADE;
CREATE OR REPLACE VIEW public.finding_types_config AS
SELECT 
  id, clinic_id, name, code, description,
  color_hex, icon_name, default_service_id, auto_add_to_budget,
  is_active, sort_order, created_at, updated_at
FROM schema_medical.finding_types_config;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.finding_types_config TO authenticated;

DROP VIEW IF EXISTS public.evolution_notes CASCADE;
CREATE OR REPLACE VIEW public.evolution_notes AS
SELECT 
  id, clinic_id, patient_id, note_date, note_content, note_type,
  doctor_id, attachments, vital_signs,
  created_at, updated_at, created_by
FROM schema_medical.evolution_notes;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.evolution_notes TO authenticated;

-- =====================================================
-- FIN DE LA MIGRACIÓN
-- =====================================================
