-- Sprint 1: Update create_lab_order_rpc to support delivery types and SLA calculation
-- Description: Adds delivery_type, digital_files, shipping_info parameters and auto-calculates due_date from SLA

DROP FUNCTION IF EXISTS public.create_lab_order_rpc(UUID, UUID, TEXT, UUID[], BOOLEAN, TEXT, TIMESTAMPTZ);

CREATE OR REPLACE FUNCTION public.create_lab_order_rpc(
    p_clinic_id UUID,
    p_patient_id UUID,
    p_patient_name TEXT,
    p_service_ids UUID[],
    p_delivery_type TEXT DEFAULT 'pickup',
    p_digital_files JSONB DEFAULT '[]'::jsonb,
    p_shipping_info JSONB DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, schema_lab, schema_medical
AS $$
DECLARE
    v_order_id UUID;
    v_total_price NUMERIC := 0;
    v_sla_hours INTEGER;
    v_due_date TIMESTAMPTZ;
    v_status TEXT;
    v_service_id UUID;
BEGIN
    -- 1. Calculate total price from services
    SELECT COALESCE(SUM(base_price), 0)
    INTO v_total_price
    FROM schema_lab.services
    WHERE id = ANY(p_service_ids);

    -- 2. Get SLA from first service (INDISCUTIBLE)
    SELECT id, sla_hours 
    INTO v_service_id, v_sla_hours
    FROM schema_lab.services
    WHERE id = p_service_ids[1];

    -- Default SLA if not found
    IF v_sla_hours IS NULL THEN
        v_sla_hours := 48; -- Default 48 hours
    END IF;

    -- 3. Calculate due_date automatically (INDISCUTIBLE)
    v_due_date := NOW() + (v_sla_hours || ' hours')::INTERVAL;

    -- 4. Determine initial status based on delivery type
    v_status := CASE 
        WHEN p_delivery_type = 'digital' THEN 'design'
        WHEN p_delivery_type = 'pickup' THEN 'clinic_pending'
        WHEN p_delivery_type = 'shipping' THEN 'digital_picking'
        ELSE 'clinic_pending'
    END;

    -- 5. Insert order
    INSERT INTO schema_lab.orders (
        clinic_id,
        patient_id,
        patient_name,
        doctor_name,
        status,
        priority,
        delivery_type,
        digital_files,
        shipping_info,
        due_date,
        total_price,
        price,
        created_at
    ) VALUES (
        p_clinic_id,
        p_patient_id,
        p_patient_name,
        'Doctor', -- Will be enhanced later with actual doctor info
        v_status,
        'normal',
        p_delivery_type,
        p_digital_files,
        p_shipping_info,
        v_due_date,
        v_total_price,
        v_total_price,
        NOW()
    )
    RETURNING id INTO v_order_id;

    -- 6. Insert order items
    INSERT INTO schema_lab.order_items (order_id, service_id, quantity, unit_price)
    SELECT 
        v_order_id, 
        s.id, 
        1, 
        s.base_price
    FROM schema_lab.services s
    WHERE s.id = ANY(p_service_ids);

    RETURN v_order_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_lab_order_rpc TO authenticated;

COMMENT ON FUNCTION public.create_lab_order_rpc IS 'Creates a lab order with automatic SLA calculation and delivery type support';
