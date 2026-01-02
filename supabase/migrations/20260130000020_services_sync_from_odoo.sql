-- 🔧 SERVICES SYNC FROM ODOO MODULE
-- Description: Sync Odoo Products as Lab Services (filtered by LD prefix or lab category)

-- 1. RPC to sync a single service from Odoo
CREATE OR REPLACE FUNCTION public.sync_service_from_odoo(
    p_odoo_product_id INTEGER,
    p_product_data JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = schema_lab, schema_core, public
AS $$
DECLARE
    v_service_id UUID;
    v_product_name TEXT;
    v_product_code TEXT;
    v_category TEXT;
    v_price DECIMAL(10,2);
BEGIN
    -- Extract product data
    v_product_name := p_product_data->>'name';
    v_product_code := COALESCE(p_product_data->>'default_code', 'SRV-' || p_odoo_product_id::TEXT);
    v_category := p_product_data->>'categ_id'; -- This will be the category name from Odoo
    v_price := COALESCE((p_product_data->>'list_price')::DECIMAL(10,2), 0);
    
    -- Check if service already exists
    SELECT id INTO v_service_id 
    FROM schema_lab.services 
    WHERE odoo_id = p_odoo_product_id;
    
    IF v_service_id IS NULL THEN
        -- Create new service
        INSERT INTO schema_lab.services (
            code,
            name,
            category,
            base_price,
            odoo_id,
            odoo_category,
            odoo_raw_data,
            last_synced_from_odoo,
            is_active
        ) VALUES (
            v_product_code,
            v_product_name,
            COALESCE(v_category, 'general'), -- Default category if none provided
            v_price,
            p_odoo_product_id,
            v_category,
            p_product_data,
            NOW(),
            COALESCE((p_product_data->>'active')::BOOLEAN, TRUE)
        ) RETURNING id INTO v_service_id;
    ELSE
        -- Update existing service
        UPDATE schema_lab.services SET
            code = v_product_code,
            name = v_product_name,
            category = COALESCE(v_category, category),
            base_price = v_price,
            odoo_category = v_category,
            odoo_raw_data = p_product_data,
            last_synced_from_odoo = NOW(),
            is_active = COALESCE((p_product_data->>'active')::BOOLEAN, TRUE)
        WHERE id = v_service_id;
    END IF;
    
    RETURN v_service_id;
END;
$$;

-- 2. Create view for services
CREATE OR REPLACE VIEW public.services AS
SELECT * FROM schema_lab.services;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT EXECUTE ON FUNCTION public.sync_service_from_odoo TO authenticated;
