-- FIX: Allow Lab Admin to view PUBLIC Clinic Data
-- Frontend uses public.clinic_staff and public.orders (likely synced or views)
-- We need RLS on public schema too.

-- 1. CLINIC STAFF (Public)
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

-- 2. ORDERS (Public)
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

-- 3. GRANTS
GRANT SELECT ON public.clinic_staff TO authenticated;
GRANT SELECT ON public.orders TO authenticated;
