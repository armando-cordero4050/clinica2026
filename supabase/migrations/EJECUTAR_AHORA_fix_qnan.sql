-- =====================================================
-- SOLUCIÓN COMPLETA: Fix QNaN en Servicios
-- Ejecuta TODO este SQL en Supabase Dashboard → SQL Editor
-- =====================================================

-- PASO 1: Actualizar RPC get_active_lab_services para incluir sale_price
-- -----------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_active_lab_services()
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  category TEXT,
  image_url TEXT,
  sale_price_gtq DECIMAL,  -- NUEVO
  sale_price_usd DECIMAL,  -- NUEVO
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
    sale_price_gtq,  -- NUEVO
    sale_price_usd,  -- NUEVO
    cost_price_gtq,
    cost_price_usd,
    turnaround_days,
    is_active
  FROM schema_lab.services
  WHERE is_active = true
  ORDER BY name;
$$;


-- PASO 2: Verificar que funciona
-- -----------------------------------------------------------------------
SELECT 
    name, 
    sale_price_gtq, 
    cost_price_gtq,
    is_active
FROM public.get_active_lab_services()
WHERE name = 'LD-CARILLAS';

-- Deberías ver:
-- name: LD-CARILLAS
-- sale_price_gtq: 600.00
-- cost_price_gtq: 0
-- is_active: true
