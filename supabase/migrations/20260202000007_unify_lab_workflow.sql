-- UNIFY LAB WORKFLOW TO 11 STAGES (KAMBA)
-- Description: Ensures the database matches the architecture guide (Global Kamba).

-- 1. Drop old constraints (be thorough)
ALTER TABLE schema_lab.orders DROP CONSTRAINT IF EXISTS orders_status_check;
-- Attempt to drop auto-generated ones if they exist
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'schema_lab.orders'::regclass 
        AND contype = 'c' 
        AND pg_get_constraintdef(oid) LIKE '%status%'
    ) LOOP
        EXECUTE 'ALTER TABLE schema_lab.orders DROP CONSTRAINT ' || quote_ident(r.conname);
    END LOOP;
END $$;

-- 2. Add THE correct 11-stage constraint
ALTER TABLE schema_lab.orders ADD CONSTRAINT orders_status_check CHECK (
    status IN (
        'clinic_pending',   -- 1. Clínica
        'digital_picking',  -- 2. Digital
        'income_validation',-- 3. Ingresos
        'gypsum',           -- 4. Yesos
        'design',           -- 5. Diseño
        'client_approval',  -- 6. Aprobación
        'nesting',          -- 7. Nesting
        'production_man',   -- 8. MAN
        'qa',               -- 9. QA
        'billing',          -- 10. Facturar
        'delivery'          -- 11. Delivery
    )
);

-- 3. Migrate existing data (mapping)
UPDATE schema_lab.orders SET status = 'design' WHERE status IN ('new', 'milling');
UPDATE schema_lab.orders SET status = 'qa' WHERE status IN ('ceramic', 'qc');
UPDATE schema_lab.orders SET status = 'delivery' WHERE status IN ('ready', 'delivered');
-- Default for any unknown
UPDATE schema_lab.orders SET status = 'clinic_pending' WHERE status NOT IN (
    'clinic_pending', 'digital_picking', 'income_validation', 'gypsum', 'design', 
    'client_approval', 'nesting', 'production_man', 'qa', 'billing', 'delivery'
);

-- 4. Update Odoo Sync RPC to use the new stages
CREATE OR REPLACE FUNCTION public.sync_order_from_odoo(
    p_odoo_sale_order_id INTEGER,
    p_sale_order_data JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = schema_lab, schema_medical, schema_core, public
AS $$
DECLARE
    v_order_id UUID;
    v_clinic_id UUID;
    v_patient_name TEXT;
    v_patient_id TEXT;
    v_status TEXT;
    v_price DECIMAL(10,2);
    v_due_date DATE;
    v_partner_id INTEGER;
    v_is_digital BOOLEAN;
BEGIN
    -- Extract partner_id
    v_partner_id := (p_sale_order_data->'partner_id'->0)::INTEGER;
    
    -- Find clinic
    SELECT id INTO v_clinic_id FROM schema_medical.clinics WHERE odoo_partner_id = v_partner_id;
    IF v_clinic_id IS NULL THEN
        RAISE EXCEPTION 'Clinic not found for Odoo partner %', v_partner_id;
    END IF;
    
    -- Extract patient info
    v_patient_name := substring(p_sale_order_data->>'note' from 'Paciente:.*- (.+)');
    v_patient_id := substring(p_sale_order_data->>'note' from 'Paciente: ([^ ]+)');
    
    v_is_digital := COALESCE((p_sale_order_data->>'is_digital')::BOOLEAN, FALSE);

    -- Map Odoo state to NEW 11-stage status
    v_status := CASE p_sale_order_data->>'state'
        WHEN 'draft' THEN 'clinic_pending'
        WHEN 'sent' THEN 'clinic_pending'
        WHEN 'sale' THEN CASE WHEN v_is_digital THEN 'digital_picking' ELSE 'income_validation' END
        WHEN 'done' THEN 'delivery'
        ELSE 'clinic_pending'
    END;
    
    v_price := COALESCE((p_sale_order_data->>'amount_total')::DECIMAL(10,2), 0);
    
    -- Parse due_date
    BEGIN
        v_due_date := (p_sale_order_data->>'commitment_date')::DATE;
    EXCEPTION WHEN OTHERS THEN
        v_due_date := NULL;
    END;
    
    -- Sync
    SELECT id INTO v_order_id FROM schema_lab.orders WHERE odoo_sale_order_id = p_odoo_sale_order_id;
    
    IF v_order_id IS NULL THEN
        INSERT INTO schema_lab.orders (
            clinic_id, patient_name, patient_id, status, due_date, total_price, odoo_sale_order_id, odoo_raw_data, last_synced_from_odoo, is_digital
        ) VALUES (
            v_clinic_id, COALESCE(v_patient_name, 'Paciente Odoo'), v_patient_id, v_status, v_due_date, v_price, p_odoo_sale_order_id, p_sale_order_data, NOW(), v_is_digital
        ) RETURNING id INTO v_order_id;
    ELSE
        UPDATE schema_lab.orders SET
            patient_name = COALESCE(v_patient_name, patient_name),
            patient_id = COALESCE(v_patient_id, patient_id),
            status = v_status,
            due_date = v_due_date,
            total_price = v_price,
            odoo_raw_data = p_sale_order_data,
            last_synced_from_odoo = NOW(),
            is_digital = v_is_digital
        WHERE id = v_order_id;
    END IF;
    
    RETURN v_order_id;
END;
$$;
