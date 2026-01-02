-- Fix RLS policies for clinics table

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view clinics" ON schema_medical.clinics;
DROP POLICY IF EXISTS "Admins can manage clinics" ON schema_medical.clinics;

-- Enable RLS
ALTER TABLE schema_medical.clinics ENABLE ROW LEVEL SECURITY;

-- Create permissive policies
CREATE POLICY "Authenticated users can view all clinics" 
    ON schema_medical.clinics
    FOR SELECT 
    TO authenticated
    USING (true);

CREATE POLICY "Super admins can manage clinics" 
    ON schema_medical.clinics
    FOR ALL 
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM schema_core.users 
            WHERE id = auth.uid() 
            AND role IN ('super_admin', 'lab_admin')
        )
    );

-- Fix RLS for clinic_staff
DROP POLICY IF EXISTS "Users can view staff of their clinic" ON schema_medical.clinic_staff;
DROP POLICY IF EXISTS "Admins can manage staff" ON schema_medical.clinic_staff;

ALTER TABLE schema_medical.clinic_staff ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view all staff" 
    ON schema_medical.clinic_staff
    FOR SELECT 
    TO authenticated
    USING (true);

CREATE POLICY "Super admins can manage staff" 
    ON schema_medical.clinic_staff
    FOR ALL 
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM schema_core.users 
            WHERE id = auth.uid() 
            AND role IN ('super_admin', 'lab_admin')
        )
    );
