-- RPC TO UPDATE LAB ORDER STATUS (Bypass Schema Visibility)

CREATE OR REPLACE FUNCTION public.update_lab_order_status(p_order_id UUID, p_status TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = schema_lab, public
AS $$
BEGIN
    UPDATE schema_lab.orders
    SET status = p_status, updated_at = NOW()
    WHERE id = p_order_id;
    
    RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_lab_order_status(UUID, TEXT) TO authenticated;
