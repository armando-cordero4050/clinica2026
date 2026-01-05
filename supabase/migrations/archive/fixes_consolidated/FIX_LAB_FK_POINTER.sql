-- FIX Lab Order Items FK to point to Public Catalog
-- Reason: Frontend uses Public Catalog (seeded), Schema_Lab Catalog is empty/broken
-- Context: PR-1 / Lab Verification

BEGIN;

-- 1. Drop old constraint pointing to schema_lab.lab_configurations
ALTER TABLE schema_lab.lab_order_items 
DROP CONSTRAINT IF EXISTS lab_order_items_configuration_id_fkey;

-- 2. Add new constraint pointing to public.lab_configurations
ALTER TABLE schema_lab.lab_order_items 
ADD CONSTRAINT lab_order_items_configuration_id_fkey 
FOREIGN KEY (configuration_id) 
REFERENCES public.lab_configurations(id);

COMMIT;
