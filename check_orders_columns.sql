-- Check columns in schema_lab.orders
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'schema_lab' AND table_name = 'orders';
