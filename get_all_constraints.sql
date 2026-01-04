SELECT conname, pg_get_constraintdef(c.oid) 
FROM pg_constraint c 
JOIN pg_namespace n ON n.oid = c.connamespace 
WHERE n.nspname = 'schema_lab' AND conrelid = 'schema_lab.orders'::regclass AND contype = 'c'
