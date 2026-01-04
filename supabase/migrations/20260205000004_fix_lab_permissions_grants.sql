-- FORCE GRANTS AND PROFILES ACCESS
-- Usually RLS fails because the user cannot query the role table (profiles)

-- 1. Ensure Public Profiles is readable (Critical for Role Checks)
DROP POLICY IF EXISTS "Authenticated read profiles" ON public.profiles;
CREATE POLICY "Authenticated read profiles" ON public.profiles
FOR SELECT TO authenticated
USING (true); -- Allow reading roles to check permissions

-- 2. SCHEMA GRANTS (Required before RLS kicks in)
GRANT USAGE ON SCHEMA schema_medical TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA schema_medical TO authenticated;

GRANT USAGE ON SCHEMA schema_lab TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA schema_lab TO authenticated;

-- 3. RE-APPLY RLS JUST IN CASE (Idempotent)
-- Clinic Staff
DROP POLICY IF EXISTS "Lab Admin view all staff" ON schema_medical.clinic_staff;
CREATE POLICY "Lab Admin view all staff" ON schema_medical.clinic_staff
FOR SELECT TO authenticated
USING ( 
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('lab_admin', 'lab_staff', 'super_admin')
    )
);

-- Orders
DROP POLICY IF EXISTS "Lab Admin view all orders" ON schema_lab.orders;
CREATE POLICY "Lab Admin view all orders" ON schema_lab.orders
FOR SELECT TO authenticated
USING ( 
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('lab_admin', 'lab_staff', 'super_admin')
    )
);
