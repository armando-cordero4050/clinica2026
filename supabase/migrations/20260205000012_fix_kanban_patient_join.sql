-- version 12: fix for "text = uuid" in patient join + ambiguity fix
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
#variable_conflict use_column
DECLARE
    v_user_id UUID;
    v_user_role TEXT;
    v_clinic_id UUID;
BEGIN
    v_user_id := auth.uid();
    
    -- Get user role
    SELECT role INTO v_user_role
    FROM public.users
    WHERE public.users.id = v_user_id;
    
    IF v_user_role IS NULL THEN
        v_user_role := 'patient';
    END IF;

    IF v_user_role IN ('clinic_admin', 'clinic_doctor', 'clinic_staff', 'clinic_receptionist') THEN
        SELECT clinic_id INTO v_clinic_id
        FROM public.clinic_staff
        WHERE user_id = v_user_id
        LIMIT 1;
        
        RETURN QUERY
        SELECT 
            o.id,
            COALESCE(o.order_number, SUBSTRING(o.id::text, 1, 8)),
            COALESCE(p.first_name || ' ' || p.last_name, o.patient_name),
            COALESCE(o.doctor_name, 'Doctor'),
            c.name,
            o.status,
            (SELECT s.name FROM public.services s 
             JOIN schema_lab.order_items oi ON oi.service_id = s.id 
             WHERE oi.order_id = o.id LIMIT 1),
            o.due_date,
            o.priority,
            o.delivery_type,
            o.created_at
        FROM public.orders o
        LEFT JOIN public.patients p ON (CASE WHEN o.patient_id ~ '^[0-9a-fA-F-]{36}$' THEN o.patient_id::UUID ELSE NULL END) = p.id
        LEFT JOIN public.clinics c ON o.clinic_id = c.id
        WHERE o.clinic_id = v_clinic_id
        ORDER BY o.created_at DESC;
    ELSE
        RETURN QUERY
        SELECT 
            o.id,
            COALESCE(o.order_number, SUBSTRING(o.id::text, 1, 8)),
            COALESCE(p.first_name || ' ' || p.last_name, o.patient_name),
            COALESCE(o.doctor_name, 'Doctor'),
            c.name,
            o.status,
            (SELECT s.name FROM public.services s 
             JOIN schema_lab.order_items oi ON oi.service_id = s.id 
             WHERE oi.order_id = o.id LIMIT 1),
            o.due_date,
            o.priority,
            o.delivery_type,
            o.created_at
        FROM public.orders o
        LEFT JOIN public.patients p ON (CASE WHEN o.patient_id ~ '^[0-9a-fA-F-]{36}$' THEN o.patient_id::UUID ELSE NULL END) = p.id
        LEFT JOIN public.clinics c ON o.clinic_id = c.id
        ORDER BY o.created_at DESC;
    END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_lab_kanban() TO authenticated;
