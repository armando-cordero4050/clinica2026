-- version 10: explicit casts to avoid "operator does not exist: text = uuid"
DROP FUNCTION IF EXISTS public.get_lab_kanban();

CREATE OR REPLACE FUNCTION public.get_lab_kanban()
RETURNS TABLE (
    id UUID,
    order_number TEXT,
    patient_name TEXT,
    doctor_name TEXT,
    clinic_name TEXT,
    status TEXT,
    service_name TEXT,
    due_date TIMESTAMPTZ,
    priority TEXT,
    delivery_type TEXT,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, schema_lab, schema_medical, schema_core
AS $$
DECLARE
    v_user_id UUID;
    v_user_role TEXT;
    v_clinic_id UUID;
BEGIN
    v_user_id := auth.uid();
    
    -- Get user role
    SELECT u.role INTO v_user_role
    FROM public.users u
    WHERE u.id = v_user_id;
    
    IF v_user_role IS NULL THEN
        v_user_role := 'patient';
    END IF;

    IF v_user_role IN ('clinic_admin', 'clinic_doctor', 'clinic_staff', 'clinic_receptionist') THEN
        SELECT cs.clinic_id INTO v_clinic_id
        FROM public.clinic_staff cs
        WHERE cs.user_id = v_user_id
        LIMIT 1;
        
        RETURN QUERY
        SELECT 
            base_o.id::UUID,
            COALESCE(base_o.order_number, SUBSTRING(base_o.id::text, 1, 8))::TEXT,
            COALESCE(p.first_name || ' ' || p.last_name, base_o.patient_name)::TEXT,
            COALESCE(base_o.doctor_name, 'Doctor')::TEXT,
            c.name::TEXT,
            base_o.status::TEXT,
            (SELECT s.name::TEXT FROM public.services s 
             JOIN schema_lab.order_items oi ON oi.service_id = s.id 
             WHERE oi.order_id = base_o.id LIMIT 1),
            base_o.due_date,
            base_o.priority::TEXT,
            base_o.delivery_type::TEXT,
            base_o.created_at
        FROM public.orders AS base_o
        LEFT JOIN public.patients p ON base_o.patient_id = p.id
        LEFT JOIN public.clinics c ON base_o.clinic_id = c.id
        WHERE base_o.clinic_id = v_clinic_id
        ORDER BY base_o.created_at DESC;
    ELSE
        RETURN QUERY
        SELECT 
            base_o.id::UUID,
            COALESCE(base_o.order_number, SUBSTRING(base_o.id::text, 1, 8))::TEXT,
            COALESCE(p.first_name || ' ' || p.last_name, base_o.patient_name)::TEXT,
            COALESCE(base_o.doctor_name, 'Doctor')::TEXT,
            c.name::TEXT,
            base_o.status::TEXT,
            (SELECT s.name::TEXT FROM public.services s 
             JOIN schema_lab.order_items oi ON oi.service_id = s.id 
             WHERE oi.order_id = base_o.id LIMIT 1),
            base_o.due_date,
            base_o.priority::TEXT,
            base_o.delivery_type::TEXT,
            base_o.created_at
        FROM public.orders AS base_o
        LEFT JOIN public.patients p ON base_o.patient_id = p.id
        LEFT JOIN public.clinics c ON base_o.clinic_id = c.id
        ORDER BY base_o.created_at DESC;
    END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_lab_kanban() TO authenticated;
