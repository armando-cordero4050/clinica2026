# Esquema del Módulo Médico/Clínica Dental

## Arquitectura General

**Esquema:** `schema_medical`  
**Multi-tenancy:** OBLIGATORIO - Todas las tablas llevan `clinic_id`  
**RLS:** Activado en todas las tablas  
**Privacidad:** El laboratorio NUNCA ve datos personales de pacientes

---

## 1. GESTIÓN DE PACIENTES

### Tabla: `schema_medical.patients`

```sql
CREATE TABLE schema_medical.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES schema_medical.clinics(id),
  
  -- Información Personal
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  mobile TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  
  -- Dirección
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  zip_code TEXT,
  
  -- Información Médica
  blood_type TEXT,
  allergies TEXT[], -- Array de alergias
  chronic_conditions TEXT[], -- Array de condiciones crónicas
  current_medications TEXT[], -- Array de medicamentos actuales
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  
  -- Información Administrativa
  patient_code TEXT UNIQUE, -- Código interno de la clínica
  insurance_provider TEXT,
  insurance_policy_number TEXT,
  
  -- Integración Odoo
  odoo_partner_id INTEGER UNIQUE,
  odoo_raw_data JSONB,
  last_synced_to_odoo TIMESTAMPTZ,
  
  -- Metadata
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES schema_core.users(id),
  
  -- Constraints
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Índices
CREATE INDEX idx_patients_clinic ON schema_medical.patients(clinic_id);
CREATE INDEX idx_patients_odoo ON schema_medical.patients(odoo_partner_id);
CREATE INDEX idx_patients_code ON schema_medical.patients(patient_code);
CREATE INDEX idx_patients_search ON schema_medical.patients USING gin(
  to_tsvector('spanish', first_name || ' ' || last_name || ' ' || COALESCE(patient_code, ''))
);

-- RLS
ALTER TABLE schema_medical.patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY patients_clinic_isolation ON schema_medical.patients
  FOR ALL USING (
    clinic_id IN (
      SELECT clinic_id FROM schema_medical.clinic_staff WHERE user_id = auth.uid()
    )
  );
```

---

## 2. ODONTOGRAMA INTERACTIVO

### Tabla: `schema_medical.odontogram_records`

```sql
CREATE TABLE schema_medical.odontogram_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES schema_medical.clinics(id),
  patient_id UUID NOT NULL REFERENCES schema_medical.patients(id) ON DELETE CASCADE,
  
  -- Diente (Numeración FDI)
  tooth_number INTEGER NOT NULL CHECK (tooth_number BETWEEN 11 AND 85),
  
  -- Superficie del diente
  surface TEXT CHECK (surface IN ('mesial', 'distal', 'oclusal', 'vestibular', 'lingual', 'full')),
  
  -- Estado/Condición
  condition_type TEXT NOT NULL CHECK (condition_type IN (
    'healthy', 'caries', 'filling', 'crown', 'endodontics', 
    'extraction', 'implant', 'missing', 'fracture', 'other'
  )),
  
  -- Detalles
  material TEXT, -- Material usado (amalgama, resina, etc.)
  color TEXT, -- Color del material
  diagnosis TEXT,
  treatment_notes TEXT,
  
  -- Fecha del registro
  record_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Relación con tratamiento
  treatment_id UUID REFERENCES schema_medical.treatments(id),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES schema_core.users(id)
);

-- Índices
CREATE INDEX idx_odontogram_patient ON schema_medical.odontogram_records(patient_id);
CREATE INDEX idx_odontogram_clinic ON schema_medical.odontogram_records(clinic_id);
CREATE INDEX idx_odontogram_tooth ON schema_medical.odontogram_records(tooth_number);

-- RLS
ALTER TABLE schema_medical.odontogram_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY odontogram_clinic_isolation ON schema_medical.odontogram_records
  FOR ALL USING (
    clinic_id IN (
      SELECT clinic_id FROM schema_medical.clinic_staff WHERE user_id = auth.uid()
    )
  );
```

---

## 3. HISTORIAL DE TRATAMIENTOS

### Tabla: `schema_medical.treatments`

