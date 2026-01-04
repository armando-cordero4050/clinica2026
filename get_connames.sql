SELECT conname FROM pg_constraint WHERE conrelid = 'schema_lab.orders'::regclass AND contype = 'c'
