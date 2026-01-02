-- 🧪 SCHEMA LAB: PRODUCTION & KANBAN
-- Description: Tables for the Dental Lab Workflow

-- 1. SERVICES (Catalog) - Synced from Odoo eventually, but standalone for now
CREATE TABLE schema_lab.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    odoo_id INTEGER UNIQUE, -- Link to Odoo Product
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('fija', 'removible', 'ortodoncia', 'implantes')),
    base_price DECIMAL(10,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ORDERS (Kanban Cards)
CREATE TABLE schema_lab.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL, -- Logical separation (Multitenancy)
    patient_name TEXT NOT NULL,
    doctor_name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('new', 'design', 'milling', 'ceramic', 'qc', 'ready', 'delivered')),
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal', 'high', 'urgent')),
    due_date DATE,
    odoo_sale_order_id INTEGER, -- Link to Odoo SO
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ORDER ITEMS (Specific jobs)
CREATE TABLE schema_lab.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES schema_lab.orders(id) ON DELETE CASCADE,
    service_id UUID REFERENCES schema_lab.services(id),
    tooth_number INTEGER, -- ISO 3950 (e.g., 11, 26)
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. RLS POLICIES
ALTER TABLE schema_lab.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE schema_lab.services ENABLE ROW LEVEL SECURITY;

-- Policy: Lab Staff can see all orders
CREATE POLICY "Lab Internal Read" ON schema_lab.orders
    FOR SELECT TO authenticated
    USING ( (SELECT role FROM schema_core.users WHERE id = auth.uid()) IN ('super_admin', 'lab_admin', 'lab_staff') );

-- Policy: Lab Staff can update status
CREATE POLICY "Lab Internal Update" ON schema_lab.orders
    FOR UPDATE TO authenticated
    USING ( (SELECT role FROM schema_core.users WHERE id = auth.uid()) IN ('super_admin', 'lab_admin', 'lab_staff') );

-- 5. RPC FOR KANBAN (Performance)
CREATE OR REPLACE FUNCTION schema_lab.get_kanban_board()
RETURNS TABLE (
    id UUID,
    patient_name TEXT,
    status TEXT,
    priority TEXT,
    due_date DATE,
    items_count BIGINT
) LANGUAGE sql SECURITY DEFINER AS $$
    SELECT 
        o.id, 
        o.patient_name, 
        o.status, 
        o.priority, 
        o.due_date,
        (SELECT COUNT(*) FROM schema_lab.order_items WHERE order_id = o.id) as items_count
    FROM schema_lab.orders o
    ORDER BY o.due_date ASC;
$$;