```sql
CREATE TABLE schema_medical.treatments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES schema_medical.clinics(id),
  patient_id UUID NOT NULL REFERENCES schema_medical.patients(id) ON DELETE CASCADE,
  
  -- Información del Tratamiento
  treatment_code TEXT, -- Código interno del tratamiento
  treatment_name TEXT NOT NULL,
  description TEXT,
  diagnosis TEXT,
  
  -- Clasificación
  category TEXT CHECK (category IN (
    'preventive', 'restorative', 'endodontic', 'periodontic', 
    'orthodontic', 'surgical', 'prosthetic', 'cosmetic', 'other'
  )),
  
  -- Fechas
  planned_date DATE,
  start_date DATE,
  completion_date DATE,
  
  -- Estado
  status TEXT DEFAULT 'planned' CHECK (status IN (
    'planned', 'in_progress', 'completed', 'cancelled', 'pending_payment'
  )),
  
  -- Personal Médico
  doctor_id UUID REFERENCES schema_core.users(id),
  assistant_id UUID REFERENCES schema_core.users(id),
  
  -- Financiero
  estimated_cost DECIMAL(10,2),
  actual_cost DECIMAL(10,2),
  paid_amount DECIMAL(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  
  -- Relación con cotización y orden
  budget_id UUID REFERENCES schema_medical.budgets(id),
  lab_order_id UUID REFERENCES schema_lab.orders(id),
  
  -- Notas
  clinical_notes TEXT,
  patient_feedback TEXT,
  complications TEXT,
  
  -- Archivos adjuntos
  attachments JSONB, -- URLs de imágenes, radiografías, etc.
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES schema_core.users(id)
);

-- Índices
CREATE INDEX idx_treatments_patient ON schema_medical.treatments(patient_id);
CREATE INDEX idx_treatments_clinic ON schema_medical.treatments(clinic_id);
CREATE INDEX idx_treatments_doctor ON schema_medical.treatments(doctor_id);
CREATE INDEX idx_treatments_status ON schema_medical.treatments(status);
CREATE INDEX idx_treatments_date ON schema_medical.treatments(start_date);

-- RLS
ALTER TABLE schema_medical.treatments ENABLE ROW LEVEL SECURITY;

CREATE POLICY treatments_clinic_isolation ON schema_medical.treatments
  FOR ALL USING (
    clinic_id IN (
      SELECT clinic_id FROM schema_medical.clinic_staff WHERE user_id = auth.uid()
    )
  );
```

---

## 4. PRESUPUESTOS/COTIZACIONES

### Tabla: `schema_medical.budgets`

```sql
CREATE TABLE schema_medical.budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES schema_medical.clinics(id),
  patient_id UUID NOT NULL REFERENCES schema_medical.patients(id) ON DELETE CASCADE,
  
  -- Información del Presupuesto
  budget_number TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  
  -- Fechas
  issue_date DATE DEFAULT CURRENT_DATE,
  valid_until DATE,
  
  -- Estado
  status TEXT DEFAULT 'draft' CHECK (status IN (
    'draft', 'sent', 'approved', 'rejected', 'expired', 'converted'
  )),
  
  -- Totales (calculados desde items)
  subtotal DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  
  -- Personal
  created_by_doctor UUID REFERENCES schema_core.users(id),
  approved_by_patient BOOLEAN DEFAULT FALSE,
  approval_date TIMESTAMPTZ,
  
  -- Notas
  notes TEXT,
  terms_and_conditions TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Items del Presupuesto
CREATE TABLE schema_medical.budget_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id UUID NOT NULL REFERENCES schema_medical.budgets(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES schema_medical.clinics(id),
  
  -- Información del Item
  treatment_code TEXT,
  treatment_name TEXT NOT NULL,
  description TEXT,
  
  -- Diente afectado (opcional)
  tooth_number INTEGER CHECK (tooth_number BETWEEN 11 AND 85),
  
  -- Precio
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  discount_percentage DECIMAL(5,2) DEFAULT 0,
  
  -- Calculados
  subtotal DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  tax_amount DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price * tax_rate / 100) STORED,
  discount_amount DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price * discount_percentage / 100) STORED,
  total DECIMAL(10,2) GENERATED ALWAYS AS (
    quantity * unit_price + (quantity * unit_price * tax_rate / 100) - (quantity * unit_price * discount_percentage / 100)
  ) STORED,
  
  -- Metadata
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_budgets_clinic ON schema_medical.budgets(clinic_id);
CREATE INDEX idx_budgets_patient ON schema_medical.budgets(patient_id);
CREATE INDEX idx_budgets_status ON schema_medical.budgets(status);
CREATE INDEX idx_budget_items_budget ON schema_medical.budget_items(budget_id);

-- RLS
ALTER TABLE schema_medical.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE schema_medical.budget_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY budgets_clinic_isolation ON schema_medical.budgets
  FOR ALL USING (
    clinic_id IN (
      SELECT clinic_id FROM schema_medical.clinic_staff WHERE user_id = auth.uid()
    )
  );

CREATE POLICY budget_items_clinic_isolation ON schema_medical.budget_items
  FOR ALL USING (
    clinic_id IN (
      SELECT clinic_id FROM schema_medical.clinic_staff WHERE user_id = auth.uid()
    )
  );
```

