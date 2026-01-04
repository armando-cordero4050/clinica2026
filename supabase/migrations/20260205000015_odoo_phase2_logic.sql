-- ==========================================================
-- ODOO INTEGRATION PHASE 2: TOTAL SYNC & FINANCIAL LOGIC
-- Date: 2026-02-05
-- ==========================================================

-- 0. CLEANUP OLD FUNCTIONS (Avoid signature ambiguity)
DROP FUNCTION IF EXISTS public.sync_clinic_from_odoo(integer,jsonb,jsonb);
DROP FUNCTION IF EXISTS public.sync_clinic_from_odoo(integer,text,text,text,text);
DROP FUNCTION IF EXISTS public.sync_clinic_from_odoo(integer,text,text,text,text,text);
DROP FUNCTION IF EXISTS public.sync_service_from_odoo(integer,jsonb);
DROP FUNCTION IF EXISTS public.sync_service_from_odoo(integer,text,text,text,numeric,numeric,text,text,integer,boolean);
-- Catch duplicates with similar signatures
DROP FUNCTION IF EXISTS public.sync_service_from_odoo(integer,text,text,text,numeric,numeric,text,text,integer,boolean,integer);
DROP FUNCTION IF EXISTS public.sync_service_from_odoo(integer,text,text,text,numeric,numeric,numeric,text,text,integer,boolean);

-- 1. EXTEND FIELD MAPPINGS
ALTER TABLE schema_core.odoo_field_mappings 
ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS can_read BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS can_write BOOLEAN DEFAULT FALSE;

-- 2. EXTEND ODOO PRODUCTS
ALTER TABLE schema_core.odoo_products 
ADD COLUMN IF NOT EXISTS raw_data JSONB DEFAULT '{}'::jsonb;

-- 3. EXTEND ODOO CUSTOMERS (CLINICS)
ALTER TABLE schema_core.odoo_customers 
ADD COLUMN IF NOT EXISTS payment_term_id INTEGER,
ADD COLUMN IF NOT EXISTS payment_term_name TEXT,
ADD COLUMN IF NOT EXISTS payment_policy TEXT, -- 'cash' or 'credit'
ADD COLUMN IF NOT EXISTS raw_data JSONB DEFAULT '{}'::jsonb;

-- 4. UPDATE SERVICES TABLE IN LABORATORY SCHEMA
ALTER TABLE schema_lab.services
ADD COLUMN IF NOT EXISTS raw_data JSONB DEFAULT '{}'::jsonb;

-- 5. UPDATE CLINICS TABLE IN MEDICAL SCHEMA
ALTER TABLE schema_medical.clinics
ADD COLUMN IF NOT EXISTS payment_policy TEXT DEFAULT 'cash',
ADD COLUMN IF NOT EXISTS odoo_raw_data JSONB DEFAULT '{}'::jsonb;

