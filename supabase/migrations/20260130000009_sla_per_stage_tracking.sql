-- 🕐 SLA PER STAGE TRACKING SYSTEM
-- Description: Track time spent per user per stage with configurable limits

-- 1. SLA Configuration Table (Time limits per stage)
CREATE TABLE IF NOT EXISTS schema_lab.sla_config (
    stage TEXT PRIMARY KEY,
    target_hours INTEGER NOT NULL DEFAULT 4,
    warning_hours INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Initialize default SLA for all 11 stages
INSERT INTO schema_lab.sla_config (stage, target_hours, warning_hours) VALUES
    ('clinic_pending', 2, 1),
    ('digital_picking', 1, 0),
    ('income_validation', 2, 1),
    ('gypsum', 4, 1),
    ('design', 8, 2),
    ('client_approval', 24, 4),
    ('nesting', 2, 1),
    ('production_man', 12, 3),
    ('qa', 4, 1),
    ('billing', 2, 1),
    ('delivery', 4, 1)
ON CONFLICT (stage) DO NOTHING;

-- 2. Time Tracking Table (Audit log of time per user per stage)
CREATE TABLE IF NOT EXISTS schema_lab.order_stage_times (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES schema_lab.orders(id) ON DELETE CASCADE,
    stage TEXT NOT NULL,
    user_id UUID REFERENCES schema_core.users(id),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    elapsed_seconds INTEGER,
    was_paused BOOLEAN DEFAULT FALSE,
    pause_duration_seconds INTEGER DEFAULT 0
);

-- Trigger to calculate elapsed_seconds when completed
CREATE OR REPLACE FUNCTION schema_lab.calculate_elapsed_time()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.completed_at IS NOT NULL THEN
        NEW.elapsed_seconds := EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at))::INTEGER;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_calc_elapsed ON schema_lab.order_stage_times;
CREATE TRIGGER trigger_calc_elapsed
    BEFORE INSERT OR UPDATE ON schema_lab.order_stage_times
    FOR EACH ROW
    EXECUTE FUNCTION schema_lab.calculate_elapsed_time();


-- Index for performance
CREATE INDEX IF NOT EXISTS idx_stage_times_order ON schema_lab.order_stage_times(order_id);
CREATE INDEX IF NOT EXISTS idx_stage_times_user ON schema_lab.order_stage_times(user_id);

-- 3. Trigger to auto-start tracking when order moves to new stage
CREATE OR REPLACE FUNCTION schema_lab.track_stage_entry()
RETURNS TRIGGER AS $$
BEGIN
    -- Close previous stage if exists
    UPDATE schema_lab.order_stage_times
    SET completed_at = NOW()
    WHERE order_id = NEW.id 
      AND completed_at IS NULL;

    -- Start new stage tracking
    INSERT INTO schema_lab.order_stage_times (order_id, stage, user_id)
    VALUES (NEW.id, NEW.status, auth.uid());

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_track_stage ON schema_lab.orders;
CREATE TRIGGER trigger_track_stage
    AFTER UPDATE OF status ON schema_lab.orders
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION schema_lab.track_stage_entry();

-- 4. RPC to get user performance stats
CREATE OR REPLACE FUNCTION public.get_user_stage_performance(p_user_id UUID DEFAULT NULL)
RETURNS TABLE (
    user_id UUID,
    user_email TEXT,
    stage TEXT,
    total_orders INTEGER,
    avg_time_hours NUMERIC,
    target_hours INTEGER,
    performance_pct NUMERIC
) 
LANGUAGE sql 
SECURITY DEFINER AS $$
    SELECT 
        ost.user_id,
        u.email as user_email,
        ost.stage,
        COUNT(*)::INTEGER as total_orders,
        ROUND(AVG(ost.elapsed_seconds) / 3600.0, 2) as avg_time_hours,
        sc.target_hours,
        ROUND((sc.target_hours::NUMERIC / NULLIF(AVG(ost.elapsed_seconds) / 3600.0, 0)) * 100, 1) as performance_pct
    FROM schema_lab.order_stage_times ost
    JOIN schema_core.users u ON ost.user_id = u.id
    LEFT JOIN schema_lab.sla_config sc ON ost.stage = sc.stage
    WHERE ost.completed_at IS NOT NULL
      AND (p_user_id IS NULL OR ost.user_id = p_user_id)
    GROUP BY ost.user_id, u.email, ost.stage, sc.target_hours
    ORDER BY ost.user_id, ost.stage;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_stage_performance TO authenticated;

