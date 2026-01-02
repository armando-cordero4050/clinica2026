-- =====================================================
-- RPC FOR READING SERVICES
-- Date: 2026-01-01
-- Description: RPC functions to read services and prices
--              bypassing schema access issues
-- =====================================================

-- Drop existing functions
DROP FUNCTION IF EXISTS public.get_clinic_service_prices(UUID);
DROP FUNCTION IF EXISTS public.get_active_lab_services();

-- 1. Function to get clinic service prices
CREATE OR REPLACE FUNCTION public.get_clinic_service_prices(p_clinic_id UUID)
RETURNS TABLE (
  id UUID,
  clinic_id UUID,
  service_id UUID,
  cost_price_gtq DECIMAL,
  cost_price_usd DECIMAL,
  sale_price_gtq DECIMAL,
  sale_price_usd DECIMAL,
  margin_gtq DECIMAL,
  margin_usd DECIMAL,
  margin_percentage DECIMAL,
  is_active BOOLEAN,
  is_available BOOLEAN,
  updated_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    id,
    clinic_id,
    service_id,
    cost_price_gtq,
    cost_price_usd,
    sale_price_gtq,
    sale_price_usd,
    margin_gtq,
    margin_usd,
    margin_percentage,
    is_active,
    is_available,
    updated_at
  FROM schema_medical.clinic_service_prices
  WHERE clinic_id = p_clinic_id
    AND is_active = true;
$$;

-- 2. Function to get active lab services (from schema_lab)
CREATE OR REPLACE FUNCTION public.get_active_lab_services()
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  category TEXT,
  image_url TEXT,
  cost_price_gtq DECIMAL,
  cost_price_usd DECIMAL,
  turnaround_days INTEGER,
  is_active BOOLEAN
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    id,
    name,
    description,
    category,
    image_url,
    cost_price_gtq,
    cost_price_usd,
    turnaround_days,
    is_active
  FROM schema_lab.services
  WHERE is_active = true
  ORDER BY name;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_clinic_service_prices(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_active_lab_services() TO authenticated;

-- Comments
COMMENT ON FUNCTION public.get_clinic_service_prices IS 'Gets service prices for a specific clinic';
COMMENT ON FUNCTION public.get_active_lab_services IS 'Gets all active lab services';
