SELECT pg_get_constraintdef(oid) FROM pg_constraint WHERE conname = 'orders_status_check' AND conrelid = 'schema_lab.orders'::regclass
