-- 🦅 DENTALFLOW V5 (2026) - INITIAL MIGRATION
-- Author: Antigravity Agent
-- Description: Sets up the 4 isolated schemas and the Core Governance tables.

-- 1. CLEANUP (Safety Check - Disable in Prod if needed)
-- DROP SCHEMA IF EXISTS schema_core CASCADE;
-- DROP SCHEMA IF EXISTS schema_lab CASCADE;
-- DROP SCHEMA IF EXISTS schema_medical CASCADE;
-- DROP SCHEMA IF EXISTS schema_logistics CASCADE;

-- 2. CREATE SCHEMAS (Isolation Layer)
CREATE SCHEMA IF NOT EXISTS schema_core;      -- Auth, Governance, Modules
CREATE SCHEMA IF NOT EXISTS schema_lab;       -- Production, Kanban, Inventories
CREATE SCHEMA IF NOT EXISTS schema_medical;   -- Patients, Odontograms, Clinical
CREATE SCHEMA IF NOT EXISTS schema_logistics; -- Tracking, Routes

-- 3. SCHEMA CORE: GOVERNANCE & AUTH
-- Users table extends Supabase Auth
CREATE TABLE schema_core.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'clinic_admin', 'doctor', 'lab_admin', 'lab_staff', 'courier', 'patient')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Modules table (Feature Flags)
CREATE TABLE schema_core.modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL, -- 'lab_kanban', 'logistics_tracking', etc.
    name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    config JSONB DEFAULT '{}'::JSONB, -- For Odoo settings, timings, etc.
    version TEXT DEFAULT '1.0.0',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SCHEMA CORE: RLS POLICIES (Baseline)
ALTER TABLE schema_core.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE schema_core.modules ENABLE ROW LEVEL SECURITY;

-- Policy: Public Read for active modules (so frontend knows what to show)
CREATE POLICY "Public read active modules" ON schema_core.modules
    FOR SELECT TO authenticated
    USING (is_active = true);

-- Policy: Users can read their own profile
CREATE POLICY "Users read own profile" ON schema_core.users
    FOR SELECT TO authenticated
    USING (auth.uid() = id);

-- 5. FUNCTION: Handle New User (Trigger)
CREATE OR REPLACE FUNCTION schema_core.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO schema_core.users (id, email, role)
    VALUES (new.id, new.email, 'patient'); -- Default role, change via Admin Panel
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION schema_core.handle_new_user();

-- 6. GRANT USAGE
GRANT USAGE ON SCHEMA schema_core TO authenticated;
GRANT USAGE ON SCHEMA schema_lab TO authenticated;
GRANT USAGE ON SCHEMA schema_medical TO authenticated;
GRANT USAGE ON SCHEMA schema_logistics TO authenticated;

GRANT SELECT ON ALL TABLES IN SCHEMA schema_core TO authenticated;
