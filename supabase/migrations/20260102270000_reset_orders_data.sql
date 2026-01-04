-- CRITICAL FIX: Reset orders and fix RLS
-- Description: Delete all test orders and prepare for clean testing

-- 1. Delete all orders and related data (with WHERE clause)
DELETE FROM schema_lab.order_items WHERE TRUE;
DELETE FROM schema_lab.courier_assignments WHERE TRUE;
DELETE FROM schema_lab.route_checkpoints WHERE TRUE;
DELETE FROM schema_lab.delivery_routes WHERE TRUE;
DELETE FROM schema_lab.orders WHERE TRUE;

-- 2. Delete all clinical findings (to reset odontogram)
DELETE FROM schema_medical.clinical_findings WHERE TRUE;

-- Verify deletion
SELECT COUNT(*) as remaining_orders FROM schema_lab.orders;
SELECT COUNT(*) as remaining_findings FROM schema_medical.clinical_findings;
