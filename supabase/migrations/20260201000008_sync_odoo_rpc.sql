-- =====================================================
-- RPC FOR ODOO SERVICES SYNC
-- Date: 2026-01-01
-- Description: Upsert services from Odoo to schema_lab.services
-- =====================================================

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
  p_is_active BOOLEAN
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id UUID;
BEGIN
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
    updated_at = NOW()
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.sync_service_from_odoo(INTEGER, TEXT, TEXT, TEXT, DECIMAL, DECIMAL, TEXT, TEXT, INTEGER, BOOLEAN) TO authenticated;