-- 7. RE-CREATE RPC FOR SYNCING CLINICS
CREATE OR REPLACE FUNCTION public.sync_clinic_from_odoo(
    p_odoo_id INTEGER,
    p_name TEXT,
    p_email TEXT,
    p_phone TEXT,
    p_mobile TEXT,
    p_vat TEXT,
    p_street TEXT,
    p_city TEXT,
    p_country_id INTEGER,
    p_payment_term_id INTEGER,
    p_payment_term_name TEXT,
    p_payment_policy TEXT,
    p_raw_data JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_id UUID;
BEGIN
    -- 1. Sync in Odoo Master Table (schema_core)
    INSERT INTO schema_core.odoo_customers (
        odoo_customer_id,
        name,
        email,
        phone,
        mobile,
        vat,
        street,
        city,
        country_id,
        payment_term_id,
        payment_term_name,
        payment_policy,
        raw_data,
        updated_at
    ) VALUES (
        p_odoo_id,
        p_name,
        p_email,
        p_phone,
        p_mobile,
        p_vat,
        p_street,
        p_city,
        p_country_id,
        p_payment_term_id,
        p_payment_term_name,
        p_payment_policy,
        p_raw_data,
        NOW()
    )
    ON CONFLICT (odoo_customer_id) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        mobile = EXCLUDED.mobile,
        vat = EXCLUDED.vat,
        street = EXCLUDED.street,
        city = EXCLUDED.city,
        country_id = EXCLUDED.country_id,
        payment_term_id = EXCLUDED.payment_term_id,
        payment_term_name = EXCLUDED.payment_term_name,
        payment_policy = EXCLUDED.payment_policy,
        raw_data = EXCLUDED.raw_data,
        updated_at = NOW();

    -- 2. Promote to Business Clinic (schema_medical)
    INSERT INTO schema_medical.clinics (
        name,
        email,
        phone,
        address,
        odoo_id,
        payment_policy,
        odoo_raw_data,
        updated_at
    ) VALUES (
        p_name,
        p_email,
        p_phone,
        COALESCE(p_street || ', ' || p_city, p_street, p_city),
        p_odoo_id,
        p_payment_policy,
        p_raw_data,
        NOW()
    )
    ON CONFLICT (odoo_id) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        payment_policy = EXCLUDED.payment_policy,
        odoo_raw_data = EXCLUDED.odoo_raw_data,
        updated_at = NOW()
    RETURNING id INTO v_id;

    RETURN v_id;
END;
$$;

-- 8. RE-CREATE RPC FOR SYNCING SERVICES (PRODUCTS)
CREATE OR REPLACE FUNCTION public.sync_service_from_odoo(
  p_odoo_id INTEGER,
  p_code TEXT,
  p_name TEXT,
  p_category TEXT,
  p_cost_price_gtq DECIMAL,
  p_cost_price_usd DECIMAL,
  p_image_url TEXT,
  p_description TEXT,
  p_turnaround_days INTEGER,
  p_is_active BOOLEAN,
  p_raw_data JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id UUID;
BEGIN
  -- 1. Update Core Master Table
  INSERT INTO schema_core.odoo_products (
    odoo_product_id,
    default_code,
    name,
    list_price,
    standard_price,
    raw_data,
    updated_at
  ) VALUES (
    p_odoo_id,
    p_code,
    p_name,
    COALESCE(p_cost_price_gtq, 0),
    COALESCE(p_cost_price_usd, 0),
    p_raw_data,
    NOW()
  )
  ON CONFLICT (odoo_product_id) DO UPDATE SET
    default_code = EXCLUDED.default_code,
    name = EXCLUDED.name,
    list_price = EXCLUDED.list_price,
    standard_price = EXCLUDED.standard_price,
    raw_data = EXCLUDED.raw_data,
    updated_at = NOW();

  -- 2. Update Lab Operational Table
  INSERT INTO schema_lab.services (
    odoo_id,
    code,
    name,
    category,
    cost_price_gtq,
    cost_price_usd,
    image_url,
    description,
    turnaround_days,
    is_active,
    raw_data,
    updated_at
  ) VALUES (
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
    p_raw_data,
    NOW()
  )
  ON CONFLICT (odoo_id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    cost_price_gtq = EXCLUDED.cost_price_gtq,
    cost_price_usd = EXCLUDED.cost_price_usd,
    image_url = EXCLUDED.image_url,
    description = EXCLUDED.description,
    turnaround_days = EXCLUDED.turnaround_days,
    is_active = EXCLUDED.is_active,
    raw_data = EXCLUDED.raw_data,
    updated_at = NOW()
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$;

-- 9. PERMISSIONS
GRANT EXECUTE ON FUNCTION public.sync_clinic_from_odoo(INTEGER, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, INTEGER, INTEGER, TEXT, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.sync_service_from_odoo(INTEGER, TEXT, TEXT, TEXT, DECIMAL, DECIMAL, TEXT, TEXT, INTEGER, BOOLEAN, JSONB) TO authenticated;
