-- =====================================================
-- ACTUALIZACIÓN SCHEMA LAB SERVICES
-- Date: 2026-01-01
-- Description: Añadir columnas faltantes a schema_lab.services
--              para soportar synced data de Odoo
-- =====================================================

-- Añadir columnas
ALTER TABLE schema_lab.services
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS cost_price_gtq DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS cost_price_usd DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS turnaround_days INTEGER DEFAULT 1;

-- Actualizar get_active_lab_services function para reflejar la estructura real
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
