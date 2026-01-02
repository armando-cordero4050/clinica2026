-- 📊 LAB DASHBOARD ANALYTICS & STATS
-- Description: RPCs for the Laboratory Admin Dashboard.

-- 1. Get Dashboard Summary Stats
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
        'on_hold', (SELECT COUNT(*) FROM schema_lab.orders WHERE status = 'on_hold'), -- Needs to be in CHECK if used
        'rejected', (SELECT COUNT(*) FROM schema_lab.orders WHERE status = 'rejected'), -- Needs to be in CHECK
        'delivered', (SELECT COUNT(*) FROM schema_lab.orders WHERE status = 'delivered')
    ) INTO v_stats;
    
    RETURN v_stats;
END;
$$;

-- 2. Get Production Chart Data (Last 7 days)
CREATE OR REPLACE FUNCTION public.get_lab_production_chart(p_days INTEGER DEFAULT 7)
RETURNS TABLE (
    day DATE,
    completed_count BIGINT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = schema_lab, public
AS $$
    SELECT 
        d.day::DATE,
        COUNT(o.id) FILTER (WHERE o.status = 'delivered') as completed_count
    FROM (
        SELECT CURRENT_DATE - (i || ' days')::interval as day
        FROM generate_series(0, p_days - 1) i
    ) d
    LEFT JOIN schema_lab.orders o ON o.updated_at::date = d.day
    GROUP BY d.day
    ORDER BY d.day ASC;
$$;

-- 3. Grants
GRANT EXECUTE ON FUNCTION public.get_lab_dashboard_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_lab_production_chart(INTEGER) TO authenticated;
