
CREATE OR REPLACE FUNCTION public.get_lab_dashboard_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = schema_lab, public
AS $$
DECLARE
    v_stats JSONB;
BEGIN
    SELECT jsonb_build_object(
        'new', (SELECT COUNT(*) FROM schema_lab.orders WHERE status = 'new'),
        'in_process', (SELECT COUNT(*) FROM schema_lab.orders WHERE status IN ('design', 'milling', 'ceramic')),
        'pending', (SELECT COUNT(*) FROM schema_lab.orders WHERE status = 'qc'),
        'on_hold', (SELECT COUNT(*) FROM schema_lab.orders WHERE status = 'on_hold'),
        'rejected', (SELECT COUNT(*) FROM schema_lab.orders WHERE status = 'rejected'),
        'delivered', (SELECT COUNT(*) FROM schema_lab.orders WHERE status = 'delivered'),
        'avg_sla_pct', 0
    ) INTO v_stats;
    
    RETURN v_stats;
END;
$$;
