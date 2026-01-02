-- 🔗 ODOO INTEGRATION MODULE
-- Description: Configuration and sync management for Odoo ERP integration

-- 1. Odoo Connection Configuration
CREATE TABLE IF NOT EXISTS schema_core.odoo_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT NOT NULL,
    database TEXT NOT NULL,
    username TEXT NOT NULL,
    api_key TEXT NOT NULL, -- Encrypted in production
    is_active BOOLEAN DEFAULT FALSE,
    last_sync TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Odoo Field Mapping Configuration
CREATE TABLE IF NOT EXISTS schema_core.odoo_field_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module TEXT NOT NULL, -- 'sales', 'customers', 'products', 'invoices'
    odoo_field_name TEXT NOT NULL,
    odoo_field_type TEXT NOT NULL, -- 'char', 'integer', 'float', 'many2one', etc.
    local_field_name TEXT,
    is_enabled BOOLEAN DEFAULT FALSE,
    sync_mode TEXT DEFAULT 'read' CHECK (sync_mode IN ('read', 'write', 'read_write')),
    is_required BOOLEAN DEFAULT FALSE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(module, odoo_field_name)
);

-- 3. Sync Log Table
CREATE TABLE IF NOT EXISTS schema_core.odoo_sync_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module TEXT NOT NULL,
    operation TEXT NOT NULL, -- 'import', 'export', 'update'
    status TEXT NOT NULL CHECK (status IN ('success', 'error', 'partial')),
    records_processed INTEGER DEFAULT 0,
    records_failed INTEGER DEFAULT 0,
    error_message TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    triggered_by UUID REFERENCES schema_core.users(id)
);

-- 4. Synced Customers (Partners from Odoo)
CREATE TABLE IF NOT EXISTS schema_core.odoo_customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    odoo_partner_id INTEGER UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    vat TEXT,
    street TEXT,
    city TEXT,
    country TEXT,
    is_company BOOLEAN DEFAULT FALSE,
    raw_data JSONB, -- Store full Odoo response
    last_synced TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Synced Products from Odoo
CREATE TABLE IF NOT EXISTS schema_core.odoo_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    odoo_product_id INTEGER UNIQUE NOT NULL,
    name TEXT NOT NULL,
    default_code TEXT, -- SKU
    list_price DECIMAL(10,2),
    standard_price DECIMAL(10,2),
    type TEXT, -- 'product', 'service', 'consu'
    categ_id INTEGER,
    uom_id INTEGER,
    raw_data JSONB,
    last_synced TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Initialize default field mappings for Sales Orders
INSERT INTO schema_core.odoo_field_mappings (module, odoo_field_name, odoo_field_type, description, is_required) VALUES
    ('sales', 'partner_id', 'many2one', 'Cliente/Partner', true),
    ('sales', 'order_line', 'one2many', 'Líneas de pedido', true),
    ('sales', 'amount_total', 'float', 'Total del pedido', false),
    ('sales', 'state', 'selection', 'Estado del pedido', false),
    ('sales', 'date_order', 'datetime', 'Fecha del pedido', false),
    ('sales', 'user_id', 'many2one', 'Vendedor', false),
    ('sales', 'payment_term_id', 'many2one', 'Términos de pago', false),
    ('sales', 'note', 'text', 'Notas internas', false)
ON CONFLICT (module, odoo_field_name) DO NOTHING;

-- Initialize default field mappings for Customers
INSERT INTO schema_core.odoo_field_mappings (module, odoo_field_name, odoo_field_type, description, is_required, sync_mode) VALUES
    ('customers', 'name', 'char', 'Nombre del cliente', true, 'read'),
    ('customers', 'email', 'char', 'Correo electrónico', false, 'read'),
    ('customers', 'phone', 'char', 'Teléfono', false, 'read'),
    ('customers', 'mobile', 'char', 'Móvil', false, 'read'),
    ('customers', 'vat', 'char', 'NIT/RFC', false, 'read'),
    ('customers', 'street', 'char', 'Dirección', false, 'read'),
    ('customers', 'city', 'char', 'Ciudad', false, 'read'),
    ('customers', 'country_id', 'many2one', 'País', false, 'read'),
    ('customers', 'is_company', 'boolean', 'Es empresa', false, 'read')
ON CONFLICT (module, odoo_field_name) DO NOTHING;

-- Initialize default field mappings for Products
INSERT INTO schema_core.odoo_field_mappings (module, odoo_field_name, odoo_field_type, description, is_required) VALUES
    ('products', 'name', 'char', 'Nombre del producto', true),
    ('products', 'default_code', 'char', 'Código/SKU', false),
    ('products', 'list_price', 'float', 'Precio de venta', false),
    ('products', 'standard_price', 'float', 'Costo', false),
    ('products', 'type', 'selection', 'Tipo de producto', false),
    ('products', 'categ_id', 'many2one', 'Categoría', false),
    ('products', 'uom_id', 'many2one', 'Unidad de medida', false),
    ('products', 'description', 'text', 'Descripción', false)
ON CONFLICT (module, odoo_field_name) DO NOTHING;

-- Initialize default field mappings for Invoices
INSERT INTO schema_core.odoo_field_mappings (module, odoo_field_name, odoo_field_type, description, is_required) VALUES
    ('invoices', 'partner_id', 'many2one', 'Cliente', true),
    ('invoices', 'invoice_line_ids', 'one2many', 'Líneas de factura', true),
    ('invoices', 'amount_total', 'float', 'Total', false),
    ('invoices', 'amount_tax', 'float', 'Impuestos', false),
    ('invoices', 'state', 'selection', 'Estado', false),
    ('invoices', 'invoice_date', 'date', 'Fecha de factura', false),
    ('invoices', 'invoice_date_due', 'date', 'Fecha de vencimiento', false),
    ('invoices', 'payment_state', 'selection', 'Estado de pago', false)
ON CONFLICT (module, odoo_field_name) DO NOTHING;

-- RPC to get field mappings by module
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

-- RPC to update field mapping
CREATE OR REPLACE FUNCTION public.update_odoo_field_mapping(
    p_id UUID,
    p_is_enabled BOOLEAN,
    p_sync_mode TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = schema_core, public
AS $$
DECLARE
    v_role TEXT;
BEGIN
    SELECT role INTO v_role FROM schema_core.users WHERE id = auth.uid();
    
    IF v_role NOT IN ('super_admin', 'lab_admin') THEN
        RAISE EXCEPTION 'No tienes permisos para modificar la configuración de Odoo';
    END IF;

    UPDATE schema_core.odoo_field_mappings
    SET 
        is_enabled = p_is_enabled,
        sync_mode = p_sync_mode,
        updated_at = NOW()
    WHERE id = p_id;
END;
$$;

-- RPC to get sync logs
CREATE OR REPLACE FUNCTION public.get_odoo_sync_logs(p_limit INTEGER DEFAULT 50)
RETURNS TABLE (
    id UUID,
    module TEXT,
    operation TEXT,
    status TEXT,
    records_processed INTEGER,
    records_failed INTEGER,
    error_message TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
) 
LANGUAGE sql 
SECURITY DEFINER
SET search_path = schema_core, public
AS $$
    SELECT id, module, operation, status, records_processed, records_failed,
           error_message, started_at, completed_at
    FROM schema_core.odoo_sync_log
    ORDER BY started_at DESC
    LIMIT p_limit;
$$;

GRANT EXECUTE ON FUNCTION public.get_odoo_field_mappings TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_odoo_field_mapping TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_odoo_sync_logs TO authenticated;
