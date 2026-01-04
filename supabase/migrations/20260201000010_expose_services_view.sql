-- =====================================================
-- EXPOSE SERVICES AND SYNC LOGS
-- Description: Create public views for lab services and sync logs
--              to allow access from Supabase client
-- =====================================================

-- 1. Expose schema_lab.services
DROP VIEW IF EXISTS public.services CASCADE;
CREATE VIEW public.services AS
SELECT 
    id, name, description, category, image_url,
    cost_price_gtq, cost_price_usd, turnaround_days,
    is_active, created_at, updated_at
FROM schema_lab.services;

-- 2. Expose schema_medical.clinic_service_prices
DROP VIEW IF EXISTS public.clinic_service_prices CASCADE;
CREATE VIEW public.clinic_service_prices AS
SELECT 
    id, clinic_id, service_id, sale_price_gtq, sale_price_usd,
    cost_price_gtq, cost_price_usd, margin_percentage,
    is_available, is_active, created_at, updated_at
FROM schema_medical.clinic_service_prices;

-- 3. Expose schema_core.clinic_last_sync view (it's already a view in schema_core, move to public)
DROP VIEW IF EXISTS public.clinic_last_sync CASCADE;
CREATE VIEW public.clinic_last_sync AS
SELECT * FROM schema_core.clinic_last_sync;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clinic_service_prices TO authenticated;
GRANT SELECT ON public.clinic_last_sync TO authenticated;

-- Grant usage on schemas just in case (though views don't strictly need it for PostgREST if they are in public)
GRANT USAGE ON SCHEMA schema_lab TO authenticated;
GRANT USAGE ON SCHEMA schema_medical TO authenticated;
GRANT USAGE ON SCHEMA schema_core TO authenticated;
