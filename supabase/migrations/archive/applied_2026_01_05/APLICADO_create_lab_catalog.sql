-- ============================================================================
-- MIGRATION: Create Lab Catalog Tables (Materials & Configurations)
-- DATE: 2026-01-04
-- FIX: Drop VIEWs before creating TABLEs
-- ============================================================================

-- STEP 1: Cleanup (Drop VIEWs and TABLEs)
-- ============================================================================
DROP VIEW IF EXISTS public.lab_configurations CASCADE;
DROP VIEW IF EXISTS public.lab_materials CASCADE;
DROP TABLE IF EXISTS public.lab_configurations CASCADE;
DROP TABLE IF EXISTS public.lab_materials CASCADE;
DROP TYPE IF EXISTS lab_price_type CASCADE;

-- STEP 2: Create Helper Types
-- ============================================================================
CREATE TYPE lab_price_type AS ENUM ('fixed', 'per_unit');

-- STEP 3: Create Tables
-- ============================================================================

-- Table: lab_materials (Categories: Zirconio, E-MAX, Metal, PMMA)
CREATE TABLE public.lab_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table: lab_configurations (Variants: Monolithic, Stratified, etc.)
CREATE TABLE public.lab_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    material_id UUID NOT NULL REFERENCES public.lab_materials(id) ON DELETE CASCADE,
    
    -- Product Info
    name TEXT NOT NULL,
    code TEXT,
    
    -- Odoo Integration
    odoo_product_id TEXT,
    
    -- Pricing
    base_price NUMERIC(10,2) NOT NULL DEFAULT 0,
    price_type lab_price_type DEFAULT 'per_unit',
    
    -- SLA & Logistics
    sla_days INTEGER NOT NULL DEFAULT 3,
    is_express_allowed BOOLEAN DEFAULT true,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Constraints
    UNIQUE(material_id, name)
);

-- STEP 4: Create Indexes
-- ============================================================================
CREATE INDEX idx_lab_materials_active ON public.lab_materials(is_active);
CREATE INDEX idx_lab_configurations_material ON public.lab_configurations(material_id);
CREATE INDEX idx_lab_configurations_active ON public.lab_configurations(is_active);

-- STEP 5: Enable RLS
-- ============================================================================
ALTER TABLE public.lab_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_configurations ENABLE ROW LEVEL SECURITY;

-- STEP 6: Create RLS Policies
-- ============================================================================

-- Materials: Read Access
CREATE POLICY "lab_materials_read_policy" 
ON public.lab_materials
FOR SELECT 
TO authenticated
USING (is_active = true);

-- Materials: Write Access
CREATE POLICY "lab_materials_write_policy" 
ON public.lab_materials
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- Configurations: Read Access
CREATE POLICY "lab_configurations_read_policy" 
ON public.lab_configurations
FOR SELECT 
TO authenticated
USING (is_active = true);

-- Configurations: Write Access
CREATE POLICY "lab_configurations_write_policy" 
ON public.lab_configurations
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- STEP 7: Seed Initial Data
-- ============================================================================

DO $$
DECLARE
    zirc_id UUID;
    dis_id UUID;
    met_id UUID;
    pmma_id UUID;
BEGIN
    -- ZIRCONIO
    INSERT INTO public.lab_materials (name, description)
    VALUES ('Zirconio', 'Material de alta resistencia y estética para restauraciones dentales')
    RETURNING id INTO zirc_id;

    INSERT INTO public.lab_configurations (material_id, name, base_price, sla_days, code, odoo_product_id) VALUES
    (zirc_id, 'Alemán Estratificado (LD 004)', 890.00, 5, 'LD004', 'SVC-ZIR-EST'),
    (zirc_id, 'Alemán Monolayer (LD 081)', 890.00, 4, 'LD081', 'SVC-ZIR-MON'),
    (zirc_id, 'Alemán CERCON Monolítico (LD 094)', 890.00, 4, 'LD094', 'SVC-ZIR-CER'),
    (zirc_id, 'EconoZir Monolítico (LD 113)', 650.00, 4, 'LD113', 'SVC-ZIR-ECO');

    -- DISILICATO DE LITIO
    INSERT INTO public.lab_materials (name, description)
    VALUES ('Disilicato de Litio', 'Alta estética para sector anterior y premolares')
    RETURNING id INTO dis_id;

    INSERT INTO public.lab_configurations (material_id, name, base_price, sla_days, code, odoo_product_id) VALUES
    (dis_id, 'Litio E-MAX (Inyectado)', 725.00, 5, 'EMAX-INJ', 'SVC-EMAX-INY'),
    (dis_id, 'Disilicato Alemán SUPRINITY', 750.00, 5, 'SUPRI', 'SVC-SUPRI');

    -- METAL PORCELANA
    INSERT INTO public.lab_materials (name, description)
    VALUES ('Metal Porcelana', 'Restauraciones clásicas sobre implantes y dientes naturales')
    RETURNING id INTO met_id;

    INSERT INTO public.lab_configurations (material_id, name, base_price, sla_days, code, odoo_product_id) VALUES
    (met_id, 'Sobre Implante', 450.00, 7, 'PFM-IMP', 'SVC-PFM-IMP');

    -- PMMA
    INSERT INTO public.lab_materials (name, description)
    VALUES ('PMMA', 'Provisionales de larga duración con alta resistencia')
    RETURNING id INTO pmma_id;

    INSERT INTO public.lab_configurations (material_id, name, base_price, sla_days, code, odoo_product_id) VALUES
    (pmma_id, 'PMMA Estándar (LD 054)', 275.00, 2, 'LD054', 'SVC-PMMA-STD'),
    (pmma_id, 'PMMA Multilayer (LD 104)', 350.00, 2, 'LD104', 'SVC-PMMA-MULTI');

END $$;
