-- Inspect create_lab_order_rpc and get_lab_kanban
SELECT pg_get_functiondef('public.create_lab_order_rpc'::regproc);
SELECT pg_get_functiondef('public.get_lab_kanban'::regproc);
