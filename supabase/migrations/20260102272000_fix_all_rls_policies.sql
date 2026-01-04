-- CRITICAL SECURITY FIX: Fix all RPCs to filter by clinic_id
-- Description: Ensure all RPCs respect multi-tenancy

-- 1. Fix get_lab_dashboard_stats
DROP FUNCTION IF EXISTS public.get_lab_dashboard_stats();

CREATE OR REPLACE FUNCTION public.get_lab_dashboard_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = schema_lab, schema_core, public
AS $$
DECLARE
    v_stats JSONB;
    v_user_role TEXT;
    v_clinic_id UUID;
BEGIN
    -- Get user role and clinic_id
    SELECT role, clinic_id INTO v_user_role, v_clinic_id
    FROM schema_core.users
    WHERE id = auth.uid();
    
    -- If clinic user, filter by their clinic_id
    IF v_user_role IN ('clinic_admin', 'clinic_doctor', 'clinic_staff', 'clinic_receptionist') THEN
        SELECT jsonb_build_object(
            'clinic_pending', (SELECT COUNT(*) FROM schema_lab.orders WHERE status = 'clinic_pending' AND clinic_id = v_clinic_id),
            'digital_picking', (SELECT COUNT(*) FROM schema_lab.orders WHERE status = 'digital_picking' AND clinic_id = v_clinic_id),
            'income_validation', (SELECT COUNT(*) FROM schema_lab.orders WHERE status = 'income_validation' AND clinic_id = v_clinic_id),
            'gypsum', (SELECT COUNT(*) FROM schema_lab.orders WHERE status = 'gypsum' AND clinic_id = v_clinic_id),
            'design', (SELECT COUNT(*) FROM schema_lab.orders WHERE status = 'design' AND clinic_id = v_clinic_id),
            'client_approval', (SELECT COUNT(*) FROM schema_lab.orders WHERE status = 'client_approval' AND clinic_id = v_clinic_id),
            'nesting', (SELECT COUNT(*) FROM schema_lab.orders WHERE status = 'nesting' AND clinic_id = v_clinic_id),
            'production_man', (SELECT COUNT(*) FROM schema_lab.orders WHERE status = 'production_man' AND clinic_id = v_clinic_id),
            'qa', (SELECT COUNT(*) FROM schema_lab.orders WHERE status = 'qa' AND clinic_id = v_clinic_id),
            'billing', (SELECT COUNT(*) FROM schema_lab.orders WHERE status = 'billing' AND clinic_id = v_clinic_id),
            'delivery', (SELECT COUNT(*) FROM schema_lab.orders WHERE status = 'delivery' AND clinic_id = v_clinic_id),
            'avg_sla_pct', 0
        ) INTO v_stats;
    ELSE
        -- Lab users and admins see all orders
        SELECT jsonb_build_object(
            'clinic_pending', (SELECT COUNT(*) FROM schema_lab.orders WHERE status = 'clinic_pending'),
            'digital_picking', (SELECT COUNT(*) FROM schema_lab.orders WHERE status = 'digital_picking'),
            'income_validation', (SELECT COUNT(*) FROM schema_lab.orders WHERE status = 'income_validation'),
            'gypsum', (SELECT COUNT(*) FROM schema_lab.orders WHERE status = 'gypsum'),
            'design', (SELECT COUNT(*) FROM schema_lab.orders WHERE status = 'design'),
            'client_approval', (SELECT COUNT(*) FROM schema_lab.orders WHERE status = 'client_approval'),
            'nesting', (SELECT COUNT(*) FROM schema_lab.orders WHERE status = 'nesting'),
            'production_man', (SELECT COUNT(*) FROM schema_lab.orders WHERE status = 'production_man'),
            'qa', (SELECT COUNT(*) FROM schema_lab.orders WHERE status = 'qa'),
            'billing', (SELECT COUNT(*) FROM schema_lab.orders WHERE status = 'billing'),
            'delivery', (SELECT COUNT(*) FROM schema_lab.orders WHERE status = 'delivery'),
            'avg_sla_pct', 0
        ) INTO v_stats;
    END IF;
    
    RETURN v_stats;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_lab_dashboard_stats() TO authenticated;

-- 2. Add RLS policies to patients table
ALTER TABLE schema_medical.patients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clinic users see only their patients" ON schema_medical.patients;
CREATE POLICY "Clinic users see only their patients"
ON schema_medical.patients
FOR SELECT
TO authenticated
USING (
    clinic_id IN (
        SELECT clinic_id FROM schema_core.users WHERE id = auth.uid()
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
        SELECT clinic_id FROM schema_core.users WHERE id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Clinic users can update their own patients" ON schema_medical.patients;
CREATE POLICY "Clinic users can update their own patients"
ON schema_medical.patients
FOR UPDATE
TO authenticated
USING (
    clinic_id IN (
        SELECT clinic_id FROM schema_core.users WHERE id = auth.uid()
    )
);

-- 3. Add RLS policies to clinical_findings table
ALTER TABLE schema_medical.clinical_findings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users see findings of their clinic patients" ON schema_medical.clinical_findings;
CREATE POLICY "Users see findings of their clinic patients"
ON schema_medical.clinical_findings
FOR SELECT
TO authenticated
USING (
    patient_id IN (
        SELECT id FROM schema_medical.patients 
        WHERE clinic_id IN (
            SELECT clinic_id FROM schema_core.users WHERE id = auth.uid()
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
            SELECT clinic_id FROM schema_core.users WHERE id = auth.uid()
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
            SELECT clinic_id FROM schema_core.users WHERE id = auth.uid()
        )
    )
);

-- 4. Add RLS policies to orders table
ALTER TABLE schema_lab.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clinic users see only their orders" ON schema_lab.orders;
CREATE POLICY "Clinic users see only their orders"
ON schema_lab.orders
FOR SELECT
TO authenticated
USING (
    clinic_id IN (
        SELECT clinic_id FROM schema_core.users WHERE id = auth.uid()
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
        SELECT clinic_id FROM schema_core.users WHERE id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Orders can be updated by clinic or lab" ON schema_lab.orders;
CREATE POLICY "Orders can be updated by clinic or lab"
ON schema_lab.orders
FOR UPDATE
TO authenticated
USING (
    clinic_id IN (
        SELECT clinic_id FROM schema_core.users WHERE id = auth.uid()
    )
    OR
    EXISTS (
        SELECT 1 FROM schema_core.users 
        WHERE id = auth.uid() 
        AND role IN ('super_admin', 'lab_admin', 'lab_staff', 'courier')
    )
);

COMMENT ON POLICY "Clinic users see only their patients" ON schema_medical.patients IS 'RLS: Clinics only see their own patients';
COMMENT ON POLICY "Clinic users see only their orders" ON schema_lab.orders IS 'RLS: Clinics only see their own orders';
COMMENT ON POLICY "Users see findings of their clinic patients" ON schema_medical.clinical_findings IS 'RLS: Users only see findings of their clinic patients';
