-- Fix: Add missing odoo_sync_status column to orders table
-- Description: The column is referenced in get_lab_kanban but doesn't exist

ALTER TABLE schema_lab.orders 
ADD COLUMN IF NOT EXISTS odoo_sync_status TEXT DEFAULT 'pending';

COMMENT ON COLUMN schema_lab.orders.odoo_sync_status IS 'Odoo synchronization status: pending, synced, error';
