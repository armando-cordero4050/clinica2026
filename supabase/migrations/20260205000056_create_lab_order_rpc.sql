-- Migration: 20260205000056_create_lab_order_rpc.sql
-- Description: Transactional RPC to create lab order and link clinical findings.

CREATE OR REPLACE FUNCTION public.create_lab_order_transaction(
    p_clinic_id UUID,
    p_patient_id UUID,
    p_doctor_id UUID,
    p_priority TEXT,
    p_target_date TIMESTAMPTZ,
    p_notes TEXT,
    p_items JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with creator permissions (bypass RLS for cross-schema updates if needed, checking policies manually if preferred)
AS $$
DECLARE
    v_order_id UUID;
    v_item JSONB;
    v_finding_id UUID;
BEGIN
    -- 1. Insert Lab Order
    INSERT INTO schema_lab.lab_orders (
        clinic_id,
        patient_id,
        doctor_id,
        priority,
        status,
        target_delivery_date,
        notes
    ) VALUES (
        p_clinic_id,
        p_patient_id,
        p_doctor_id,
        p_priority,
        'draft',
        p_target_date,
        p_notes
    )
    RETURNING id INTO v_order_id;

    -- 2. Process Items
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        -- Insert Item
        INSERT INTO schema_lab.lab_order_items (
            order_id,
            configuration_id,
            tooth_number,
            color,
            unit_price
        ) VALUES (
            v_order_id,
            (v_item->>'configuration_id')::UUID,
            (v_item->>'tooth_number')::INTEGER,
            v_item->>'color',
            (v_item->>'unit_price')::DECIMAL
        );

        -- Link Clinical Finding if present
        -- Note: v_item->>'clinical_finding_id' might be null or string
        IF (v_item->>'clinical_finding_id') IS NOT NULL AND (v_item->>'clinical_finding_id') != '' THEN
            v_finding_id := (v_item->>'clinical_finding_id')::UUID;
            
            -- Update Dental Chart
            UPDATE schema_medical.dental_chart
            SET lab_order_id = v_order_id
            WHERE id = v_finding_id;
        END IF;
    END LOOP;

    RETURN v_order_id;
END;
$$;

-- Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION public.create_lab_order_transaction TO authenticated;
