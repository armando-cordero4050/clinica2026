CREATE OR REPLACE FUNCTION public.sync_service_from_odoo(
    p_odoo_id integer,
    p_code text,
    p_name text,
    p_category text,
    p_cost_price_gtq numeric,
    p_cost_price_usd numeric,
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
        odoo_product_id,
        code,
        name,
        category,
        cost_price_gtq,
        cost_price_usd,
        image_url,
        description,
        turnaround_days,
        is_active,
        sla_hours,
        sla_minutes
    )
    VALUES (
        p_odoo_id,
        p_code,
        p_name,
        p_category,
        p_cost_price_gtq,
        p_cost_price_usd,
        p_image_url,
        p_description,
        p_turnaround_days,
        p_is_active,
        p_sla_hours,
        p_sla_minutes
    )
    ON CONFLICT (odoo_product_id) DO UPDATE SET
        code = EXCLUDED.code,
        name = EXCLUDED.name,
        category = EXCLUDED.category,
        cost_price_gtq = EXCLUDED.cost_price_gtq,
        cost_price_usd = EXCLUDED.cost_price_usd,
        image_url = EXCLUDED.image_url,
        description = EXCLUDED.description,
        is_active = EXCLUDED.is_active,
        -- No sobreescribimos SLA si ya existe, a menos que sea 0
        sla_hours = CASE WHEN schema_lab.services.sla_hours = 0 THEN EXCLUDED.sla_hours ELSE schema_lab.services.sla_hours END,
        sla_minutes = CASE WHEN schema_lab.services.sla_minutes = 0 THEN EXCLUDED.sla_minutes ELSE schema_lab.services.sla_minutes END
    RETURNING id INTO v_id;
    
    RETURN v_id;
END;
$$;
