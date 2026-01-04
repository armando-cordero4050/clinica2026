-- Fix get_lab_kanban to use correct schema for clinics table
-- The clinic name was showing as "Desconocida" because it was looking in public.clinics instead of schema_core.clinics

DROP FUNCTION IF EXISTS public.get_lab_kanban();
DROP FUNCTION IF EXISTS schema_lab.get_kanban_board();

CREATE OR REPLACE FUNCTION schema_lab.get_kanban_board()
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
    doctor_name TEXT,
    order_number TEXT,
    patient_id TEXT,
    is_digital BOOLEAN,
    courier_name TEXT,
    tracking_number TEXT,
    requirement_notes TEXT,
    sla_hours INTEGER,
    is_paused BOOLEAN,
    paused_at TIMESTAMPTZ
) LANGUAGE sql SECURITY DEFINER 
SET search_path = schema_lab, schema_core, public
AS $$
    SELECT 
        o.id, 
        o.status, 
        o.priority, 
        o.due_date,
        (SELECT COUNT(*) FROM schema_lab.order_items WHERE order_id = o.id) as items_count,
        o.timers,
        COALESCE((SELECT name FROM schema_medical.clinics WHERE id = o.clinic_id), 'Desconocida') as clinic_name,
        (
          SELECT s.name 
          FROM schema_lab.order_items oi 
          JOIN schema_lab.services s ON oi.service_id = s.id 
          WHERE oi.order_id = o.id 
          LIMIT 1
        ) as product_name,
        o.total_price,
        COALESCE(o.currency, 'GTQ') as currency,
        CASE 
            WHEN o.odoo_sale_order_id IS NOT NULL THEN 'synced'
            WHEN o.last_synced_from_odoo IS NOT NULL THEN 'synced'
            ELSE 'pending'
        END as odoo_status,
        COALESCE(o.patient_gender, '?') || ', ' || COALESCE(o.patient_age::text, '?') || 'y' as patient_summary,
        o.doctor_name,
        COALESCE(o.order_number, o.id::text) as order_number,
        o.patient_id,
        COALESCE(o.is_digital, false) as is_digital,
        o.courier_name,
        o.tracking_number,
        o.requirement_notes,
        o.sla_hours,
        COALESCE(o.is_paused, false) as is_paused,
        o.paused_at
    FROM schema_lab.orders o
    ORDER BY o.due_date ASC NULLS LAST, o.created_at DESC;
$$;

-- RE-EXPOSE PUBLIC RPC
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
    doctor_name TEXT,
    order_number TEXT,
    patient_id TEXT,
    is_digital BOOLEAN,
    courier_name TEXT,
    tracking_number TEXT,
    requirement_notes TEXT,
    sla_hours INTEGER,
    is_paused BOOLEAN,
    paused_at TIMESTAMPTZ
) 
LANGUAGE sql 
SECURITY DEFINER 
SET search_path = schema_lab, schema_core, public
AS $$
    SELECT * FROM schema_lab.get_kanban_board();
$$;

GRANT EXECUTE ON FUNCTION public.get_lab_kanban() TO authenticated;
GRANT EXECUTE ON FUNCTION schema_lab.get_kanban_board() TO authenticated;

COMMENT ON FUNCTION public.get_lab_kanban IS 'Returns all lab orders with clinic names from schema_core.clinics';
