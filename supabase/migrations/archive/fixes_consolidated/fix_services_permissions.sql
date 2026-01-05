-- =====================================================
-- FIX PERMISSIONS FOR SERVICE MANAGEMENT
-- Description: Grant write access to authenticated users for
--              services and prices tables, with RLS policies.
-- =====================================================

-- 1. Grant access to authenticated users on underlying tables
GRANT ALL ON TABLE schema_lab.services TO authenticated;
GRANT ALL ON TABLE schema_medical.clinic_service_prices TO authenticated;

-- 2. RLS for Services (Global Catalog + Custom)
-- Note: Ideally we should distinguish Custom vs Global. For now, allow all authenticated to edit.
ALTER TABLE schema_lab.services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all access for authenticated users" ON schema_lab.services;
CREATE POLICY "Enable all access for authenticated users"
ON schema_lab.services FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 3. RLS for Prices (Clinic Specific)
ALTER TABLE schema_medical.clinic_service_prices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable access for clinic members" ON schema_medical.clinic_service_prices;
CREATE POLICY "Enable access for clinic members"
ON schema_medical.clinic_service_prices FOR ALL
TO authenticated
USING (
  clinic_id IN (
    SELECT clinic_id FROM schema_medical.clinic_staff WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  clinic_id IN (
    SELECT clinic_id FROM schema_medical.clinic_staff WHERE user_id = auth.uid()
  )
);
