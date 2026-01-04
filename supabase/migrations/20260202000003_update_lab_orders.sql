-- 20260202000003_update_lab_orders.sql
-- Description: Add patient_id to schema_lab.orders and ensure RLS policies allow Clinic creation.

-- 1. Add patient_id column if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'schema_lab' AND table_name = 'orders' AND column_name = 'patient_id') THEN
        ALTER TABLE schema_lab.orders ADD COLUMN patient_id UUID REFERENCES schema_medical.patients(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 2. Ensure RLS Policies for CLINICS to create orders
-- The previous policy "Lab Internal Read" restricted access to 'lab_staff'.
-- We need Clinics (Doctors/Admin) to also INSERT into this table.

-- Policy: Clinic Staff can SELECT their own orders
DROP POLICY IF EXISTS "Clinic Isolation Select" ON schema_lab.orders;
CREATE POLICY "Clinic Isolation Select" ON schema_lab.orders
    FOR SELECT TO authenticated
    USING (
        clinic_id IN (SELECT clinic_id FROM schema_medical.clinic_staff WHERE user_id = auth.uid()) -- Clinic Staff
        OR
        (SELECT role FROM schema_core.users WHERE id = auth.uid()) IN ('super_admin', 'lab_admin', 'lab_staff') -- Lab Staff
    );

-- Policy: Clinic Staff can INSERT orders (for their clinic)
DROP POLICY IF EXISTS "Clinic Creation" ON schema_lab.orders;
CREATE POLICY "Clinic Creation" ON schema_lab.orders
    FOR INSERT TO authenticated
    WITH CHECK (
        clinic_id IN (SELECT clinic_id FROM schema_medical.clinic_staff WHERE user_id = auth.uid())
    );

-- Policy: Clinic Staff can Insert Items
DROP POLICY IF EXISTS "Clinic Creation Items" ON schema_lab.order_items;
CREATE POLICY "Clinic Creation Items" ON schema_lab.order_items
    FOR INSERT TO authenticated
    WITH CHECK (
        order_id IN (SELECT id FROM schema_lab.orders WHERE clinic_id IN (SELECT clinic_id FROM schema_medical.clinic_staff WHERE user_id = auth.uid()))
    );

-- Policy: Clinic Staff can Select Items
DROP POLICY IF EXISTS "Clinic Select Items" ON schema_lab.order_items;
CREATE POLICY "Clinic Select Items" ON schema_lab.order_items
    FOR SELECT TO authenticated
    USING (
         order_id IN (SELECT id FROM schema_lab.orders WHERE clinic_id IN (SELECT clinic_id FROM schema_medical.clinic_staff WHERE user_id = auth.uid()))
         OR
         (SELECT role FROM schema_core.users WHERE id = auth.uid()) IN ('super_admin', 'lab_admin', 'lab_staff')
    );
