-- Fix: Update get_pending_pickups to show orders in income_validation
-- Description: Logistics should see orders that are ready for validation, not clinic_pending

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
    WHERE o.status = 'income_validation'  -- Changed from 'clinic_pending'
    AND o.delivery_type = 'pickup'
    ORDER BY o.due_date ASC, o.created_at ASC;
END;
$$;

COMMENT ON FUNCTION public.get_pending_pickups IS 'Get orders in income_validation status that were picked up and are ready for validation';
