-- =====================================================
-- SOLUCIÓN COMPLETA: Fix Service Pricing
-- Ejecuta TODO este SQL en Supabase Dashboard → SQL Editor
-- =====================================================

-- PASO 1: Actualizar la vista public.services para incluir columnas faltantes
-- -----------------------------------------------------------------------
DROP VIEW IF EXISTS public.services CASCADE;

CREATE VIEW public.services AS
SELECT 
    id, 
    code,
    name, 
    description, 
    category, 
    image_url,
    base_price,           -- Legacy (deprecated)
    sale_price_gtq,       -- NUEVO - Precio de venta de Odoo
    sale_price_usd,       -- NUEVO
    cost_price_gtq,       -- Precio de costo
    cost_price_usd,       
    turnaround_days,
    odoo_id,              -- Link con Odoo
    last_synced,          -- Timestamp de sync
    is_active, 
    created_at, 
    updated_at
FROM schema_lab.services;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.services TO authenticated;


-- PASO 2: Actualizar el servicio LD-CARILLAS con datos de Odoo
-- -----------------------------------------------------------------------
UPDATE schema_lab.services
SET 
    odoo_id = 2,                    -- ID del producto en odoo_products
    sale_price_gtq = 600.00,        -- Precio de venta de Odoo
    last_synced = NOW()
WHERE name = 'LD-CARILLAS';


-- PASO 3: Verificar que funcionó
-- -----------------------------------------------------------------------
SELECT 
    name, 
    odoo_id, 
    sale_price_gtq, 
    cost_price_gtq, 
    base_price,
    last_synced
FROM schema_lab.services
WHERE name = 'LD-CARILLAS';

-- Deberías ver:
-- name: LD-CARILLAS
-- odoo_id: 2
-- sale_price_gtq: 600.00
-- cost_price_gtq: 0
-- base_price: NULL
-- last_synced: [timestamp actual]
