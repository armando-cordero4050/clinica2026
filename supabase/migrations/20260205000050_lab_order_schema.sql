-- Migration: 20260205000050_lab_order_schema.sql
-- Description: Creates tables for Lab Orders and the Material Catalog in 'schema_lab'.
-- Exposes Views in 'public'.
-- Includes RLS policies and Seed Data.

-- Ensure update_updated_at_column function exists (Public utility)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ==============================================================================
-- 1. MATERIAL CATALOG (Schema: schema_lab)
-- ==============================================================================

-- 1.1 Lab Materials
CREATE TABLE IF NOT EXISTS schema_lab.lab_materials (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    slug text NOT NULL UNIQUE,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);
ALTER TABLE schema_lab.lab_materials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read lab_materials" ON schema_lab.lab_materials FOR SELECT TO authenticated USING (true);

-- 1.2 Lab Material Types
CREATE TABLE IF NOT EXISTS schema_lab.lab_material_types (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    material_id uuid REFERENCES schema_lab.lab_materials(id) ON DELETE CASCADE,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    UNIQUE(material_id, slug)
);
ALTER TABLE schema_lab.lab_material_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read lab_material_types" ON schema_lab.lab_material_types FOR SELECT TO authenticated USING (true);

-- 1.3 Lab Configurations
CREATE TABLE IF NOT EXISTS schema_lab.lab_configurations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    type_id uuid REFERENCES schema_lab.lab_material_types(id) ON DELETE CASCADE,
    name text NOT NULL,
    slug text NOT NULL,
    category text CHECK (category IN ('fixed', 'removable', 'orthodontics', 'cosmetic', 'restoration')),
    requires_units boolean DEFAULT false,
    base_price numeric(10, 2) DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    UNIQUE(type_id, slug)
);
ALTER TABLE schema_lab.lab_configurations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read lab_configurations" ON schema_lab.lab_configurations FOR SELECT TO authenticated USING (true);


-- ==============================================================================
-- 2. LAB ORDERS (Schema: schema_lab)
-- ==============================================================================

-- 2.1 Lab Orders Header
CREATE TABLE IF NOT EXISTS schema_lab.lab_orders (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    -- FKs must point to REAL tables in schema_medical/core, NOT public views
    clinic_id uuid REFERENCES schema_medical.clinics(id) ON DELETE RESTRICT NOT NULL,
    patient_id uuid REFERENCES schema_medical.patients(id) ON DELETE RESTRICT NOT NULL,
    doctor_id uuid REFERENCES schema_core.users(id), 
    
    status text DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'received', 'in_process', 'quality_check', 'ready', 'delivered', 'cancelled')),
    priority text DEFAULT 'normal' CHECK (priority IN ('normal', 'urgent')),
    
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    target_delivery_date timestamptz,
    actual_delivery_date timestamptz,
    
    notes text,
    order_number serial
);

CREATE TRIGGER update_lab_orders_modtime
    BEFORE UPDATE ON schema_lab.lab_orders
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE schema_lab.lab_orders ENABLE ROW LEVEL SECURITY;

-- RLS: Clinic Staff Access
CREATE POLICY "Clinic staff view own orders" ON schema_lab.lab_orders FOR SELECT TO authenticated
    USING (clinic_id IN (SELECT clinic_id FROM schema_medical.clinic_staff WHERE user_id = auth.uid()));

CREATE POLICY "Clinic staff insert own orders" ON schema_lab.lab_orders FOR INSERT TO authenticated
    WITH CHECK (clinic_id IN (SELECT clinic_id FROM schema_medical.clinic_staff WHERE user_id = auth.uid()));

CREATE POLICY "Clinic staff update own orders" ON schema_lab.lab_orders FOR UPDATE TO authenticated
    USING (clinic_id IN (SELECT clinic_id FROM schema_medical.clinic_staff WHERE user_id = auth.uid()));

-- 2.2 Lab Order Items
CREATE TABLE IF NOT EXISTS schema_lab.lab_order_items (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id uuid REFERENCES schema_lab.lab_orders(id) ON DELETE CASCADE,
    configuration_id uuid REFERENCES schema_lab.lab_configurations(id),
    
    tooth_number integer,
    color text,
    unit_price numeric(10, 2) NOT NULL DEFAULT 0,
    
    created_at timestamptz DEFAULT now()
);

ALTER TABLE schema_lab.lab_order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinic staff view items" ON schema_lab.lab_order_items FOR SELECT TO authenticated
    USING (order_id IN (SELECT id FROM schema_lab.lab_orders));

CREATE POLICY "Clinic staff insert items" ON schema_lab.lab_order_items FOR INSERT TO authenticated
    WITH CHECK (order_id IN (SELECT id FROM schema_lab.lab_orders));


-- ==============================================================================
-- 3. PUBLIC VIEWS (For Frontend Access)
-- ==============================================================================

