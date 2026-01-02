-- 🏗️ ADVANCED KAMBRA SYSTEM: SEQUENCES, SLA & PAUSES
-- Description: Adds core support for correlatives, SLA configs, and order pauses.

-- 1. Sequences Table (Correlativos)
CREATE TABLE IF NOT EXISTS schema_core.sequences (
    code TEXT PRIMARY KEY, -- 'lab_order', 'invoice', etc.
    prefix TEXT,
    next_value INTEGER DEFAULT 1,
    last_reset TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Initialize Lab Order Sequence
INSERT INTO schema_core.sequences (code, prefix, next_value)
VALUES ('lab_order', 'ORD-', 1001)
ON CONFLICT DO NOTHING;

-- Function to get and increment sequence
CREATE OR REPLACE FUNCTION schema_core.get_next_sequence(p_code TEXT)
RETURNS TEXT 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_prefix TEXT;
    v_next INTEGER;
BEGIN
    UPDATE schema_core.sequences 
    SET next_value = next_value + 1, updated_at = NOW()
    WHERE code = p_code
    RETURNING prefix, next_value - 1 INTO v_prefix, v_next;
    
    RETURN COALESCE(v_prefix, '') || v_next::text;
END;
$$;

-- 2. Enhanced Order Fields
ALTER TABLE schema_lab.orders ADD COLUMN IF NOT EXISTS order_number TEXT UNIQUE;
ALTER TABLE schema_lab.orders ADD COLUMN IF NOT EXISTS patient_id UUID; -- Link to schema_medical.patients
ALTER TABLE schema_lab.orders ADD COLUMN IF NOT EXISTS sla_hours INTEGER DEFAULT 48;
ALTER TABLE schema_lab.orders ADD COLUMN IF NOT EXISTS is_paused BOOLEAN DEFAULT FALSE;
ALTER TABLE schema_lab.orders ADD COLUMN IF NOT EXISTS paused_at TIMESTAMPTZ;

-- 3. Order Pauses Table (Audit Log)
CREATE TABLE IF NOT EXISTS schema_lab.order_pauses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES schema_lab.orders(id) ON DELETE CASCADE,
    requested_by UUID REFERENCES schema_core.users(id),
    request_reason TEXT NOT NULL,
    request_at TIMESTAMPTZ DEFAULT NOW(),
    approved_by UUID REFERENCES schema_core.users(id),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    processed_at TIMESTAMPTZ
);

-- 4. RPC: Request Pause
CREATE OR REPLACE FUNCTION public.request_order_pause(
    p_order_id UUID,
    p_reason TEXT
) 
RETURNS VOID 
LANGUAGE plpgsql 
SECURITY DEFINER AS $$
BEGIN
    INSERT INTO schema_lab.order_pauses (order_id, requested_by, request_reason)
    VALUES (p_order_id, auth.uid(), p_reason);
END;
$$;

-- 5. RPC: Process Pause (Admin/Coord Only)
CREATE OR REPLACE FUNCTION public.process_pause_request(
    p_pause_id UUID,
    p_status TEXT -- 'approved' or 'rejected'
) 
RETURNS VOID 
LANGUAGE plpgsql 
SECURITY DEFINER AS $$
DECLARE
    v_order_id UUID;
    v_role TEXT;
BEGIN
    -- Check role
    SELECT role INTO v_role FROM schema_core.users WHERE id = auth.uid();
    IF v_role NOT IN ('super_admin', 'lab_admin', 'lab_coordinator') THEN
        RAISE EXCEPTION 'No tienes permisos para procesar pausas.';
    END IF;

    UPDATE schema_lab.order_pauses 
    SET status = p_status, approved_by = auth.uid(), processed_at = NOW()
    WHERE id = p_pause_id
    RETURNING order_id INTO v_order_id;

    IF p_status = 'approved' THEN
        UPDATE schema_lab.orders 
        SET is_paused = TRUE, paused_at = NOW() 
        WHERE id = v_order_id;
    END IF;
END;
$$;
