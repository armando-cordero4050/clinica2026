-- Add Missing Columns to odoo_customers
-- Date: 2026-01-03
-- Issue: Phase 2 RPC expects 'mobile' and 'country_id' columns but they don't exist

-- Add mobile column (missing from original table creation)
ALTER TABLE schema_core.odoo_customers 
ADD COLUMN IF NOT EXISTS mobile TEXT;

-- Add country_id column (original had 'country' as TEXT, Phase 2 needs 'country_id' as INTEGER)
ALTER TABLE schema_core.odoo_customers 
ADD COLUMN IF NOT EXISTS country_id INTEGER;

-- Add comment for clarity
COMMENT ON COLUMN schema_core.odoo_customers.mobile IS 'Mobile phone number from Odoo partner';
COMMENT ON COLUMN schema_core.odoo_customers.country_id IS 'Odoo country ID (many2one relation)';
