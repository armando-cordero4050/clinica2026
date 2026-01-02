-- 🧪 FIX LAB PRIVACY & ODOO INTEGRATION
-- Description: Ensures Lab never sees patient names and adds Odoo financial fields.

-- 1. ADD MISSING COLUMNS
ALTER TABLE schema_lab.orders 
ADD COLUMN IF NOT EXISTS patient_gender TEXT,
ADD COLUMN IF NOT EXISTS patient_age INTEGER,
ADD COLUMN IF NOT EXISTS total_price DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'GTQ',
ADD COLUMN IF NOT EXISTS odoo_sync_status TEXT DEFAULT 'pending' CHECK (odoo_sync_status IN ('pending', 'synced', 'error'));

-- 2. UPDATE RPC TO ENSURE PRIVACY
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
    patient_summary TEXT -- Non-identifiable summary: "F, 34y"
) LANGUAGE sql SECURITY DEFINER AS $$
    SELECT 
        o.id, 
        o.status, 
        o.priority, 
        o.due_date,
        (SELECT COUNT(*) FROM schema_lab.order_items WHERE order_id = o.id) as items_count,
        o.timers,
        (SELECT name FROM public.clinics WHERE id = o.clinic_id) as clinic_name,
        (
          SELECT s.name 
          FROM schema_lab.order_items oi 
          JOIN schema_lab.services s ON oi.service_id = s.id 
          WHERE oi.order_id = o.id 
          LIMIT 1
        ) as product_name,
        o.total_price,
        o.currency,
        o.odoo_sync_status,
        COALESCE(o.patient_gender, '?') || ', ' || COALESCE(o.patient_age::text, '?') || 'y' as patient_summary
    FROM schema_lab.orders o
    ORDER BY o.due_date ASC;
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
    patient_summary TEXT
) 
LANGUAGE sql 
SECURITY DEFINER 
SET search_path = schema_lab, public
AS $$
    SELECT * FROM schema_lab.get_kanban_board();
$$;

-- 3. UPDATE SEED DATA (Privacy compliant)
UPDATE schema_lab.orders SET 
  patient_gender = 'F', 
  patient_age = 34, 
  total_price = 150.00,
  currency = 'GTQ'
WHERE id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

UPDATE schema_lab.orders SET 
  patient_gender = 'M', 
  patient_age = 45, 
  total_price = 450.00,
  currency = 'USD'
WHERE id = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12';
