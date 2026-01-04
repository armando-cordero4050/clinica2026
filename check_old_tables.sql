SELECT table_name FROM information_schema.tables WHERE table_name IN ('lab_orders', 'lab_services') AND table_schema = 'public'
