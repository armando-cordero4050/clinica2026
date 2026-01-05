-- =====================================================
-- UPDATE get_active_lab_services RPC
-- Date: 2026-01-04
-- Description: Add sale_price_gtq and sale_price_usd to RPC return type
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_active_lab_services()
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  category TEXT,
  image_url TEXT,
  sale_price_gtq DECIMAL,  -- ADDED
  sale_price_usd DECIMAL,  -- ADDED
  cost_price_gtq DECIMAL,
  cost_price_usd DECIMAL,
  turnaround_days INTEGER,
  is_active BOOLEAN
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, schema_lab
AS $$
  SELECT 
    id,
    name,
    description,
    category,
    image_url,
    sale_price_gtq,  -- ADDED
    sale_price_usd,  -- ADDED
    cost_price_gtq,
    cost_price_usd,
    turnaround_days,
    is_active
  FROM schema_lab.services
  WHERE is_active = true
  ORDER BY name;
$$;

-- Verify
SELECT * FROM public.get_active_lab_services() LIMIT 1;