-- Views for Catalog
CREATE OR REPLACE VIEW public.lab_materials AS SELECT * FROM schema_lab.lab_materials;
CREATE OR REPLACE VIEW public.lab_material_types AS SELECT * FROM schema_lab.lab_material_types;
CREATE OR REPLACE VIEW public.lab_configurations AS SELECT * FROM schema_lab.lab_configurations;

-- Views for Orders
CREATE OR REPLACE VIEW public.lab_orders AS SELECT * FROM schema_lab.lab_orders;
CREATE OR REPLACE VIEW public.lab_order_items AS SELECT * FROM schema_lab.lab_order_items;

-- Permissions on Views
GRANT SELECT ON public.lab_materials TO authenticated;
GRANT SELECT ON public.lab_material_types TO authenticated;
GRANT SELECT ON public.lab_configurations TO authenticated;

GRANT SELECT, INSERT, UPDATE ON public.lab_orders TO authenticated;
GRANT SELECT, INSERT ON public.lab_order_items TO authenticated;

-- ==============================================================================
-- 4. SEED DATA (Populate Catalog in schema_lab)
-- ==============================================================================
DO $$
DECLARE
    v_mat_id uuid;
    v_type_id uuid;
BEGIN
    -- Check if data exists to avoid duplicates
    IF NOT EXISTS (SELECT 1 FROM schema_lab.lab_materials WHERE slug = 'zirconio') THEN
        
        -- 1. Zirconio
        INSERT INTO schema_lab.lab_materials (name, slug) VALUES ('Zirconio', 'zirconio') RETURNING id INTO v_mat_id;
            -- Monolitico
            INSERT INTO schema_lab.lab_material_types (material_id, name, slug) VALUES (v_mat_id, 'Monolítico', 'monolitico') RETURNING id INTO v_type_id;
                INSERT INTO schema_lab.lab_configurations (type_id, name, slug, category, requires_units) VALUES 
                (v_type_id, 'Corona', 'corona', 'fixed', false),
                (v_type_id, 'Puente', 'puente', 'fixed', true),
                (v_type_id, 'Carilla', 'carilla', 'cosmetic', false),
                (v_type_id, 'Inlay/Onlay', 'inlay_onlay', 'restoration', false);
            -- Estratificado
            INSERT INTO schema_lab.lab_material_types (material_id, name, slug) VALUES (v_mat_id, 'Estratificado', 'estratificado') RETURNING id INTO v_type_id;
                INSERT INTO schema_lab.lab_configurations (type_id, name, slug, category, requires_units) VALUES 
                (v_type_id, 'Corona', 'corona', 'fixed', false),
                (v_type_id, 'Puente', 'puente', 'fixed', true);

        -- 2. Disilicato de Litio
        INSERT INTO schema_lab.lab_materials (name, slug) VALUES ('Disilicato de Litio', 'disilicato') RETURNING id INTO v_mat_id;
            -- E-max CAD
            INSERT INTO schema_lab.lab_material_types (material_id, name, slug) VALUES (v_mat_id, 'E-max CAD', 'emax_cad') RETURNING id INTO v_type_id;
                INSERT INTO schema_lab.lab_configurations (type_id, name, slug, category, requires_units) VALUES 
                (v_type_id, 'Corona', 'corona', 'fixed', false),
                (v_type_id, 'Carilla', 'carilla', 'cosmetic', false),
                (v_type_id, 'Incrustación', 'incrustacion', 'restoration', false);
            -- E-max Press
            INSERT INTO schema_lab.lab_material_types (material_id, name, slug) VALUES (v_mat_id, 'E-max Press', 'emax_press') RETURNING id INTO v_type_id;
                INSERT INTO schema_lab.lab_configurations (type_id, name, slug, category, requires_units) VALUES 
                (v_type_id, 'Corona', 'corona', 'fixed', false),
                (v_type_id, 'Carilla', 'carilla', 'cosmetic', false);

        -- 3. Metal Porcelana
        INSERT INTO schema_lab.lab_materials (name, slug) VALUES ('Metal Porcelana', 'metal_porcelana') RETURNING id INTO v_mat_id;
            -- Standard
            INSERT INTO schema_lab.lab_material_types (material_id, name, slug) VALUES (v_mat_id, 'Estándar', 'standard') RETURNING id INTO v_type_id;
                INSERT INTO schema_lab.lab_configurations (type_id, name, slug, category, requires_units) VALUES 
                (v_type_id, 'Corona', 'corona', 'fixed', false),
                (v_type_id, 'Puente', 'puente', 'fixed', true);

        -- 4. PMMA
        INSERT INTO schema_lab.lab_materials (name, slug) VALUES ('PMMA', 'pmma') RETURNING id INTO v_mat_id;
            -- Provisional
            INSERT INTO schema_lab.lab_material_types (material_id, name, slug) VALUES (v_mat_id, 'Provisional', 'provisional') RETURNING id INTO v_type_id;
                INSERT INTO schema_lab.lab_configurations (type_id, name, slug, category, requires_units) VALUES 
                (v_type_id, 'Corona', 'corona', 'fixed', false),
                (v_type_id, 'Puente', 'puente', 'fixed', true);

    END IF;
END $$;
