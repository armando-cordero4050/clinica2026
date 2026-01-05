-- Sync Lab Catalog from Public to Schema_Lab
-- This ensures the IDs seen by Frontend (Public) match the FK constraints in Order Tables (Schema_Lab)

BEGIN;

-- 1. Clean Schema_Lab tables (Child to Parent order to avoid FK errors)
TRUNCATE TABLE schema_lab.lab_configurations CASCADE;
TRUNCATE TABLE schema_lab.lab_material_types CASCADE;
TRUNCATE TABLE schema_lab.lab_materials CASCADE;

-- 2. Sync Materials
INSERT INTO schema_lab.lab_materials (id, name, slug, description, is_active, created_at, updated_at)
SELECT id, name, slug, description, is_active, created_at, updated_at
FROM public.lab_materials;

-- 3. Sync Types
INSERT INTO schema_lab.lab_material_types (id, material_id, name, slug, description, created_at, updated_at)
SELECT id, material_id, name, slug, description, created_at, updated_at
FROM public.lab_material_types;

-- 4. Sync Configurations
INSERT INTO schema_lab.lab_configurations (id, type_id, name, slug, category, requires_units, base_price, sla_days, created_at, updated_at)
SELECT id, type_id, name, slug, category, requires_units, base_price, sla_days, created_at, updated_at
FROM public.lab_configurations;

COMMIT;
