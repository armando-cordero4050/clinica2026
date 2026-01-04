-- Add odoo_id column to clinics table
-- Date: 2026-01-03
-- Issue: RPC sync_clinic_from_odoo expects 'odoo_id' but table has 'odoo_partner_id'

-- Add odoo_id column (unique constraint for upsert)
ALTER TABLE schema_medical.clinics 
ADD COLUMN IF NOT EXISTS odoo_id INTEGER UNIQUE;

-- Copy existing data from odoo_partner_id to odoo_id
UPDATE schema_medical.clinics 
SET odoo_id = odoo_partner_id 
WHERE odoo_partner_id IS NOT NULL AND odoo_id IS NULL;

-- Add comment
COMMENT ON COLUMN schema_medical.clinics.odoo_id IS 'Odoo partner ID (for sync_clinic_from_odoo RPC)';

-- Note: We keep odoo_partner_id for backward compatibility
-- Future migrations can deprecate odoo_partner_id once all code uses odoo_id
