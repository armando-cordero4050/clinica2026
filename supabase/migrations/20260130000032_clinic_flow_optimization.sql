-- =====================================================
-- SPRINT 2: LOGICA CLINICA HIBRIDA (SQL + JSON)
-- Autor: Antigravity
-- =====================================================

-- 1. AGENDA / CITAS (Full SQL para busquedas rapidas)
CREATE TABLE IF NOT EXISTS schema_medical.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES schema_medical.clinics(id),
    patient_id UUID REFERENCES schema_medical.patients(id), -- Puede ser NULL si es un bloqueo de agenda
    doctor_id UUID REFERENCES schema_core.users(id),
    
    title TEXT, -- "Cita con Juan", "Bloqueo por almuerzo"
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'cancelled', 'completed', 'no_show')),
    type TEXT DEFAULT 'consultation' CHECK (type IN ('consultation', 'treatment', 'emergency', 'block')),
    
    -- Datos adicionales en JSON para no rigidizar la estructura
    details JSONB DEFAULT '{}'::JSONB, -- { "reason": "Dolor", "color": "blue", "is_new_patient": true }
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES schema_core.users(id)
);

-- Indices para busqueda rapida en calendario
CREATE INDEX IF NOT EXISTS idx_appointments_clinic_date ON schema_medical.appointments(clinic_id, start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_date ON schema_medical.appointments(doctor_id, start_time);
ALTER TABLE schema_medical.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY appointments_clinic_isolation ON schema_medical.appointments
    FOR ALL USING (clinic_id IN (SELECT clinic_id FROM schema_medical.clinic_staff WHERE user_id = auth.uid()));


-- 2. PRESUPUESTOS (Hibrido: Cabecera SQL, Items JSON)
CREATE TABLE IF NOT EXISTS schema_medical.budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES schema_medical.clinics(id),
    patient_id UUID NOT NULL REFERENCES schema_medical.patients(id),
    
    code SERIAL, -- Secuencial simple por ahora 1, 2, 3...
    total DECIMAL(10,2) DEFAULT 0,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected')),
    
    -- EL JSON MAGICO: Aqui va todo el detalle de tratamientos
    -- Estructura: [ { "service_id": "...", "name": "Corona", "price": 500, "tooth": 18, "discount": 0 }, ... ]
    items JSONB DEFAULT '[]'::JSONB, 
    
    expiration_date DATE,
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES schema_core.users(id)
);

CREATE INDEX IF NOT EXISTS idx_budgets_patient ON schema_medical.budgets(patient_id);
ALTER TABLE schema_medical.budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY budgets_clinic_isolation ON schema_medical.budgets
    FOR ALL USING (clinic_id IN (SELECT clinic_id FROM schema_medical.clinic_staff WHERE user_id = auth.uid()));


-- 3. EXTENDER ORDENES PARA LOGISTICA (JSON)
-- Agregamos delivery_info a la tabla existente de Laboratorio
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'schema_lab' AND table_name = 'orders' AND column_name = 'delivery_info') THEN
        ALTER TABLE schema_lab.orders ADD COLUMN delivery_info JSONB DEFAULT '{}'::JSONB; 
        -- Estructura: { "type": "pickup"|"digital", "courier": "Guatex", "tracking": "123", "address": "..." }
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'schema_lab' AND table_name = 'orders' AND column_name = 'is_digital') THEN
        ALTER TABLE schema_lab.orders ADD COLUMN is_digital BOOLEAN DEFAULT FALSE;
    END IF;
END $$;


-- 4. SLA EN SERVICIOS (SQL Simple)
-- Para poder calcular la fecha de entrega prometida
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'schema_lab' AND table_name = 'services' AND column_name = 'sla_days') THEN
        ALTER TABLE schema_lab.services ADD COLUMN sla_days INTEGER DEFAULT 3; -- Default 3 dias
    END IF;
END $$;


-- 5. VISTAS PUBLICAS (Actualizacion para ver las nuevas tablas)
CREATE OR REPLACE VIEW public.appointments AS SELECT * FROM schema_medical.appointments;
CREATE OR REPLACE VIEW public.budgets AS SELECT * FROM schema_medical.budgets;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.appointments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.budgets TO authenticated;

