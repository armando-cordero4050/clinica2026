-- 🚑 FIX PATIENTS INSERT PERMISSIONS
-- Description: Adds missing RLS policies for inserting into schema_medical.patients

-- 1. Ensure RLS is enabled
ALTER TABLE schema_medical.patients ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing restrictive policies if any
DROP POLICY IF EXISTS "Clinic Internal Access" ON schema_medical.patients;
DROP POLICY IF EXISTS "Authenticated users can manage patients" ON schema_medical.patients;

-- 3. Create comprehensive policies for Patients based on Clinic Staff membership
-- POLICY: SELECT (Read)
CREATE POLICY "Staff can view clinic patients" ON schema_medical.patients
    FOR SELECT
    TO authenticated
    USING (
        -- User must be staff of the clinic the patient belongs to
        clinic_id IN (
            SELECT clinic_id 
            FROM schema_medical.clinic_staff 
            WHERE user_id = auth.uid()
        )
    );

-- POLICY: INSERT (Create)
CREATE POLICY "Staff can create clinic patients" ON schema_medical.patients
    FOR INSERT
    TO authenticated
    WITH CHECK (
        -- User must be staff of the clinic they are trying to insert into
        clinic_id IN (
            SELECT clinic_id 
            FROM schema_medical.clinic_staff 
            WHERE user_id = auth.uid()
        )
    );

-- POLICY: UPDATE (Edit)
CREATE POLICY "Staff can update clinic patients" ON schema_medical.patients
    FOR UPDATE
    TO authenticated
    USING (
        clinic_id IN (
            SELECT clinic_id 
            FROM schema_medical.clinic_staff 
            WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        clinic_id IN (
            SELECT clinic_id 
            FROM schema_medical.clinic_staff 
            WHERE user_id = auth.uid()
        )
    );

-- POLICY: DELETE (Remove) - Maybe restricted to admins only? Let's allow staff for now.
CREATE POLICY "Staff can delete clinic patients" ON schema_medical.patients
    FOR DELETE
    TO authenticated
    USING (
        clinic_id IN (
            SELECT clinic_id 
            FROM schema_medical.clinic_staff 
            WHERE user_id = auth.uid()
        )
    );
