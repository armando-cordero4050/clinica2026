-- 🚑 FIX LAB SCHEMA AND RPC (HOTFIX)
-- Description: Adds missing columns to orders and updates Global Kambra RPC to match reality.

-- 1. ADD MISSING COLUMNS to schema_lab.orders
ALTER TABLE schema_lab.orders ADD COLUMN IF NOT EXISTS total_price DECIMAL(10,2) DEFAULT 0;
ALTER TABLE schema_lab.orders ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'GTQ';
ALTER TABLE schema_lab.orders ADD COLUMN IF NOT EXISTS patient_gender TEXT;
ALTER TABLE schema_lab.orders ADD COLUMN IF NOT EXISTS patient_age INTEGER;

-- 2. SYNC PRICE COLUMN (If 'price' exists from previous migrations, copy to total_price)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'schema_lab' AND table_name = 'orders' AND column_name = 'price') THEN
        UPDATE schema_lab.orders SET total_price = price WHERE total_price = 0 OR total_price IS NULL;
    END IF;
END $$;

-- 3. UPDATE RPC get_global_kambra
DROP FUNCTION IF EXISTS public.get_global_kambra();

CREATE OR REPLACE FUNCTION public.get_global_kambra()
RETURNS TABLE (
    id UUID,
    clinic_name TEXT,
    doctor_name TEXT,
    patient_summary TEXT,
    patient_id TEXT, -- Changed to TEXT to match table
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
        -- Patient Summary Logic
        CASE 
            WHEN o.patient_name IS NOT NULL THEN o.patient_name
            ELSE COALESCE(o.patient_gender, '?') || ', ' || COALESCE(o.patient_age::text, '?') || 'y'
        END as patient_summary,
        o.patient_id::text, -- Cast to text just in case
        o.order_number,
        o.status,
        o.priority,
        o.due_date,
        COALESCE(o.is_digital, false) as is_digital,
        o.courier_name,
        o.tracking_number,
        o.requirement_notes,
        COALESCE(o.total_price, 0) as total_price,
        COALESCE(o.currency, 'GTQ') as currency,
        (
          SELECT s.name 
          FROM schema_lab.order_items oi 
          JOIN schema_lab.services s ON oi.service_id = s.id 
          WHERE oi.order_id = o.id 
          LIMIT 1
        ) as product_name,
        COALESCE(o.is_paused, false) as is_paused,
        COALESCE(o.sla_hours, 0) as sla_hours
    FROM schema_lab.orders o
    ORDER BY o.due_date ASC, o.created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_global_kambra() TO authenticated;
