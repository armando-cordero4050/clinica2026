-- FINAL PERMISSIONS FIX
-- Force Enable RLS and Re-Apply Policies
-- Ensure profiles is readable for role checks

BEGIN;

-- 1. PROFILES (Critical for Role Checking)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated read profiles" ON public.profiles;
CREATE POLICY "Authenticated read profiles" ON public.profiles
FOR SELECT TO authenticated
USING (true);

-- 2. CLINIC STAFF (Public)
ALTER TABLE public.clinic_staff ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lab Admin view public staff" ON public.clinic_staff;
CREATE POLICY "Lab Admin view public staff" ON public.clinic_staff
FOR SELECT TO authenticated
USING ( 
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('lab_admin', 'lab_staff', 'super_admin')
    )
);

-- 3. ORDERS (Public)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lab Admin view public orders" ON public.orders;
CREATE POLICY "Lab Admin view public orders" ON public.orders
FOR SELECT TO authenticated
USING ( 
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('lab_admin', 'lab_staff', 'super_admin')
    )
);

COMMIT;
