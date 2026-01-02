-- Create clinic_staff table
CREATE TABLE IF NOT EXISTS schema_medical.clinic_staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES schema_medical.clinics(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES schema_core.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('clinic_admin', 'clinic_doctor', 'clinic_staff', 'clinic_receptionist')),
    is_primary BOOLEAN DEFAULT FALSE,
    odoo_contact_id INTEGER,
    odoo_raw_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(clinic_id, user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_clinic_staff_clinic ON schema_medical.clinic_staff(clinic_id);
CREATE INDEX IF NOT EXISTS idx_clinic_staff_user ON schema_medical.clinic_staff(user_id);
CREATE INDEX IF NOT EXISTS idx_clinic_staff_odoo ON schema_medical.clinic_staff(odoo_contact_id);

-- Enable RLS
ALTER TABLE schema_medical.clinic_staff ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view staff of their clinic" ON schema_medical.clinic_staff
    FOR SELECT TO authenticated
    USING (
        clinic_id IN (
            SELECT clinic_id FROM schema_medical.clinic_staff WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage staff" ON schema_medical.clinic_staff
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM schema_core.users 
            WHERE id = auth.uid() 
            AND role IN ('super_admin', 'lab_admin')
        )
    );

-- Add comments
COMMENT ON TABLE schema_medical.clinic_staff IS 'Staff members of clinics synced from Odoo contacts';
COMMENT ON COLUMN schema_medical.clinic_staff.is_primary IS 'First contact becomes clinic admin';
