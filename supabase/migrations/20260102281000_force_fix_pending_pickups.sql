-- Force fix: Completely drop and recreate get_pending_pickups with correct types
-- Description: Ensure the function is properly updated

-- Drop the function completely
DROP FUNCTION IF EXISTS public.get_pending_pickups() CASCADE;

-- Recreate with correct TIMESTAMPTZ type
CREATE FUNCTION public.get_pending_pickups()
RETURNS TABLE (
    order_id UUID,
    order_number TEXT,
    clinic_id UUID,
    clinic_name TEXT,
    clinic_address TEXT,
    patient_name TEXT,
    service_name TEXT,
    due_date TIMESTAMPTZ,  -- MUST be TIMESTAMPTZ
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
        o.id,
        COALESCE(o.order_number, o.id::text),
        o.clinic_id,
        c.name,
        c.address,
        o.patient_name,
        (SELECT s.name FROM schema_lab.order_items oi 
         JOIN schema_lab.services s ON oi.service_id = s.id 
         WHERE oi.order_id = o.id LIMIT 1),
        o.due_date::TIMESTAMPTZ,  -- Explicit cast to TIMESTAMPTZ
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

COMMENT ON FUNCTION public.get_pending_pickups IS 'Get orders ready for pickup - FIXED with TIMESTAMPTZ';
