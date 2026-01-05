-- =====================================================
-- Migration: Fix Service Pricing Schema
-- Date: 2026-01-03
-- Description: Add sale_price columns and update sync RPC to properly save Odoo list_price
-- =====================================================

-- 1. Add sale price columns to services table
ALTER TABLE schema_lab.services
ADD COLUMN IF NOT EXISTS sale_price_gtq DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS sale_price_usd DECIMAL(10,2) DEFAULT 0;

-- 2. Migrate existing base_price data to sale_price_gtq (if any exists)
UPDATE schema_lab.services
SET sale_price_gtq = base_price
WHERE base_price IS NOT NULL AND base_price > 0;

-- 3. Update the sync RPC to save to sale_price_gtq instead of base_price
DROP FUNCTION IF EXISTS public.sync_service_from_odoo(INTEGER, TEXT, TEXT, TEXT, DECIMAL, TEXT, JSONB);

CREATE OR REPLACE FUNCTION public.sync_service_from_odoo(
    p_odoo_id INTEGER,
    p_name TEXT,
    p_code TEXT,
    p_category TEXT,
    p_price DECIMAL,
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
    -- 1. Insert/Update into intermediary table (odoo_products)
    INSERT INTO schema_core.odoo_products (
        odoo_product_id, name, default_code, list_price, type, raw_data, last_synced
    ) VALUES (
        p_odoo_id, p_name, p_code, p_price, p_type, p_raw_data, NOW()
    )
    ON CONFLICT (odoo_product_id) DO UPDATE SET
        name = EXCLUDED.name,
        list_price = EXCLUDED.list_price,
        raw_data = EXCLUDED.raw_data,
        last_synced = NOW();

    -- 2. Upsert into schema_lab.services (Business Table)
    -- Save Odoo's list_price to sale_price_gtq (this is the sale price from Odoo)
    
    INSERT INTO schema_lab.services (
        odoo_id, code, name, category, sale_price_gtq, type, odoo_category, raw_data, last_synced
    ) VALUES (
        p_odoo_id, 
        COALESCE(p_code, 'ODOO-' || p_odoo_id), 
        p_name, 
        'fija', -- Default category (SAFE FALLBACK)
        p_price, -- Save to sale_price_gtq (Odoo's list_price)
        p_type, 
        p_category, 
        p_raw_data, 
        NOW()
    )
    ON CONFLICT (odoo_id) DO UPDATE SET
        name = EXCLUDED.name,
        sale_price_gtq = EXCLUDED.sale_price_gtq, -- Update sale price
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

-- 4. Add comment for clarity
COMMENT ON COLUMN schema_lab.services.sale_price_gtq IS 'Precio de venta desde Odoo (list_price) - Lo que cobra el laboratorio a la clínica';
COMMENT ON COLUMN schema_lab.services.cost_price_gtq IS 'Precio de costo desde Odoo (standard_price) - Lo que le cuesta al laboratorio producir';
COMMENT ON COLUMN schema_lab.services.base_price IS 'DEPRECATED - Use sale_price_gtq instead. Kept for backward compatibility.';
