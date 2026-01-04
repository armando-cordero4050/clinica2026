-- Create RPC for creating lab orders with SECURITY DEFINER
-- This allows clinic_admin users to create orders in schema_lab without direct access

CREATE OR REPLACE FUNCTION public.create_lab_order_rpc(
    p_clinic_id UUID,
    p_patient_id UUID,
    p_patient_name TEXT,
    p_service_ids UUID[],
    p_is_digital BOOLEAN DEFAULT FALSE,
    p_notes TEXT DEFAULT NULL,
    p_due_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, schema_lab
AS $$
DECLARE
    v_order_id UUID;
    v_total_price NUMERIC := 0;
    v_service_id UUID;
    v_status TEXT;
BEGIN
    -- Calculate total price from services
    SELECT COALESCE(SUM(base_price), 0)
    INTO v_total_price
    FROM schema_lab.services
    WHERE id = ANY(p_service_ids);

    -- Determine initial status
    v_status := CASE 
        WHEN p_is_digital THEN 'digital_picking'
        ELSE 'clinic_pending'
    END;

    -- Insert order
    INSERT INTO schema_lab.orders (
        clinic_id,
        patient_id,
        patient_name,
        doctor_name,
        status,
        priority,
        is_digital,
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
        p_is_digital,
        p_due_date,
        v_total_price,
        v_total_price,
        NOW()
    )
    RETURNING id INTO v_order_id;

    -- Insert order items
    FOREACH v_service_id IN ARRAY p_service_ids
    LOOP
        INSERT INTO schema_lab.order_items (
            order_id,
            service_id,
            tooth_number,
            notes
        ) VALUES (
            v_order_id,
            v_service_id,
            NULL, -- Will be enhanced later with tooth info
            p_notes
        );
    END LOOP;

    RETURN v_order_id;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.create_lab_order_rpc TO authenticated;

COMMENT ON FUNCTION public.create_lab_order_rpc IS 'Creates a lab order with items. Uses SECURITY DEFINER to bypass RLS restrictions for clinic_admin users.';
