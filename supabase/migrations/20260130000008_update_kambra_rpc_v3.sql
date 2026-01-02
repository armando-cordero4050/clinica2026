-- 🛰️ UPDATE GLOBAL KAMBRA RPC (V3)
-- Description: Includes correlatives, SLA, and pause status.

-- Drop existing function to allow signature change
DROP FUNCTION IF EXISTS public.get_global_kambra();

CREATE OR REPLACE FUNCTION public.get_global_kambra()
RETURNS TABLE (
    id UUID,
    clinic_name TEXT,
    doctor_name TEXT,
    patient_summary TEXT, -- "F, 34y"
    patient_id UUID,
    order_number TEXT,
    status TEXT,
    priority TEXT,
    due_date DATE,
    is_digital BOOLEAN,
    courier_name TEXT,
    tracking_number TEXT,
    requirement_notes TEXT,
    total_price DECIMAL,
    currency TEXT,
    product_name TEXT,
    is_paused BOOLEAN,
    sla_hours INTEGER
) 
LANGUAGE sql 
SECURITY DEFINER
SET search_path = schema_lab, schema_core, public
AS $$
    SELECT 
        o.id,
        COALESCE((SELECT name FROM schema_core.clinics WHERE id = o.clinic_id), 'Clínica Externa') as clinic_name,
        o.doctor_name,
        COALESCE(o.patient_gender, '?') || ', ' || COALESCE(o.patient_age::text, '?') || 'y' as patient_summary,
        o.patient_id,
        o.order_number,
        o.status,
        o.priority,
        o.due_date,
        o.is_digital,
        o.courier_name,
        o.tracking_number,
        o.requirement_notes,
        o.total_price,
        o.currency,
        (
          SELECT s.name 
          FROM schema_lab.order_items oi 
          JOIN schema_lab.services s ON oi.service_id = s.id 
          WHERE oi.order_id = o.id 
          LIMIT 1
        ) as product_name,
        o.is_paused,
        o.sla_hours
    FROM schema_lab.orders o
    ORDER BY o.due_date ASC, o.created_at DESC;
$$;
