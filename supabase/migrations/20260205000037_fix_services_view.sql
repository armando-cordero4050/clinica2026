-- =====================================================
-- Fix: Update public.services view to include sale_price columns
-- Date: 2026-01-03
-- Description: Add sale_price_gtq, sale_price_usd, base_price, and odoo_id to the view
-- =====================================================

DROP VIEW IF EXISTS public.services CASCADE;

CREATE VIEW public.services AS
SELECT 
    id, 
    name, 
    description, 
    category, 
    image_url,
    base_price,           -- ← Added (legacy, deprecated)
    sale_price_gtq,       -- ← Added (NEW - Odoo list_price)
    sale_price_usd,       -- ← Added (NEW)
    cost_price_gtq,       -- Existing
    cost_price_usd,       -- Existing
    turnaround_days,
    odoo_id,              -- ← Added (link to Odoo)
    last_synced,          -- ← Added (sync timestamp)
    is_active, 
    created_at, 
    updated_at
FROM schema_lab.services;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.services TO authenticated;

-- Verify the view
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'services'
ORDER BY ordinal_position;
