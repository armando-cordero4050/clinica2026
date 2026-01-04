-- Fix: Get clinic_id from clinic_staff table instead of users
-- Description: Users don't have clinic_id directly, it's in clinic_staff

DROP FUNCTION IF EXISTS public.get_lab_dashboard_stats();

CREATE OR REPLACE FUNCTION public.get_lab_dashboard_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = schema_lab, schema_medical, schema_core, public
AS $$
DECLARE
    v_stats JSONB;
    v_user_role TEXT;
    v_clinic_id UUID;
    v_user_id UUID;
BEGIN
    -- Get current user ID
    v_user_id := auth.uid();
    
    -- If no user authenticated, return empty stats
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'clinic_pending', 0,
            'digital_picking', 0,
            'income_validation', 0,
            'gypsum', 0,
            'design', 0,
            'client_approval', 0,
            'nesting', 0,
            'production_man', 0,
            'qa', 0,
            'billing', 0,
            'delivery', 0,
            'avg_sla_pct', 0
        );
    END IF;
    
    -- Get user role
    SELECT role INTO v_user_role
    FROM schema_core.users
    WHERE id = v_user_id;
    
    -- If user not found, return empty stats
    IF v_user_role IS NULL THEN
        RETURN jsonb_build_object(
            'clinic_pending', 0,
            'digital_picking', 0,
            'income_validation', 0,
            'gypsum', 0,
            'design', 0,
            'client_approval', 0,
            'nesting', 0,
            'production_man', 0,
            'qa', 0,
            'billing', 0,
            'delivery', 0,
            'avg_sla_pct', 0
        );
    END IF;
    
    -- If clinic user, get clinic_id from clinic_staff
    IF v_user_role IN ('clinic_admin', 'clinic_doctor', 'clinic_staff', 'clinic_receptionist') THEN
        SELECT clinic_id INTO v_clinic_id
        FROM schema_medical.clinic_staff
        WHERE user_id = v_user_id
        LIMIT 1;
        
        -- If clinic_id not found, return empty stats
        IF v_clinic_id IS NULL THEN
            RETURN jsonb_build_object(
                'clinic_pending', 0,
                'digital_picking', 0,
                'income_validation', 0,
                'gypsum', 0,
                'design', 0,
                'client_approval', 0,
                'nesting', 0,
                'production_man', 0,
                'qa', 0,
                'billing', 0,
                'delivery', 0,
                'avg_sla_pct', 0
            );
        END IF;
        
        -- Return stats filtered by clinic
        SELECT jsonb_build_object(
            'clinic_pending', (SELECT COUNT(*) FROM schema_lab.orders WHERE status = 'clinic_pending' AND clinic_id = v_clinic_id),
            'digital_picking', (SELECT COUNT(*) FROM schema_lab.orders WHERE status = 'digital_picking' AND clinic_id = v_clinic_id),
            'income_validation', (SELECT COUNT(*) FROM schema_lab.orders WHERE status = 'income_validation' AND clinic_id = v_clinic_id),
            'gypsum', (SELECT COUNT(*) FROM schema_lab.orders WHERE status = 'gypsum' AND clinic_id = v_clinic_id),
            'design', (SELECT COUNT(*) FROM schema_lab.orders WHERE status = 'design' AND clinic_id = v_clinic_id),
            'client_approval', (SELECT COUNT(*) FROM schema_lab.orders WHERE status = 'client_approval' AND clinic_id = v_clinic_id),
            'nesting', (SELECT COUNT(*) FROM schema_lab.orders WHERE status = 'nesting' AND clinic_id = v_clinic_id),
            'production_man', (SELECT COUNT(*) FROM schema_lab.orders WHERE status = 'production_man' AND clinic_id = v_clinic_id),
            'qa', (SELECT COUNT(*) FROM schema_lab.orders WHERE status = 'qa' AND clinic_id = v_clinic_id),
            'billing', (SELECT COUNT(*) FROM schema_lab.orders WHERE status = 'billing' AND clinic_id = v_clinic_id),
            'delivery', (SELECT COUNT(*) FROM schema_lab.orders WHERE status = 'delivery' AND clinic_id = v_clinic_id),
            'avg_sla_pct', 0
        ) INTO v_stats;
    ELSE
        -- Lab users and admins see all orders
        SELECT jsonb_build_object(
            'clinic_pending', (SELECT COUNT(*) FROM schema_lab.orders WHERE status = 'clinic_pending'),
            'digital_picking', (SELECT COUNT(*) FROM schema_lab.orders WHERE status = 'digital_picking'),
            'income_validation', (SELECT COUNT(*) FROM schema_lab.orders WHERE status = 'income_validation'),
            'gypsum', (SELECT COUNT(*) FROM schema_lab.orders WHERE status = 'gypsum'),
            'design', (SELECT COUNT(*) FROM schema_lab.orders WHERE status = 'design'),
            'client_approval', (SELECT COUNT(*) FROM schema_lab.orders WHERE status = 'client_approval'),
            'nesting', (SELECT COUNT(*) FROM schema_lab.orders WHERE status = 'nesting'),
            'production_man', (SELECT COUNT(*) FROM schema_lab.orders WHERE status = 'production_man'),
            'qa', (SELECT COUNT(*) FROM schema_lab.orders WHERE status = 'qa'),
            'billing', (SELECT COUNT(*) FROM schema_lab.orders WHERE status = 'billing'),
            'delivery', (SELECT COUNT(*) FROM schema_lab.orders WHERE status = 'delivery'),
            'avg_sla_pct', 0
        ) INTO v_stats;
    END IF;
    
    RETURN v_stats;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_lab_dashboard_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_lab_dashboard_stats() TO anon;

COMMENT ON FUNCTION public.get_lab_dashboard_stats IS 'Get dashboard stats filtered by clinic_id from clinic_staff table';
