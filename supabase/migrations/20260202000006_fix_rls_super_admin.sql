-- FIX RLS FOR SUPER_ADMINS IN LABORATORY SCHEMA
-- This ensures super_admins can create, view and update orders for any clinic.

-- 1. ORDERS Table
DROP POLICY IF EXISTS "Super admins can view all orders" ON schema_lab.orders;
CREATE POLICY "Super admins can view all orders" 
ON schema_lab.orders FOR SELECT 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM schema_core.users 
        WHERE id = auth.uid() AND role = 'super_admin'
    )
    OR 
    clinic_id IN (SELECT clinic_id FROM schema_medical.clinic_staff WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "Clinic Creation" ON schema_lab.orders;
CREATE POLICY "Permitir creacion de ordenes" 
ON schema_lab.orders FOR INSERT 
TO authenticated 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM schema_core.users 
        WHERE id = auth.uid() AND role = 'super_admin'
    )
    OR 
    clinic_id IN (SELECT clinic_id FROM schema_medical.clinic_staff WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "Lab Internal Update" ON schema_lab.orders;
CREATE POLICY "Permitir actualizacion de ordenes" 
ON schema_lab.orders FOR UPDATE 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM schema_core.users 
        WHERE id = auth.uid() AND role IN ('super_admin', 'lab_admin', 'lab_staff')
    )
    OR 
    clinic_id IN (SELECT clinic_id FROM schema_medical.clinic_staff WHERE user_id = auth.uid())
);

-- 2. ORDER_ITEMS Table
ALTER TABLE schema_lab.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "order_items_access" ON schema_lab.order_items;
CREATE POLICY "order_items_access" 
ON schema_lab.order_items FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM schema_core.users 
        WHERE id = auth.uid() AND role = 'super_admin'
    )
    OR
    order_id IN (SELECT id FROM schema_lab.orders) -- Indirect isolation via orders table
);

-- 3. Ensure public views are updated if needed (they should be fine as they just select *)
GRANT ALL ON schema_lab.orders TO authenticated;
GRANT ALL ON schema_lab.order_items TO authenticated;
GRANT ALL ON schema_lab.services TO authenticated;
