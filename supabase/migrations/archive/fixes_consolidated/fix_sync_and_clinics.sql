-- 1. Actualizar procedimiento de servicios para incluir base_price
CREATE OR REPLACE FUNCTION public.sync_service_from_odoo(
    p_odoo_id integer,
    p_code text,
    p_name text,
    p_category text,
    p_cost_price_gtq numeric,
    p_cost_price_usd numeric,
    p_base_price numeric, -- NUEVO: Precio de venta de Odoo
    p_image_url text,
    p_description text,
    p_turnaround_days integer,
    p_is_active boolean,
    p_sla_hours integer DEFAULT 0,
    p_sla_minutes integer DEFAULT 0
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_id uuid;
BEGIN
    INSERT INTO schema_lab.services (
        odoo_id,
        code,
        name,
        category,
        cost_price_gtq,
        cost_price_usd,
        base_price, -- ASIGNAMOS EL PRECIO DE VENTA
        image_url,
        description,
        turnaround_days,
        is_active,
        sla_hours,
        sla_minutes,
        last_synced_from_odoo
    )
    VALUES (
        p_odoo_id,
        p_code,
        p_name,
        p_category,
        p_cost_price_gtq,
        p_cost_price_usd,
        p_base_price,
        p_image_url,
        p_description,
        p_turnaround_days,
        p_is_active,
        p_sla_hours,
        p_sla_minutes,
        NOW()
    )
    ON CONFLICT (odoo_id) DO UPDATE SET
        code = EXCLUDED.code,
        name = EXCLUDED.name,
        category = EXCLUDED.category,
        cost_price_gtq = EXCLUDED.cost_price_gtq,
        cost_price_usd = EXCLUDED.cost_price_usd,
        base_price = EXCLUDED.base_price, -- ACTUALIZAMOS PRECIO
        image_url = EXCLUDED.image_url,
        description = EXCLUDED.description,
        is_active = EXCLUDED.is_active,
        last_synced_from_odoo = NOW()
    RETURNING id INTO v_id;
    
    RETURN v_id;
END;
$$;

-- 2. Función para auto-crear clínicas desde clientes de Odoo
CREATE OR REPLACE FUNCTION public.sync_clinic_from_odoo(
    p_odoo_id integer,
    p_name text,
    p_email text,
    p_phone text,
    p_address text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_clinic_id uuid;
BEGIN
    -- Insertar o actualizar en la tabla maestra de clínicas
    INSERT INTO schema_medical.clinics (
        name,
        odoo_partner_id,
        address,
        is_active,
        created_at
    )
    VALUES (
        p_name,
        p_odoo_id,
        p_address,
        true,
        NOW()
    )
    ON CONFLICT (odoo_partner_id) DO UPDATE SET
        name = EXCLUDED.name,
        address = EXCLUDED.address
    RETURNING id INTO v_clinic_id;

    RETURN v_clinic_id;
END;
$$;
