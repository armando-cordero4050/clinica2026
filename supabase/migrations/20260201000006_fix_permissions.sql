-- =====================================================
-- FIX PERMISOS RPC
-- Date: 2026-01-01
-- Description: Asegurar permisos correctos para RPC functions
-- =====================================================

-- 1. Asegurar acceso a schemas
GRANT USAGE ON SCHEMA schema_lab TO authenticated;
GRANT USAGE ON SCHEMA schema_medical TO authenticated;
GRANT USAGE ON SCHEMA schema_core TO authenticated;

-- 2. Asegurar acceso a tablas (necesario aunque sea SECURITY DEFINER en algunos contextos)
GRANT SELECT ON schema_lab.services TO authenticated;
GRANT ALL ON schema_medical.clinic_service_prices TO authenticated;
GRANT ALL ON schema_core.service_sync_log TO authenticated;

-- 3. Recrear funciones RPC asegurando search_path
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
SET search_path = public, schema_lab
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
SET search_path = public, schema_medical
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
