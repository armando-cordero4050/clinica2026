-- ⏱️ LAB TIMERS (KPIs)
-- Description: Adds timer logic to orders for efficiency tracking.

-- 1. ADD COLUMN
ALTER TABLE schema_lab.orders 
ADD COLUMN IF NOT EXISTS timers JSONB DEFAULT '{"total_seconds": 0, "is_running": false, "last_start": null}'::JSONB;

-- 2. TOGGLE TIMER FUNCTION
CREATE OR REPLACE FUNCTION schema_lab.toggle_order_timer(p_order_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = schema_lab, public
AS $$
DECLARE
    v_timers JSONB;
    v_now TIMESTAMPTZ := NOW();
    v_elapsed INTEGER;
BEGIN
    SELECT timers INTO v_timers FROM schema_lab.orders WHERE id = p_order_id;
    
    IF v_timers->>'is_running' = 'true' THEN
        -- PAUSE: Calculate elapsed and stop
        v_elapsed := EXTRACT(EPOCH FROM (v_now - (v_timers->>'last_start')::TIMESTAMPTZ));
        
        v_timers := jsonb_build_object(
            'total_seconds', (v_timers->>'total_seconds')::INTEGER + v_elapsed,
            'is_running', false,
            'last_start', null
        );
    ELSE
        -- START: Set start time
        v_timers := jsonb_build_object(
            'total_seconds', (v_timers->>'total_seconds')::INTEGER,
            'is_running', true,
            'last_start', v_now
        );
    END IF;

    UPDATE schema_lab.orders SET timers = v_timers WHERE id = p_order_id;
    
    RETURN v_timers;
END;
$$;

-- 3. UPDATE RPC (Need to drop first to change signature)
DROP FUNCTION IF EXISTS public.get_lab_kanban();
DROP FUNCTION IF EXISTS schema_lab.get_kanban_board();

CREATE OR REPLACE FUNCTION schema_lab.get_kanban_board()
RETURNS TABLE (
    id UUID,
    patient_name TEXT,
    status TEXT,
    priority TEXT,
    due_date DATE,
    items_count BIGINT,
    timers JSONB
) LANGUAGE sql SECURITY DEFINER AS $$
    SELECT 
        o.id, 
        o.patient_name, 
        o.status, 
        o.priority, 
        o.due_date,
        (SELECT COUNT(*) FROM schema_lab.order_items WHERE order_id = o.id) as items_count,
        o.timers
    FROM schema_lab.orders o
    ORDER BY o.due_date ASC;
$$;

-- 4. RE-EXPOSE PUBLIC RPC
CREATE OR REPLACE FUNCTION public.get_lab_kanban()
RETURNS TABLE (
    id UUID,
    patient_name TEXT,
    status TEXT,
    priority TEXT,
    due_date DATE,
    items_count BIGINT,
    timers JSONB
) 
LANGUAGE sql 
SECURITY DEFINER 
SET search_path = schema_lab, public
AS $$
    SELECT * FROM schema_lab.get_kanban_board();
$$;

-- 5. EXPOSE TOGGLE RPC
CREATE OR REPLACE FUNCTION public.toggle_lab_timer(p_order_id UUID)
RETURNS JSONB
LANGUAGE sql
SECURITY DEFINER
SET search_path = schema_lab, public
AS $$
    SELECT schema_lab.toggle_order_timer(p_order_id);
$$;

GRANT EXECUTE ON FUNCTION public.get_lab_kanban() TO authenticated;
GRANT EXECUTE ON FUNCTION public.toggle_lab_timer(UUID) TO authenticated;
