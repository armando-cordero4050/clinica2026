-- Sprint 2: Create logistics RPCs
-- Description: RPCs for getting pending orders and managing routes

-- RPC: Get pending pickups with clinic info
CREATE OR REPLACE FUNCTION public.get_pending_pickups()
RETURNS TABLE (
    order_id UUID,
    order_number TEXT,
    clinic_id UUID,
    clinic_name TEXT,
    clinic_address TEXT,
    patient_name TEXT,
    service_name TEXT,
    due_date TIMESTAMPTZ,
    priority TEXT,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = schema_lab, schema_medical, public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id as order_id,
        COALESCE(o.order_number, o.id::text) as order_number,
        o.clinic_id,
        c.name as clinic_name,
        c.address as clinic_address,
        o.patient_name,
        (SELECT s.name FROM schema_lab.order_items oi 
         JOIN schema_lab.services s ON oi.service_id = s.id 
         WHERE oi.order_id = o.id LIMIT 1) as service_name,
        o.due_date,
        o.priority,
        o.created_at
    FROM schema_lab.orders o
    LEFT JOIN schema_medical.clinics c ON o.clinic_id = c.id
    WHERE o.status = 'clinic_pending'
    AND o.delivery_type = 'pickup'
    ORDER BY o.due_date ASC, o.created_at ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_pending_pickups() TO authenticated;

-- RPC: Assign order to courier
CREATE OR REPLACE FUNCTION public.assign_order_to_courier(
    p_order_id UUID,
    p_courier_id UUID,
    p_assignment_type TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = schema_lab, public
AS $$
DECLARE
    v_assignment_id UUID;
BEGIN
    -- Validate assignment type
    IF p_assignment_type NOT IN ('pickup', 'delivery') THEN
        RETURN jsonb_build_object('success', false, 'message', 'Invalid assignment type');
    END IF;
    
    -- Create assignment
    INSERT INTO schema_lab.courier_assignments (
        order_id,
        courier_id,
        assignment_type,
        status
    ) VALUES (
        p_order_id,
        p_courier_id,
        p_assignment_type,
        'pending'
    )
    RETURNING id INTO v_assignment_id;
    
    -- Update order
    IF p_assignment_type = 'pickup' THEN
        UPDATE schema_lab.orders 
        SET pickup_courier_id = p_courier_id,
            pickup_scheduled_at = NOW()
        WHERE id = p_order_id;
    ELSE
        UPDATE schema_lab.orders 
        SET delivery_courier_id = p_courier_id,
            delivery_scheduled_at = NOW()
        WHERE id = p_order_id;
    END IF;
    
    RETURN jsonb_build_object(
        'success', true, 
        'assignment_id', v_assignment_id
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.assign_order_to_courier TO authenticated;

-- RPC: Get courier's assigned orders
CREATE OR REPLACE FUNCTION public.get_courier_orders(p_courier_id UUID)
RETURNS TABLE (
    order_id UUID,
    order_number TEXT,
    clinic_name TEXT,
    patient_name TEXT,
    service_name TEXT,
    status TEXT,
    assignment_type TEXT,
    assigned_at TIMESTAMPTZ,
    due_date TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = schema_lab, schema_medical, public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id as order_id,
        COALESCE(o.order_number, o.id::text) as order_number,
        c.name as clinic_name,
        o.patient_name,
        (SELECT s.name FROM schema_lab.order_items oi 
         JOIN schema_lab.services s ON oi.service_id = s.id 
         WHERE oi.order_id = o.id LIMIT 1) as service_name,
        o.status,
        ca.assignment_type,
        ca.assigned_at,
        o.due_date
    FROM schema_lab.orders o
    JOIN schema_lab.courier_assignments ca ON o.id = ca.order_id
    LEFT JOIN schema_medical.clinics c ON o.clinic_id = c.id
    WHERE ca.courier_id = p_courier_id
    AND ca.status IN ('pending', 'in_progress')
    ORDER BY o.due_date ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_courier_orders TO authenticated;

COMMENT ON FUNCTION public.get_pending_pickups IS 'Get all orders pending pickup';
COMMENT ON FUNCTION public.assign_order_to_courier IS 'Assign an order to a courier';
COMMENT ON FUNCTION public.get_courier_orders IS 'Get orders assigned to a specific courier';
