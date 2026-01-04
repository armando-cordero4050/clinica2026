-- Add Odoo fields to schema_lab.services
-- Date: 2026-01-03
-- Purpose: Support Phase 2 Sync (Products)

-- 1. Extend services table
ALTER TABLE schema_lab.services
ADD COLUMN IF NOT EXISTS odoo_category TEXT,
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'service',
ADD COLUMN IF NOT EXISTS last_synced TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS raw_data JSONB DEFAULT '{}'::jsonb;

-- 2. Drop existing check constraint if strict, to allow imported categories
-- NOTE: We keep the column 'category' for local logic, but we might need to expand the enum
-- For now, we'll keep the check but map everything unknown to 'fija' or 'otros' in code.
-- IF we wanted to relax:
-- ALTER TABLE schema_lab.services DROP CONSTRAINT IF EXISTS services_category_check;
-- ALTER TABLE schema_lab.services ADD CONSTRAINT services_category_check CHECK (category IN ('fija', 'removible', 'ortodoncia', 'implantes', 'otros'));

-- 3. Create Odoo Product Storage (Intermediary - Phase 2 requirement)
-- This table was defined in 20260130000013 but might need updates
CREATE TABLE IF NOT EXISTS schema_core.odoo_products (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     odoo_product_id INTEGER UNIQUE NOT NULL,
     name TEXT NOT NULL,
     default_code TEXT, -- SKU
     list_price DECIMAL(10,2),
     standard_price DECIMAL(10,2),
     type TEXT, -- 'product', 'service', 'consu'
     categ_id INTEGER,
     uom_id INTEGER,
     raw_data JSONB,
     last_synced TIMESTAMPTZ DEFAULT NOW(),
     created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. RPC to Sync Product
-- Drop existing function with potential signature conflicts
DROP FUNCTION IF EXISTS public.sync_service_from_odoo(INTEGER, TEXT, TEXT, DECIMAL, TEXT, INTEGER, JSONB);
DROP FUNCTION IF EXISTS public.sync_service_from_odoo(INTEGER, TEXT, TEXT, DECIMAL, TEXT, JSONB);
-- Drop generic catch-all just in case
-- DROP FUNCTION IF EXISTS public.sync_service_from_odoo; 

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
    -- 1. Insert/Update into intermediary table
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
    -- We map 'Laboratorio' or others to default 'fija' if not recognized
    -- Logic should be handled by caller, but here we ensure code uniqueness
    
    INSERT INTO schema_lab.services (
        odoo_id, code, name, category, base_price, type, odoo_category, raw_data, last_synced
    ) VALUES (
        p_odoo_id, 
        COALESCE(p_code, 'ODOO-' || p_odoo_id), 
        p_name, 
        'fija', -- Default category (SAFE FALLBACK)
        p_price, 
        p_type, 
        p_category, 
        p_raw_data, 
        NOW()
    )
    ON CONFLICT (odoo_id) DO UPDATE SET
        name = EXCLUDED.name,
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
