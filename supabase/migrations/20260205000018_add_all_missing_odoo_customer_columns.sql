-- Add ALL Missing Columns to odoo_customers
-- Date: 2026-01-03
-- Issue: Phase 2 RPC expects multiple columns that don't exist in original table

-- Add payment-related columns
ALTER TABLE schema_core.odoo_customers 
ADD COLUMN IF NOT EXISTS payment_term_id INTEGER;

ALTER TABLE schema_core.odoo_customers 
ADD COLUMN IF NOT EXISTS payment_term_name TEXT;

ALTER TABLE schema_core.odoo_customers 
ADD COLUMN IF NOT EXISTS payment_policy TEXT;

-- Add raw_data for storing full Odoo response
ALTER TABLE schema_core.odoo_customers 
ADD COLUMN IF NOT EXISTS raw_data JSONB DEFAULT '{}'::jsonb;

-- Add updated_at timestamp
ALTER TABLE schema_core.odoo_customers 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add comments for clarity
COMMENT ON COLUMN schema_core.odoo_customers.payment_term_id IS 'Odoo payment term ID';
COMMENT ON COLUMN schema_core.odoo_customers.payment_term_name IS 'Odoo payment term name';
COMMENT ON COLUMN schema_core.odoo_customers.payment_policy IS 'Payment policy: cash or credit';
COMMENT ON COLUMN schema_core.odoo_customers.raw_data IS 'Full Odoo partner response (JSONB)';
COMMENT ON COLUMN schema_core.odoo_customers.updated_at IS 'Last sync timestamp';
