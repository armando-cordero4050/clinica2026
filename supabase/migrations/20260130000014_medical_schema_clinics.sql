-- 🏥 MEDICAL SCHEMA - CLINICS MODULE
-- Description: Base tables for medical/clinic management

-- Create schema if not exists
CREATE SCHEMA IF NOT EXISTS schema_medical;

-- 1. Clinics table
CREATE TABLE IF NOT EXISTS schema_medical.clinics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT,
    city TEXT,
    country TEXT,
    phone TEXT,
    email TEXT UNIQUE NOT NULL,
    nit TEXT,
    website TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create index
CREATE INDEX IF NOT EXISTS idx_clinics_email ON schema_medical.clinics(email);
CREATE INDEX IF NOT EXISTS idx_clinics_active ON schema_medical.clinics(is_active);

-- Grant permissions
GRANT USAGE ON SCHEMA schema_medical TO authenticated;
GRANT ALL ON schema_medical.clinics TO authenticated;
