-- Fix RLS policy for clinic_staff to allow users to see their own record
-- Problem: Current policy creates a chicken-and-egg paradox where users
-- can't see their own clinic_staff record because they need to be in
-- clinic_staff to see clinic_staff records.

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view staff of their clinic" ON schema_medical.clinic_staff;
DROP POLICY IF EXISTS "Admins can manage staff" ON schema_medical.clinic_staff;

-- Create new policies

-- 1. Users can always view their OWN clinic_staff record
CREATE POLICY "Users can view their own staff record"
    ON schema_medical.clinic_staff
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- 2. Users can view OTHER staff records from their clinic(s)
CREATE POLICY "Users can view staff of their clinic"
    ON schema_medical.clinic_staff
    FOR SELECT
    TO authenticated
    USING (
        clinic_id IN (
            SELECT clinic_id 
            FROM schema_medical.clinic_staff 
            WHERE user_id = auth.uid()
        )
    );

-- 3. Admins can manage all staff
CREATE POLICY "Admins can manage all staff"
    ON schema_medical.clinic_staff
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 
            FROM schema_core.users 
            WHERE id = auth.uid() 
            AND role IN ('super_admin', 'lab_admin')
        )
    );

-- Add comment
COMMENT ON POLICY "Users can view their own staff record" ON schema_medical.clinic_staff IS 
    'Allows users to see their own clinic_staff record to avoid chicken-and-egg paradox';
