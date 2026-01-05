-- Create tables for Lab Catalog (Materials and Configurations)
-- MINIMAL VIABLE SCHEMA TEST

-- 0. CLEANUP
DROP TABLE IF EXISTS public.lab_configurations CASCADE;
DROP TABLE IF EXISTS public.lab_materials CASCADE;

-- 1. Helper Types
DO $$ BEGIN
    CREATE TYPE lab_price_type AS ENUM ('fixed', 'per_unit');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. LAB MATERIALS
CREATE TABLE public.lab_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. LAB CONFIGURATIONS
CREATE TABLE public.lab_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    material_id UUID NOT NULL REFERENCES public.lab_materials(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT,
    odoo_product_id TEXT, 
    base_price NUMERIC(10,2) NOT NULL DEFAULT 0,
    price_type lab_price_type DEFAULT 'per_unit',
    sla_days INTEGER NOT NULL DEFAULT 3, 
    is_express_allowed BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. SEED DATA (Initial Catalog from Imfohsalab)
-- Zirconio
DO $$
DECLARE
    zirc_id UUID;
    dis_id UUID;
    met_id UUID;
    pmma_id UUID;
BEGIN
    -- Insert Zirconio Category
    INSERT INTO public.lab_materials (name, description)
    VALUES ('Zirconio', 'Material de alta resistencia y estética')
    RETURNING id INTO zirc_id;

    -- Insert Zirconio Variants
    INSERT INTO public.lab_configurations (material_id, name, base_price, sla_days, odoo_product_id) VALUES
    (zirc_id, 'Alemán Estratificado (LD 004)', 890.00, 5, 'SVC-ZIR-EST'),
    (zirc_id, 'Alemán Monolayer (LD 081)', 890.00, 4, 'SVC-ZIR-MON'),
    (zirc_id, 'Alemán CERCON Monolítico (LD 094)', 890.00, 4, 'SVC-ZIR-CER'),
    (zirc_id, 'EconoZir Monolítico (LD 113)', 650.00, 4, 'SVC-ZIR-ECO');

    -- Insert Disilicato Category
    INSERT INTO public.lab_materials (name, description)
    VALUES ('Disilicato de Litio', 'Alta estética para sector anterior')
    RETURNING id INTO dis_id;

    -- Insert Disilicato Variants
    INSERT INTO public.lab_configurations (material_id, name, base_price, sla_days, odoo_product_id) VALUES
    (dis_id, 'Litio E-MAX (Inyectado)', 725.00, 5, 'SVC-EMAX-INY'),
    (dis_id, 'Disilicato Alemán SUPRINITY', 750.00, 5, 'SVC-SUPRI');

    -- Insert Metal Category
    INSERT INTO public.lab_materials (name, description)
    VALUES ('Metal Porcelana', 'Clásico sobre implantes')
    RETURNING id INTO met_id;

    -- Insert Metal Variants
    INSERT INTO public.lab_configurations (material_id, name, base_price, sla_days, odoo_product_id) VALUES
    (met_id, 'Sobre Implante', 450.00, 7, 'SVC-PFM-IMP');

    -- Insert PMMA Category
    INSERT INTO public.lab_materials (name, description)
    VALUES ('PMMA', 'Provisionales de larga duración')
    RETURNING id INTO pmma_id;

    -- Insert PMMA Variants
    INSERT INTO public.lab_configurations (material_id, name, base_price, sla_days, odoo_product_id) VALUES
    (pmma_id, 'PMMA (LD 054)', 275.00, 2, 'SVC-PMMA-STD'),
    (pmma_id, 'PMMA Multilayer (LD 104)', 350.00, 2, 'SVC-PMMA-MULTI');

END $$;
