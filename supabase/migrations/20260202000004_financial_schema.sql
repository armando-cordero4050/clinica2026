-- 20260202000004_financial_schema.sql
-- Description: Financial management tables (Budgets, Payments)

-- 1. BUDGETS
CREATE TABLE IF NOT EXISTS schema_medical.budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES schema_medical.clinics(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES schema_medical.patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES schema_core.users(id), -- Who created/prescribed it
    
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired')),
    total_amount DECIMAL(10,2) DEFAULT 0,
    valid_until DATE,
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. BUDGET ITEMS
CREATE TABLE IF NOT EXISTS schema_medical.budget_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    budget_id UUID NOT NULL REFERENCES schema_medical.budgets(id) ON DELETE CASCADE,
    
    service_id UUID REFERENCES schema_lab.services(id), -- Optional: Link to catalog
    description TEXT NOT NULL,
    
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    discount DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) GENERATED ALWAYS AS ((quantity * unit_price) - discount) STORED,
    
    tooth_number INTEGER, -- Optional
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PAYMENTS
CREATE TABLE IF NOT EXISTS schema_medical.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES schema_medical.clinics(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES schema_medical.patients(id) ON DELETE CASCADE,
    budget_id UUID REFERENCES schema_medical.budgets(id) ON DELETE SET NULL, -- Optional linking
    
    amount DECIMAL(10,2) NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'card', 'transfer', 'insurance', 'other')),
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    reference_number TEXT,
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE schema_medical.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE schema_medical.budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE schema_medical.payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Clinic Isolation)

-- BUDGETS
CREATE POLICY "Clinic Isolation Budgets" ON schema_medical.budgets
    USING (clinic_id IN (SELECT clinic_id FROM schema_medical.clinic_staff WHERE user_id = auth.uid()));

CREATE POLICY "Clinic Insert Budgets" ON schema_medical.budgets
    FOR INSERT WITH CHECK (clinic_id IN (SELECT clinic_id FROM schema_medical.clinic_staff WHERE user_id = auth.uid()));

CREATE POLICY "Clinic Update Budgets" ON schema_medical.budgets
    FOR UPDATE USING (clinic_id IN (SELECT clinic_id FROM schema_medical.clinic_staff WHERE user_id = auth.uid()));

CREATE POLICY "Clinic Delete Budgets" ON schema_medical.budgets
    FOR DELETE USING (clinic_id IN (SELECT clinic_id FROM schema_medical.clinic_staff WHERE user_id = auth.uid()));

-- BUDGET ITEMS (Inherit access from budget via RLS is complex, better to double check or use explicit joins. 
-- For simplicity in V1, we trust that if you can access the Budget, you can access Items.
-- But standard pattern is check parent ownership or just rely on UUID unguessability + API level checks.
-- Let's implement direct check for safety.)

CREATE POLICY "Clinic Isolation Budget Items" ON schema_medical.budget_items
    USING (budget_id IN (SELECT id FROM schema_medical.budgets WHERE clinic_id IN (SELECT clinic_id FROM schema_medical.clinic_staff WHERE user_id = auth.uid())));

CREATE POLICY "Clinic Insert Budget Items" ON schema_medical.budget_items
    FOR INSERT WITH CHECK (budget_id IN (SELECT id FROM schema_medical.budgets WHERE clinic_id IN (SELECT clinic_id FROM schema_medical.clinic_staff WHERE user_id = auth.uid())));

CREATE POLICY "Clinic Update Budget Items" ON schema_medical.budget_items
    FOR UPDATE USING (budget_id IN (SELECT id FROM schema_medical.budgets WHERE clinic_id IN (SELECT clinic_id FROM schema_medical.clinic_staff WHERE user_id = auth.uid())));

CREATE POLICY "Clinic Delete Budget Items" ON schema_medical.budget_items
    FOR DELETE USING (budget_id IN (SELECT id FROM schema_medical.budgets WHERE clinic_id IN (SELECT clinic_id FROM schema_medical.clinic_staff WHERE user_id = auth.uid())));

-- PAYMENTS
CREATE POLICY "Clinic Isolation Payments" ON schema_medical.payments
    USING (clinic_id IN (SELECT clinic_id FROM schema_medical.clinic_staff WHERE user_id = auth.uid()));

CREATE POLICY "Clinic Insert Payments" ON schema_medical.payments
    FOR INSERT WITH CHECK (clinic_id IN (SELECT clinic_id FROM schema_medical.clinic_staff WHERE user_id = auth.uid()));

CREATE POLICY "Clinic Update Payments" ON schema_medical.payments
    FOR UPDATE USING (clinic_id IN (SELECT clinic_id FROM schema_medical.clinic_staff WHERE user_id = auth.uid()));

CREATE POLICY "Clinic Delete Payments" ON schema_medical.payments
    FOR DELETE USING (clinic_id IN (SELECT clinic_id FROM schema_medical.clinic_staff WHERE user_id = auth.uid()));
