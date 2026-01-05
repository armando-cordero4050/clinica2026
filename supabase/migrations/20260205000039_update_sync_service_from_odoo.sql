-- =====================================================
-- UPDATE sync_service_from_odoo RPC
-- Date: 2026-01-04
-- Description: Update RPC to save list_price to sale_price_gtq and add standard_price support
-- =====================================================

CREATE OR REPLACE FUNCTION public.sync_service_from_odoo(
    p_odoo_id INTEGER,
    p_name TEXT,
    p_code TEXT,
    p_category TEXT,
    p_list_price DECIMAL,      -- Precio de venta (antes era p_price)
    p_standard_price DECIMAL,  -- NUEVO: Precio de costo
    p_type TEXT,
    p_raw_data JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_service_id UUID;
    v_action TEXT;
BEGIN
    -- 1. Insert/Update into intermediary table
    INSERT INTO schema_core.odoo_products (
        odoo_product_id, name, default_code, list_price, standard_price, type, raw_data, last_synced
    ) VALUES (
        p_odoo_id, p_name, p_code, p_list_price, p_standard_price, p_type, p_raw_data, NOW()
    )
    ON CONFLICT (odoo_product_id) DO UPDATE SET
        name = EXCLUDED.name,
        list_price = EXCLUDED.list_price,
        standard_price = EXCLUDED.standard_price,
        raw_data = EXCLUDED.raw_data,
        last_synced = NOW();

    -- 2. Upsert into schema_lab.services (Business Table)
    INSERT INTO schema_lab.services (
        odoo_id, 
        code, 
        name, 
        category, 
        sale_price_gtq,    -- NUEVO: Precio de venta de Odoo
        cost_price_gtq,    -- NUEVO: Precio de costo de Odoo
        base_price,        -- Mantener por compatibilidad (deprecated)
        type, 
        odoo_category, 
        raw_data, 
        last_synced
    ) VALUES (
        p_odoo_id, 
        COALESCE(p_code, 'ODOO-' || p_odoo_id), 
        p_name, 
        'fija',
        p_list_price,      -- NUEVO: Guardar en sale_price_gtq
        p_standard_price,  -- NUEVO: Guardar en cost_price_gtq
        p_list_price,      -- Mantener base_price por compatibilidad
        p_type, 
        p_category, 
        p_raw_data, 
        NOW()
    )
    ON CONFLICT (odoo_id) DO UPDATE SET
        name = EXCLUDED.name,
        sale_price_gtq = EXCLUDED.sale_price_gtq,    -- NUEVO
        cost_price_gtq = EXCLUDED.cost_price_gtq,    -- NUEVO
        base_price = EXCLUDED.base_price,
        raw_data = EXCLUDED.raw_data,
        last_synced = NOW()
    RETURNING id INTO v_service_id;

    IF FOUND THEN v_action := 'updated'; ELSE v_action := 'inserted'; END IF;

    RETURN jsonb_build_object(
        'success', true, 
        'id', v_service_id, 
        'action', v_action
    );
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false, 
        'error', SQLERRM
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.sync_service_from_odoo TO authenticated;

-- Verificar
SELECT * FROM public.sync_service_from_odoo(
    2,                    -- odoo_id
    'LD-CARILLAS',       -- name
    'ODOO-2',            -- code
    'Laboratorio',       -- category
    600.00,              -- list_price (sale_price_gtq)
    300.00,              -- standard_price (cost_price_gtq)
    'product',           -- type
    '{}'::jsonb          -- raw_data
);
