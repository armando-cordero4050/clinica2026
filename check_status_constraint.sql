-- Check status constraint on schema_lab.orders
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'schema_lab.orders'::regclass
AND conname LIKE '%status%'
