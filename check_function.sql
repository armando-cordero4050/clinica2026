-- Verify get_lab_dashboard_stats function exists
SELECT 
    proname as function_name,
    pg_get_functiondef(oid) as definition
FROM pg_proc
WHERE proname = 'get_lab_dashboard_stats';
