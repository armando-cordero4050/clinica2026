-- Fix Column Name Mismatch in odoo_customers
-- Date: 2026-01-03
-- Issue: Phase 2 RPC expects 'odoo_customer_id' but table has 'odoo_partner_id'

-- Rename column to match Phase 2 expectations
ALTER TABLE schema_core.odoo_customers 
RENAME COLUMN odoo_partner_id TO odoo_customer_id;

-- Update any indexes or constraints that reference the old column name
-- (The UNIQUE constraint will automatically be renamed)

-- Verify the change
COMMENT ON COLUMN schema_core.odoo_customers.odoo_customer_id IS 'Odoo Partner ID (renamed from odoo_partner_id for Phase 2 compatibility)';
