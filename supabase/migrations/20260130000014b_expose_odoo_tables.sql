-- Expose Odoo tables to public schema via views for PostgREST access

-- 1. Create view for odoo_config
CREATE OR REPLACE VIEW public.odoo_config AS
SELECT * FROM schema_core.odoo_config;

-- 2. Create view for odoo_field_mappings  
CREATE OR REPLACE VIEW public.odoo_field_mappings AS
SELECT * FROM schema_core.odoo_field_mappings;

-- 3. Create view for odoo_sync_log
CREATE OR REPLACE VIEW public.odoo_sync_log AS
SELECT * FROM schema_core.odoo_sync_log;

-- 4. Create view for odoo_customers
CREATE OR REPLACE VIEW public.odoo_customers AS
SELECT * FROM schema_core.odoo_customers;

-- 5. Create view for odoo_products
CREATE OR REPLACE VIEW public.odoo_products AS
SELECT * FROM schema_core.odoo_products;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.odoo_config TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.odoo_field_mappings TO authenticated;
GRANT SELECT, INSERT ON public.odoo_sync_log TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.odoo_customers TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.odoo_products TO authenticated;
