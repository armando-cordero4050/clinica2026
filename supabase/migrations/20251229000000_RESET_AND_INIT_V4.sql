-- Migration: 20251229000000_RESET_AND_INIT_V4.sql
-- Description: FULL RESET for V4 (Drops existing tables/types) + Init Schema
-- WARNING: This deletes data. Only run on Dev/Staging.

-- A. DROP EXISTING OBJECTS (CLEAN SLATE)
DROP TRIGGER IF EXISTS update_lab_orders_modtime ON lab_orders;
DROP TRIGGER IF EXISTS update_patients_modtime ON patients;
DROP TRIGGER IF EXISTS update_profiles_modtime ON profiles;
DROP TRIGGER IF EXISTS update_clinics_modtime ON clinics;

DROP TABLE IF EXISTS lab_order_items CASCADE;
DROP TABLE IF EXISTS lab_orders CASCADE;
DROP TABLE IF EXISTS lab_services CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS clinics CASCADE;

-- Drop old types if they exist
DROP TYPE IF EXISTS priority_level CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- B. INIT V4 SCHEMA (SAME AS BEFORE)

-- 1. ENUMS
CREATE TYPE user_role AS ENUM (
    'admin', 'clinic_admin', 'doctor', 'assistant', 'lab_admin', 'lab_tech', 'logistica'
);

CREATE TYPE order_status AS ENUM (
    'draft', 'submitted', 'received', 'in_progress', 'paused', 'completed', 'paid', 'shipped', 'delivered', 'cancelled'
);

CREATE TYPE priority_level AS ENUM (
    'standard', 'urgent'
);

-- 2. CLINICS
CREATE TABLE clinics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    tax_id TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. PROFILES
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    clinic_id UUID REFERENCES clinics(id),
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'doctor',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. PATIENTS
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    id_number TEXT,
    email TEXT,
    phone TEXT,
    birth_date DATE,
    address TEXT,
    medical_history JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. LAB SERVICES
CREATE TABLE lab_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    odoo_product_id TEXT UNIQUE,
    name TEXT NOT NULL,
    category TEXT,
    base_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. LAB ORDERS
CREATE TABLE lab_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id),
    patient_id UUID NOT NULL REFERENCES patients(id),
    doctor_id UUID REFERENCES profiles(id),
    
    order_number SERIAL,
    status order_status NOT NULL DEFAULT 'draft',
    priority priority_level NOT NULL DEFAULT 'standard',
    
    delivery_due_date DATE,
    
    odoo_sale_order_id TEXT, 
    shipping_address TEXT,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. LAB ORDER ITEMS
CREATE TABLE lab_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES lab_orders(id) ON DELETE CASCADE,
    service_id UUID REFERENCES lab_services(id),
    tooth_number TEXT,
    notes TEXT,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. INDEXES & TRIGGERS
CREATE INDEX idx_patients_clinic ON patients(clinic_id);
CREATE INDEX idx_lab_orders_clinic ON lab_orders(clinic_id);
CREATE INDEX idx_lab_orders_status ON lab_orders(status);

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

-- 9. RLS POLICIES
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own clinic" ON clinics
    FOR SELECT USING (id IN (SELECT clinic_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Clinic staff view patients" ON patients
    FOR ALL USING (clinic_id IN (SELECT clinic_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Clinic sees own orders, Lab sees all" ON lab_orders
    FOR ALL USING (
        clinic_id IN (SELECT clinic_id FROM profiles WHERE id = auth.uid())
        OR
        (SELECT role FROM profiles WHERE id = auth.uid()) IN ('lab_admin', 'lab_tech', 'admin', 'logistica')
    );
