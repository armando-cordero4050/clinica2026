-- Fix: Get clinic_id from clinic_staff in get_lab_kanban
-- Description: Same fix for kanban RPC

DROP FUNCTION IF EXISTS public.get_lab_kanban();

CREATE OR REPLACE FUNCTION public.get_lab_kanban()
RETURNS TABLE (
    id UUID,
    status TEXT,
    priority TEXT,
    due_date DATE,
    items_count BIGINT,
    timers JSONB,
    clinic_name TEXT,
    product_name TEXT,
    total_price DECIMAL(10,2),
    currency TEXT,
    odoo_status TEXT,
    patient_summary TEXT,
    clinic_id UUID
) 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = schema_lab, schema_medical, schema_core, public
AS $$
DECLARE
    v_user_role TEXT;
    v_clinic_id UUID;
    v_user_id UUID;
BEGIN
    -- Get current user ID
    v_user_id := auth.uid();
    
    -- Get user role
    SELECT role INTO v_user_role
    FROM schema_core.users
    WHERE id = v_user_id;
    
    -- If clinic user, get clinic_id from clinic_staff
    IF v_user_role IN ('clinic_admin', 'clinic_doctor', 'clinic_staff', 'clinic_receptionist') THEN
        SELECT cs.clinic_id INTO v_clinic_id
        FROM schema_medical.clinic_staff cs
        WHERE cs.user_id = v_user_id
        LIMIT 1;
        
        RETURN QUERY
        SELECT 
            o.id, 
            o.status, 
            o.priority, 
            o.due_date::DATE,
            (SELECT COUNT(*) FROM schema_lab.order_items WHERE order_id = o.id) as items_count,
            o.timers,
            (SELECT name FROM schema_medical.clinics WHERE id = o.clinic_id) as clinic_name,
            (SELECT s.name FROM schema_lab.order_items oi 
             JOIN schema_lab.services s ON oi.service_id = s.id 
             WHERE oi.order_id = o.id LIMIT 1) as product_name,
            o.total_price,
            o.currency,
            o.odoo_sync_status,
            COALESCE(o.patient_gender, '?') || ', ' || COALESCE(o.patient_age::text, '?') || 'y' as patient_summary,
            o.clinic_id
        FROM schema_lab.orders o
        WHERE o.clinic_id = v_clinic_id  -- CRITICAL: Filter by clinic
        ORDER BY o.due_date ASC;
    ELSE
        -- Lab users and admins see all orders
        RETURN QUERY
        SELECT 
            o.id, 
            o.status, 
            o.priority, 
            o.due_date::DATE,
            (SELECT COUNT(*) FROM schema_lab.order_items WHERE order_id = o.id) as items_count,
            o.timers,
            (SELECT name FROM schema_medical.clinics WHERE id = o.clinic_id) as clinic_name,
            (SELECT s.name FROM schema_lab.order_items oi 
             JOIN schema_lab.services s ON oi.service_id = s.id 
             WHERE oi.order_id = o.id LIMIT 1) as product_name,
            o.total_price,
            o.currency,
            o.odoo_sync_status,
            COALESCE(o.patient_gender, '?') || ', ' || COALESCE(o.patient_age::text, '?') || 'y' as patient_summary,
            o.clinic_id
        FROM schema_lab.orders o
        ORDER BY o.due_date ASC;
    END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_lab_kanban() TO authenticated;

COMMENT ON FUNCTION public.get_lab_kanban IS 'Get kanban orders filtered by clinic_id from clinic_staff';
