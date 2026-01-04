-- FIX MEDICAL RLS FOR SUPER ADMINS
-- Description: Allow super_admins to view everything in schema_medical for global management.

-- 1. CLINICS
DROP POLICY IF EXISTS "Allow super_admin to view all clinics" ON schema_medical.clinics;
CREATE POLICY "Allow super_admin to view all clinics" ON schema_medical.clinics
    FOR SELECT TO authenticated
    USING ( (SELECT role FROM schema_core.users WHERE id = auth.uid()) = 'super_admin' );

-- 2. CLINIC_STAFF
DROP POLICY IF EXISTS "Allow super_admin to view all staff" ON schema_medical.clinic_staff;
CREATE POLICY "Allow super_admin to view all staff" ON schema_medical.clinic_staff
    FOR SELECT TO authenticated
    USING ( (SELECT role FROM schema_core.users WHERE id = auth.uid()) = 'super_admin' );

-- 3. PATIENTS
DROP POLICY IF EXISTS "Allow super_admin to view all patients" ON schema_medical.patients;
CREATE POLICY "Allow super_admin to view all patients" ON schema_medical.patients
    FOR SELECT TO authenticated
    USING ( (SELECT role FROM schema_core.users WHERE id = auth.uid()) = 'super_admin' );

-- 4. APPOINTMENTS (Bonus)
DROP POLICY IF EXISTS "Allow super_admin to view all appointments" ON schema_medical.appointments;
CREATE POLICY "Allow super_admin to view all appointments" ON schema_medical.appointments
    FOR SELECT TO authenticated
    USING ( (SELECT role FROM schema_core.users WHERE id = auth.uid()) = 'super_admin' );

-- 5. BUDGETS (Bonus)
DROP POLICY IF EXISTS "Allow super_admin to view all budgets" ON schema_medical.budgets;
CREATE POLICY "Allow super_admin to view all budgets" ON schema_medical.budgets
    FOR SELECT TO authenticated
    USING ( (SELECT role FROM schema_core.users WHERE id = auth.uid()) = 'super_admin' );
