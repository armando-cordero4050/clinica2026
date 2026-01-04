-- Fix Lab Dashboard Stats RPC to use new 11-stage workflow
-- Replaces old status names with new ones

CREATE OR REPLACE FUNCTION public.get_lab_dashboard_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = schema_lab, public
AS $$
DECLARE
    v_stats JSONB;
    v_total_orders INT;
    v_on_time INT;
BEGIN
    -- Count orders by new 11-stage workflow statuses
    SELECT jsonb_build_object(
        'new', (SELECT COUNT(*) FROM schema_lab.orders WHERE status = 'clinic_pending'),
        'in_process', (SELECT COUNT(*) FROM schema_lab.orders WHERE status IN (
            'digital_picking', 
            'income_validation', 
            'gypsum', 
            'design', 
            'client_approval', 
            'nesting', 
            'production_man', 
            'qa'
        )),
        'pending', (SELECT COUNT(*) FROM schema_lab.orders WHERE status = 'qa'),
        'on_hold', (SELECT COUNT(*) FROM schema_lab.orders WHERE status = 'clinic_pending' AND is_paused = true),
        'rejected', (SELECT COUNT(*) FROM schema_lab.orders WHERE status = 'clinic_pending'), -- Placeholder, adjust if needed
        'delivered', (SELECT COUNT(*) FROM schema_lab.orders WHERE status = 'delivery'),
        'avg_sla_pct', COALESCE(
            (SELECT ROUND(AVG(
                CASE 
                    WHEN due_date IS NOT NULL AND due_date > NOW() THEN 100
                    WHEN due_date IS NOT NULL AND due_date <= NOW() THEN 0
                    ELSE 100
                END
            ))
            FROM schema_lab.orders 
            WHERE status != 'delivery'), 
            0
        )
    ) INTO v_stats;
    
    RETURN v_stats;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_lab_dashboard_stats() TO authenticated;

COMMENT ON FUNCTION public.get_lab_dashboard_stats IS 'Returns lab dashboard statistics using the new 11-stage workflow statuses';
