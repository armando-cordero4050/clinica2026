-- 🚚 LOGÍSTICA KAMBRA: SCHEMA UPDATE (V2)
-- Description: Updates lab orders for the 11-stage workflow and adds clinics table if missing.

-- 1. Ensure Clinics Table exists in Core
CREATE TABLE IF NOT EXISTS schema_core.clinics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    odoo_partner_id INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed some clinics if empty
INSERT INTO schema_core.clinics (name) 
SELECT 'Clínica Dental San José' WHERE NOT EXISTS (SELECT 1 FROM schema_core.clinics LIMIT 1);
INSERT INTO schema_core.clinics (name) 
SELECT 'Odontología Avanzada GT' WHERE NOT EXISTS (SELECT 1 FROM schema_core.clinics WHERE name = 'Odontología Avanzada GT');

-- 2. Update Status Constraint
ALTER TABLE schema_lab.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE schema_lab.orders ADD CONSTRAINT orders_status_check CHECK (
    status IN (
        'clinic_pending',   -- 1. Órdenes por Clínica
        'digital_picking',  -- 2. Órdenes Digitales
        'income_validation',-- 3. Ingresos
        'gypsum',           -- 4. Yesos
        'design',           -- 5. Diseño
        'client_approval',  -- 6. Aprobación Cliente
        'nesting',          -- 7. NESTING
        'production_man',   -- 8. MAN
        'qa',               -- 9. QA
        'billing',          -- 10. Facturar
        'delivery'          -- 11. Delivery
    )
);

-- 3. Add Logistics Tracking
ALTER TABLE schema_lab.orders ADD COLUMN IF NOT EXISTS is_digital BOOLEAN DEFAULT FALSE;
ALTER TABLE schema_lab.orders ADD COLUMN IF NOT EXISTS courier_name TEXT;
ALTER TABLE schema_lab.orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;
ALTER TABLE schema_lab.orders ADD COLUMN IF NOT EXISTS return_justification TEXT;
ALTER TABLE schema_lab.orders ADD COLUMN IF NOT EXISTS requirement_notes TEXT;

-- 4. Global Kambra RPC
CREATE OR REPLACE FUNCTION public.get_global_kambra()
RETURNS TABLE (
    id UUID,
    clinic_name TEXT,
    doctor_name TEXT,
    patient_summary TEXT,
    status TEXT,
    priority TEXT,
    due_date DATE,
    is_digital BOOLEAN,
    courier_name TEXT,
    tracking_number TEXT,
    requirement_notes TEXT,
    total_price DECIMAL,
    currency TEXT,
    product_name TEXT
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
        ) as product_name
    FROM schema_lab.orders o
    ORDER BY o.due_date ASC, o.created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_global_kambra() TO authenticated;
