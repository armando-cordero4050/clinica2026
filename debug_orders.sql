-- DEBUG ORDERS
SELECT id, clinic_id, patient_name, status, created_at, odoo_sale_order_id 
FROM schema_lab.orders 
ORDER BY created_at DESC 
LIMIT 10;

-- Check public view
SELECT * FROM public.orders LIMIT 5;

-- Check sync log
SELECT * FROM schema_core.odoo_sync_log ORDER BY completed_at DESC LIMIT 5;
