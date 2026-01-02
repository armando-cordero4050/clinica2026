-- Migration: 20251229000000_init_v4_schema.sql
-- Description: Core Schema for DentalFlow V4 (Clinics, Patients, Lab Orders)
-- Author: Antigravity

-- 1. ENUMS (Application Constants)
CREATE TYPE user_role AS ENUM (
    'admin',        -- Master Admin (SuperUser)
    'clinic_admin', -- Admin de Clínica
    'doctor',       -- Odontólogo
    'assistant',    -- Asistente/Secretaria
    'lab_admin',    -- Jefe de Laboratorio
    'lab_tech',     -- Técnico Dental
    'logistica'     -- Encargado de Envíos (Ventura)
);

CREATE TYPE order_status AS ENUM (
    'draft',        -- Borrador (Doctor está editando)
    'submitted',    -- Enviado al Laboratorio
    'received',     -- Lab recibe y revisa
    'in_progress',  -- En producción
    'paused',       -- Detenido (Falta info/Pago)
    'completed',    -- Terminado en Lab
    'paid',         -- Pagado (Listo para envío)
    'shipped',      -- En camino (Ventura)
    'delivered',    -- Recibido en Clínica (Confirmado)
    'cancelled'     -- Cancelado
);

CREATE TYPE priority_level AS ENUM (
    'standard',
    'urgent'
);

-- 2. CLINICS (Tenant Root)
CREATE TABLE clinics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    tax_id TEXT, -- RUC/NIT
    address TEXT,
    phone TEXT,
    email TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. PROFILES (Users linked to Clinics)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    clinic_id UUID REFERENCES clinics(id), -- Null for Master Admin/Lab Staff if global? No, strict multi-tenant usually. Lab can be a "Special Clinic" or NULL if global.
    -- Decision: Lab Staff will belong to the "Main Lab" tenant or have a separate mechanism.
    -- For now, we allow clinic_id to be NULL for Master Admin/Global Lab Staff.
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'doctor',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. PATIENTS (Clinic Scoped)
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    id_number TEXT, -- DNI/Cedula
    email TEXT,
    phone TEXT,
    birth_date DATE,
    address TEXT,
    medical_history JSONB DEFAULT '{}', -- Flexible JSON for legacy/future history
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. LAB SERVICES (Catalog from Odoo)
CREATE TABLE lab_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    odoo_product_id TEXT UNIQUE, -- External ID
    name TEXT NOT NULL,
    category TEXT, -- e.g., "Protesis Fija", "Ortodoncia"
    base_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. LAB ORDERS (The Core Transaction)
CREATE TABLE lab_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id),
    patient_id UUID NOT NULL REFERENCES patients(id),
    doctor_id UUID REFERENCES profiles(id), -- Who requested it
    
    order_number SERIAL, -- User friendly ID (e.g., 1001)
    status order_status NOT NULL DEFAULT 'draft',
    priority priority_level NOT NULL DEFAULT 'standard',
    
    delivery_due_date DATE, -- Requested/Promised date
    
    -- Sync fields
    odoo_sale_order_id TEXT, 

    -- Logistics
    shipping_address TEXT,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. LAB ORDER ITEMS (Lines)
CREATE TABLE lab_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES lab_orders(id) ON DELETE CASCADE,
    service_id UUID REFERENCES lab_services(id),
    
    tooth_number TEXT, -- "18", "21", "All" (Odontogram mapping)
    notes TEXT,
    
    price DECIMAL(10, 2) NOT NULL DEFAULT 0, -- Snapshot price
    
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. INDEXES & TRIGGERS
CREATE INDEX idx_patients_clinic ON patients(clinic_id);
CREATE INDEX idx_lab_orders_clinic ON lab_orders(clinic_id);
CREATE INDEX idx_lab_orders_status ON lab_orders(status);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_clinics_modtime BEFORE UPDATE ON clinics FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_patients_modtime BEFORE UPDATE ON patients FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_lab_orders_modtime BEFORE UPDATE ON lab_orders FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 9. RLS POLICIES (Zero Trust Start)
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_orders ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see their own clinic data
CREATE POLICY "Users can view own clinic" ON clinics
    FOR SELECT USING (id IN (
        SELECT clinic_id FROM profiles WHERE id = auth.uid()
    ));

-- Policy: Patients visible only to clinic staff
CREATE POLICY "Clinic staff view patients" ON patients
    FOR ALL USING (clinic_id IN (
        SELECT clinic_id FROM profiles WHERE id = auth.uid()
    ));

-- Policy: Orders visible to clinic staff AND Lab Admin/Staff (Global Access for Lab needed)
-- NOTE: This simplifies "Lab" to be a Super-Role or specific role check.
-- Assuming 'lab_admin' and 'lab_tech' can see ALL orders for now (simplification for V4 start).
CREATE POLICY "Clinic sees own orders, Lab sees all" ON lab_orders
    FOR ALL USING (
        clinic_id IN (SELECT clinic_id FROM profiles WHERE id = auth.uid())
        OR
        (SELECT role FROM profiles WHERE id = auth.uid()) IN ('lab_admin', 'lab_tech', 'admin', 'logistica')
    );
