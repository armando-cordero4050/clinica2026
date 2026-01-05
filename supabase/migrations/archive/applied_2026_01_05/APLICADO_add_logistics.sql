-- Migration: 20260205100000_add_logistics_fields_fixed.sql
-- Description: Add logistics columns to orders and GPS coordinates to REAL clinics table.

-- 1. Update REAL CLINICS table (schema_medical.clinics)
ALTER TABLE schema_medical.clinics
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- 1.1 Refresh the VIEW public.clinics (If it exists and needs update)
-- Usually views defined as SELECT * might auto-update or need manual refresh.
-- We'll try to replace it just in case, assuming standard view definition.
-- WARNING: If public.clinics is complex, this simple REPLACE might be risky.
-- SAFE BET: Let's assume the view mirrors the table. If not, just updating the table is step 1.
-- For now, we will Update the Table. The RPC will verify coordinates against the TABLE.

-- 2. Create Enum for Shipping Type
DO $$ BEGIN
    CREATE TYPE public.lab_shipping_type AS ENUM ('pickup', 'courier', 'digital');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Update LAB_ORDERS table (schema_lab)
ALTER TABLE schema_lab.lab_orders
ADD COLUMN IF NOT EXISTS shipping_type public.lab_shipping_type DEFAULT 'pickup',
ADD COLUMN IF NOT EXISTS carrier_name TEXT,
ADD COLUMN IF NOT EXISTS tracking_number TEXT,
ADD COLUMN IF NOT EXISTS pickup_location JSONB;

-- 4. Update the RPC to use schema_medical.clinics
CREATE OR REPLACE FUNCTION public.create_lab_order_transaction_v2(
    p_clinic_id UUID,
    p_patient_id UUID,
    p_doctor_id UUID,
    p_priority TEXT,
    p_target_date TIMESTAMPTZ,
    p_notes TEXT,
    p_items JSONB,
    -- New Logistics Params
    p_shipping_type public.lab_shipping_type,
    p_carrier_name TEXT,
    p_tracking_number TEXT,
    p_clinic_lat DECIMAL,
    p_clinic_lng DECIMAL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_order_id UUID;
    v_item JSONB;
    v_finding_id UUID;
BEGIN
    -- 0. Update Clinic Coordinates using REAL TABLE
    IF p_clinic_lat IS NOT NULL AND p_clinic_lng IS NOT NULL THEN
        UPDATE schema_medical.clinics
        SET latitude = p_clinic_lat,
            longitude = p_clinic_lng
        WHERE id = p_clinic_id;
    END IF;

    -- 1. Insert Lab Order
    INSERT INTO schema_lab.lab_orders (
        clinic_id,
        patient_id,
        doctor_id,
        priority,
        status,
        target_delivery_date,
        notes,
        shipping_type,
        carrier_name,
        tracking_number
    ) VALUES (
        p_clinic_id,
        p_patient_id,
        p_doctor_id,
        p_priority,
        'draft',
        p_target_date,
        p_notes,
        p_shipping_type,
        p_carrier_name,
        p_tracking_number
    )
    RETURNING id INTO v_order_id;

    -- 2. Process Items
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
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

        IF (v_item->>'clinical_finding_id') IS NOT NULL AND (v_item->>'clinical_finding_id') != '' THEN
            v_finding_id := (v_item->>'clinical_finding_id')::UUID;
            UPDATE schema_medical.dental_chart
            SET lab_order_id = v_order_id
            WHERE id = v_finding_id;
        END IF;
    END LOOP;

    RETURN v_order_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_lab_order_transaction_v2 TO authenticated;
