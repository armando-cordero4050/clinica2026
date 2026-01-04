-- Fix: get_lab_kanban uses public.profiles instead of schema_core.users

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
SET search_path = schema_lab, schema_medical, schema_core, public
AS $$
DECLARE
    v_user_role TEXT;
    v_clinic_id UUID;
    v_user_id UUID;
BEGIN
    v_user_id := auth.uid();
    
    -- Get user role (FIXED: referencing public.profiles)
    SELECT role INTO v_user_role
    FROM public.profiles
    WHERE id = v_user_id;
    
    -- If role is null, try to infer or fallback
    IF v_user_role IS NULL THEN
        -- Fallback check in clinic_staff if applicable, or assume patient
        v_user_role := 'patient';
    END IF;

    IF v_user_role IN ('clinic_admin', 'clinic_doctor', 'clinic_staff', 'clinic_receptionist') THEN
        SELECT clinic_id INTO v_clinic_id
        FROM schema_medical.clinic_staff
        WHERE user_id = v_user_id
        LIMIT 1;
        
        RETURN QUERY
        SELECT 
            o.id,
            COALESCE(o.order_number, SUBSTRING(o.id::text, 1, 8)) as order_number,
            COALESCE(p.first_name || ' ' || p.last_name, o.patient_name) as patient_name,
            COALESCE(o.doctor_name, 'Doctor') as doctor_name,
            c.name as clinic_name,
            o.status,
            (SELECT s.name FROM schema_lab.order_items oi 
             JOIN schema_lab.services s ON oi.service_id = s.id 
             WHERE oi.order_id = o.id LIMIT 1) as service_name,
            o.due_date,
            o.priority,
            o.delivery_type,
            o.created_at
        FROM schema_lab.orders o
        LEFT JOIN schema_medical.patients p ON o.patient_id = p.id
        LEFT JOIN schema_medical.clinics c ON o.clinic_id = c.id
        WHERE o.clinic_id = v_clinic_id
        ORDER BY o.due_date ASC;
    ELSE
        -- Lab/Admin sees all
        RETURN QUERY
        SELECT 
            o.id,
            COALESCE(o.order_number, SUBSTRING(o.id::text, 1, 8)) as order_number,
            COALESCE(p.first_name || ' ' || p.last_name, o.patient_name) as patient_name,
            COALESCE(o.doctor_name, 'Doctor') as doctor_name,
            c.name as clinic_name,
            o.status,
            (SELECT s.name FROM schema_lab.order_items oi 
             JOIN schema_lab.services s ON oi.service_id = s.id 
             WHERE oi.order_id = o.id LIMIT 1) as service_name,
            o.due_date,
            o.priority,
            o.delivery_type,
            o.created_at
        FROM schema_lab.orders o
        LEFT JOIN schema_medical.patients p ON o.patient_id = p.id
        LEFT JOIN schema_medical.clinics c ON o.clinic_id = c.id
        ORDER BY o.due_date ASC;
    END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_lab_kanban() TO authenticated;
