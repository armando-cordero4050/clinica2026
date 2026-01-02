-- 📦 ORDERS SYNC WITH ODOO MODULE
-- Description: Bidirectional sync of orders with Odoo Sale Orders

-- 1. RPC to sync a single order from Odoo
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
BEGIN
    -- Safely extract partner_id
    BEGIN
        v_partner_id := (p_sale_order_data->'partner_id'->0)::INTEGER;
    EXCEPTION WHEN OTHERS THEN
        RAISE EXCEPTION 'Invalid partner_id format in sale order %', p_odoo_sale_order_id;
    END;
    
    -- Extract clinic from partner_id (Odoo returns [id, "name"])
    SELECT id INTO v_clinic_id
    FROM schema_medical.clinics
    WHERE odoo_partner_id = v_partner_id;
    
    IF v_clinic_id IS NULL THEN
        RAISE EXCEPTION 'Clinic not found for Odoo partner %', v_partner_id;
    END IF;
    
    -- Extract patient info from note field (format: "Paciente: ID - Name")
    v_patient_name := COALESCE(
        substring(p_sale_order_data->>'note' from 'Paciente:.*- (.+)'),
        'Paciente desconocido'
    );
    v_patient_id := substring(p_sale_order_data->>'note' from 'Paciente: ([^ ]+)');
    
    -- Map Odoo state to DentalFlow status
    v_status := CASE p_sale_order_data->>'state'
        WHEN 'draft' THEN 'new'
        WHEN 'sent' THEN 'new'
        WHEN 'sale' THEN 'design'
        WHEN 'done' THEN 'delivered'
        ELSE 'new'
    END;
    
    v_price := COALESCE((p_sale_order_data->>'amount_total')::DECIMAL(10,2), 0);
    
    -- Safely parse due_date (handle 'false' and invalid dates)
    BEGIN
        IF p_sale_order_data->>'commitment_date' IS NOT NULL 
           AND p_sale_order_data->>'commitment_date' != 'false' 
           AND p_sale_order_data->>'commitment_date' != '' THEN
            v_due_date := (p_sale_order_data->>'commitment_date')::DATE;
        ELSE
            v_due_date := NULL;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        v_due_date := NULL;
    END;
    
    -- Check if order already exists
    SELECT id INTO v_order_id 
    FROM schema_lab.orders 
    WHERE odoo_sale_order_id = p_odoo_sale_order_id;
    
    IF v_order_id IS NULL THEN
        -- Create new order
        INSERT INTO schema_lab.orders (
            clinic_id,
            patient_name,
            patient_id,
            doctor_name,
            status,
            due_date,
            price,
            odoo_sale_order_id,
            odoo_raw_data,
            last_synced_from_odoo
        ) VALUES (
            v_clinic_id,
            v_patient_name,
            v_patient_id,
            COALESCE(p_sale_order_data->>'user_id', 'Laboratorio'),
            v_status,
            v_due_date,
            v_price,
            p_odoo_sale_order_id,
            p_sale_order_data,
            NOW()
        ) RETURNING id INTO v_order_id;
    ELSE
        -- Update existing order
        UPDATE schema_lab.orders SET
            patient_name = v_patient_name,
            patient_id = v_patient_id,
            status = v_status,
            due_date = v_due_date,
            price = v_price,
            odoo_raw_data = p_sale_order_data,
            last_synced_from_odoo = NOW()
        WHERE id = v_order_id;
    END IF;
    
    RETURN v_order_id;
END;
$$;

-- 2. RPC to get orders with clinic and staff details
CREATE OR REPLACE FUNCTION public.get_orders_with_details()
RETURNS TABLE (
    id UUID,
    clinic_id UUID,
    clinic_name TEXT,
    patient_name TEXT,
    patient_id TEXT,
    doctor_name TEXT,
    staff_name TEXT,
    status TEXT,
    priority TEXT,
    due_date DATE,
    price DECIMAL(10,2),
    odoo_sale_order_id INTEGER,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = schema_lab, schema_medical, schema_core, public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id,
        o.clinic_id,
        c.name as clinic_name,
        o.patient_name,
        o.patient_id,
        o.doctor_name,
        u.name as staff_name,
        o.status,
        o.priority,
        o.due_date,
        o.price,
        o.odoo_sale_order_id,
        o.created_at
    FROM schema_lab.orders o
    LEFT JOIN schema_medical.clinics c ON o.clinic_id = c.id
    LEFT JOIN schema_medical.clinic_staff cs ON o.staff_id = cs.id
    LEFT JOIN schema_core.users u ON cs.user_id = u.id
    ORDER BY o.created_at DESC;
END;
$$;

-- 3. Create view for orders
CREATE OR REPLACE VIEW public.orders AS
SELECT * FROM schema_lab.orders;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT EXECUTE ON FUNCTION public.sync_order_from_odoo TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_orders_with_details TO authenticated;