---

## 5. ÓRDENES DE LABORATORIO (Integración con Odoo)

**IMPORTANTE:** Esta tabla ya existe en `schema_lab.orders` pero la extendemos para uso médico.

### Extensión de la tabla existente:

```sql
-- Las órdenes se crean desde la clínica
-- Campos importantes:
-- - clinic_id: Clínica que hace el pedido
-- - patient_id: Solo código/referencia, NO nombre ni datos personales
-- - doctor_name: Nombre del doctor que solicita
-- - product_id: Servicio de laboratorio (de schema_lab.services)
-- - odoo_sale_order_id: ID de la orden en Odoo
-- - status: Estado de la orden

-- El laboratorio NUNCA ve:
-- - Nombre del paciente
-- - Datos personales
-- Solo ve:
-- - Código de referencia
-- - Especificaciones técnicas
-- - Clínica solicitante
```

---

## 6. SISTEMA DE CITAS (OPCIONAL - Fase 2)

### Tabla: `schema_medical.appointments`

```sql
CREATE TABLE schema_medical.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES schema_medical.clinics(id),
  patient_id UUID NOT NULL REFERENCES schema_medical.patients(id) ON DELETE CASCADE,
  
  -- Información de la Cita
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes INTEGER,
  
  -- Personal
  doctor_id UUID REFERENCES schema_core.users(id),
  
  -- Tipo y Estado
  appointment_type TEXT CHECK (appointment_type IN (
    'consultation', 'treatment', 'follow_up', 'emergency', 'other'
  )),
  status TEXT DEFAULT 'scheduled' CHECK (status IN (
    'scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'
  )),
  
  -- Detalles
  reason TEXT,
  notes TEXT,
  reminder_sent BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT
);

-- Índices
CREATE INDEX idx_appointments_clinic ON schema_medical.appointments(clinic_id);
CREATE INDEX idx_appointments_patient ON schema_medical.appointments(patient_id);
CREATE INDEX idx_appointments_doctor ON schema_medical.appointments(doctor_id);
CREATE INDEX idx_appointments_date ON schema_medical.appointments(appointment_date, start_time);

-- RLS
ALTER TABLE schema_medical.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY appointments_clinic_isolation ON schema_medical.appointments
  FOR ALL USING (
    clinic_id IN (
      SELECT clinic_id FROM schema_medical.clinic_staff WHERE user_id = auth.uid()
    )
  );
```

---

## RESUMEN DE MÓDULOS

| Módulo | Tablas | Prioridad | Integración Odoo |
|--------|--------|-----------|------------------|
| **Pacientes** | `patients` | ALTA | ✅ Sí (como contactos) |
| **Odontograma** | `odontogram_records` | ALTA | ❌ No |
| **Tratamientos** | `treatments` | ALTA | ❌ No |
| **Presupuestos** | `budgets`, `budget_items` | MEDIA | ⚠️ Opcional |
| **Órdenes Lab** | `schema_lab.orders` (existente) | ALTA | ✅ Sí (sale orders) |
| **Citas** | `appointments` | BAJA (Fase 2) | ❌ No |

---

## REGLAS NO NEGOCIABLES

1. ✅ **Multi-tenancy:** TODAS las tablas llevan `clinic_id`
2. ✅ **RLS:** Activado en TODAS las tablas
3. ✅ **Zero-trust:** Frontend NUNCA decide precios ni permisos
4. ✅ **Privacidad:** Laboratorio NUNCA ve datos personales de pacientes
5. ✅ **Idempotencia:** Integración con Odoo debe ser idempotente
6. ✅ **Isolation:** Fallo en un módulo NO rompe otros

---

## PRÓXIMOS PASOS

1. ✅ **Crear tabla `patients`** con migración SQL
2. ✅ **Crear odontograma** con migración SQL
3. ✅ **Crear interfaz de pacientes** (CRUD)
4. ✅ **Crear componente de odontograma interactivo**
5. ✅ **Integrar creación de órdenes** hacia Odoo

¿Comenzamos con la implementación?
