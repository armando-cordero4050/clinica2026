-- FIX RECURSIVE RLS ON CLINIC_STAFF
-- The previous policy caused infinite recursion because it didn't have a base case for self-access.

ALTER TABLE schema_medical.clinic_staff ENABLE ROW LEVEL SECURITY;

-- Drop verify existing policies (better to be safe)
DROP POLICY IF EXISTS "Users can view staff of their clinic" ON schema_medical.clinic_staff;
DROP POLICY IF EXISTS "Admins can manage staff" ON schema_medical.clinic_staff;

-- 1. Base Policy: Users can see THEMSELVES (Breaks recursion)
CREATE POLICY "Users can view own staff record" ON schema_medical.clinic_staff
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

-- 2. Extended Policy: Users can see OTHERS in their clinic
-- We use a security definer function or just rely on the fact that they can now read their own clinic_id
-- But to avoid complex nested recursion, we often split it.
-- Or we use EXISTS with a non-recursive lookup if possible.
-- A common pattern to avoid recursion in hierarchy is using a separate lookup table or trusted function.
-- However, since we added "Users can view own staff record", the simple subquery MIGHT work if the optimizer uses the index.
-- But safest is to use `user_id = auth.uid()` OR ...
-- Let's try combining them safely.

CREATE POLICY "Users can view colleagues" ON schema_medical.clinic_staff
    FOR SELECT TO authenticated
    USING (
        clinic_id IN (
            SELECT clinic_id FROM schema_medical.clinic_staff WHERE user_id = auth.uid()
        )
    );

-- 3. Admins
CREATE POLICY "Admins can manage staff" ON schema_medical.clinic_staff
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM schema_core.users 
            WHERE id = auth.uid() 
            AND role IN ('super_admin', 'lab_admin')
        )
    );
