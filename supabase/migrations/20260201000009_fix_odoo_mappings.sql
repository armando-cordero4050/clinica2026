-- =====================================================
-- FIX ODOO MAPPINGS & PERMISSIONS
-- Date: 2026-01-01
-- Description: Ensure access to Odoo config tables and mappings
-- =====================================================

-- 1. Permisos de Schema
GRANT USAGE ON SCHEMA schema_core TO authenticated;

-- 2. Permisos de Tablas
GRANT SELECT, INSERT, UPDATE ON schema_core.odoo_config TO authenticated;
GRANT SELECT, INSERT, UPDATE ON schema_core.odoo_field_mappings TO authenticated;
GRANT SELECT, INSERT, UPDATE ON schema_core.odoo_sync_log TO authenticated;

-- 3. Recrear RPC get_odoo_field_mappings para asegurar path
CREATE OR REPLACE FUNCTION public.get_odoo_field_mappings(p_module TEXT)
RETURNS TABLE (
    id UUID,
    module TEXT,
    odoo_field_name TEXT,
    odoo_field_type TEXT,
    local_field_name TEXT,
    is_enabled BOOLEAN,
    sync_mode TEXT,
    is_required BOOLEAN,
    description TEXT
) 
LANGUAGE sql 
SECURITY DEFINER
SET search_path = schema_core, public
AS $$
    SELECT id, module, odoo_field_name, odoo_field_type, local_field_name, 
           is_enabled, sync_mode, is_required, description
    FROM schema_core.odoo_field_mappings
    WHERE module = p_module
    ORDER BY is_required DESC, odoo_field_name;
$$;

-- 4. Asegurar datos default (Upsert)
INSERT INTO schema_core.odoo_field_mappings (module, odoo_field_name, odoo_field_type, description, is_required, is_enabled) VALUES
    ('products', 'name', 'char', 'Nombre del producto', true, true),
    ('products', 'default_code', 'char', 'Código/SKU', false, true),
    ('products', 'list_price', 'float', 'Precio de venta', false, true),
    ('products', 'standard_price', 'float', 'Costo', false, true),
    
    ('customers', 'name', 'char', 'Nombre del cliente', true, true),
    ('customers', 'email', 'char', 'Correo electrónico', false, true),
    ('customers', 'phone', 'char', 'Teléfono', false, true)
ON CONFLICT (module, odoo_field_name) 
DO UPDATE SET is_enabled = EXCLUDED.is_enabled;

GRANT EXECUTE ON FUNCTION public.get_odoo_field_mappings(TEXT) TO authenticated;
