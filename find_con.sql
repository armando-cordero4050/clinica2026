SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'schema_lab.orders'::regclass 
AND contype = 'c' 
AND pg_get_constraintdef(oid) LIKE '%status%'
