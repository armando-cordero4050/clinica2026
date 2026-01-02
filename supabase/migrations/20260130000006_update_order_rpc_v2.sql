-- 🛰️ UPDATE LAB ORDER STATUS (V2)
-- Description: Supports justification for backward movements.

CREATE OR REPLACE FUNCTION public.update_lab_order_status(
    p_order_id UUID,
    p_status TEXT,
    p_justification TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = schema_lab, public
AS $$
BEGIN
    UPDATE schema_lab.orders
    SET 
        status = p_status,
        return_justification = p_justification,
        updated_at = NOW()
    WHERE id = p_order_id;
    
    -- Potential logic for triggering notifications if status = 'client_approval'
    -- (Handled by the trigger schema_lab.notify_doctor_on_approval_needed)
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_lab_order_status(UUID, TEXT, TEXT) TO authenticated;
