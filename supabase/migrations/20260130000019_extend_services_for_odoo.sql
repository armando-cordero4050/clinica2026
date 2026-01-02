-- Extend services table for Odoo sync
ALTER TABLE schema_lab.services
ADD COLUMN IF NOT EXISTS odoo_category TEXT,
ADD COLUMN IF NOT EXISTS odoo_raw_data JSONB,
ADD COLUMN IF NOT EXISTS last_synced_from_odoo TIMESTAMPTZ;

-- Update category constraint to allow Odoo categories
ALTER TABLE schema_lab.services 
DROP CONSTRAINT IF EXISTS services_category_check;

-- Add comment
COMMENT ON TABLE schema_lab.services IS 'Lab services catalog - synced from Odoo products with LD prefix or lab category';
