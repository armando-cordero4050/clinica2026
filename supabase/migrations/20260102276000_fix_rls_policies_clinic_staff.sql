-- Fix: Update RLS policies to use clinic_staff table
-- Description: Policies need to get clinic_id from clinic_staff, not users

-- Fix patients RLS
DROP POLICY IF EXISTS "Clinic users see only their patients" ON schema_medical.patients;
CREATE POLICY "Clinic users see only their patients"
ON schema_medical.patients
FOR SELECT
TO authenticated
USING (
    clinic_id IN (
        SELECT clinic_id FROM schema_medical.clinic_staff WHERE user_id = auth.uid()
    )
    OR
    EXISTS (
        SELECT 1 FROM schema_core.users 
        WHERE id = auth.uid() 
        AND role IN ('super_admin', 'lab_admin', 'lab_staff', 'courier')
    )
);

DROP POLICY IF EXISTS "Clinic users can insert their own patients" ON schema_medical.patients;
CREATE POLICY "Clinic users can insert their own patients"
ON schema_medical.patients
FOR INSERT
TO authenticated
WITH CHECK (
    clinic_id IN (
        SELECT clinic_id FROM schema_medical.clinic_staff WHERE user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Clinic users can update their own patients" ON schema_medical.patients;
CREATE POLICY "Clinic users can update their own patients"
ON schema_medical.patients
FOR UPDATE
TO authenticated
USING (
    clinic_id IN (
        SELECT clinic_id FROM schema_medical.clinic_staff WHERE user_id = auth.uid()
    )
);

-- Fix clinical_findings RLS
DROP POLICY IF EXISTS "Users see findings of their clinic patients" ON schema_medical.clinical_findings;
CREATE POLICY "Users see findings of their clinic patients"
ON schema_medical.clinical_findings
FOR SELECT
TO authenticated
USING (
    patient_id IN (
        SELECT id FROM schema_medical.patients 
        WHERE clinic_id IN (
            SELECT clinic_id FROM schema_medical.clinic_staff WHERE user_id = auth.uid()
        )
    )
    OR
    EXISTS (
        SELECT 1 FROM schema_core.users 
        WHERE id = auth.uid() 
        AND role IN ('super_admin', 'lab_admin', 'lab_staff', 'courier')
    )
);

DROP POLICY IF EXISTS "Users can insert findings for their clinic patients" ON schema_medical.clinical_findings;
CREATE POLICY "Users can insert findings for their clinic patients"
ON schema_medical.clinical_findings
FOR INSERT
TO authenticated
WITH CHECK (
    patient_id IN (
        SELECT id FROM schema_medical.patients 
        WHERE clinic_id IN (
            SELECT clinic_id FROM schema_medical.clinic_staff WHERE user_id = auth.uid()
        )
    )
);

DROP POLICY IF EXISTS "Users can update findings of their clinic patients" ON schema_medical.clinical_findings;
CREATE POLICY "Users can update findings of their clinic patients"
ON schema_medical.clinical_findings
FOR UPDATE
TO authenticated
USING (
    patient_id IN (
        SELECT id FROM schema_medical.patients 
        WHERE clinic_id IN (
            SELECT clinic_id FROM schema_medical.clinic_staff WHERE user_id = auth.uid()
        )
    )
);

-- Fix orders RLS
DROP POLICY IF EXISTS "Clinic users see only their orders" ON schema_lab.orders;
CREATE POLICY "Clinic users see only their orders"
ON schema_lab.orders
FOR SELECT
TO authenticated
USING (
    clinic_id IN (
        SELECT clinic_id FROM schema_medical.clinic_staff WHERE user_id = auth.uid()
    )
    OR
    EXISTS (
        SELECT 1 FROM schema_core.users 
        WHERE id = auth.uid() 
        AND role IN ('super_admin', 'lab_admin', 'lab_staff', 'courier')
    )
);

DROP POLICY IF EXISTS "Clinic users can insert their own orders" ON schema_lab.orders;
CREATE POLICY "Clinic users can insert their own orders"
ON schema_lab.orders
FOR INSERT
TO authenticated
WITH CHECK (
    clinic_id IN (
        SELECT clinic_id FROM schema_medical.clinic_staff WHERE user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Orders can be updated by clinic or lab" ON schema_lab.orders;
CREATE POLICY "Orders can be updated by clinic or lab"
ON schema_lab.orders
FOR UPDATE
TO authenticated
USING (
    clinic_id IN (
        SELECT clinic_id FROM schema_medical.clinic_staff WHERE user_id = auth.uid()
    )
    OR
    EXISTS (
        SELECT 1 FROM schema_core.users 
        WHERE id = auth.uid() 
        AND role IN ('super_admin', 'lab_admin', 'lab_staff', 'courier')
    )
);

COMMENT ON POLICY "Clinic users see only their patients" ON schema_medical.patients IS 'RLS: Uses clinic_staff to get clinic_id';
COMMENT ON POLICY "Clinic users see only their orders" ON schema_lab.orders IS 'RLS: Uses clinic_staff to get clinic_id';
