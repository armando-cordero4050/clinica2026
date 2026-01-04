-- Fix: Correct data type mismatch in get_pending_pickups
-- Description: Change due_date from DATE to TIMESTAMPTZ

DROP FUNCTION IF EXISTS public.get_pending_pickups();

CREATE OR REPLACE FUNCTION public.get_pending_pickups()
RETURNS TABLE (
    order_id UUID,
    order_number TEXT,
    clinic_id UUID,
    clinic_name TEXT,
    clinic_address TEXT,
    patient_name TEXT,
    service_name TEXT,
    due_date TIMESTAMPTZ,  -- Changed from DATE to TIMESTAMPTZ
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
        o.due_date,  -- Already TIMESTAMPTZ in table
        o.priority,
        o.created_at
    FROM schema_lab.orders o
    LEFT JOIN schema_medical.clinics c ON o.clinic_id = c.id
    WHERE o.status = 'income_validation'
    AND o.delivery_type = 'pickup'
    ORDER BY o.due_date ASC, o.created_at ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_pending_pickups() TO authenticated;

COMMENT ON FUNCTION public.get_pending_pickups IS 'Get orders in income_validation status ready for pickup';
