-- 🧪 SEED: GLOBAL KAMBRA TEST DATA
-- Populates orders across the 11 new stages for testing.

-- 1. Ensure a clinic exists
INSERT INTO schema_core.clinics (id, name)
VALUES ('777ebc99-9c0b-4ef8-bb6d-6bb9bd380777', 'Clínica Dental San José')
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Test Orders in different stages
INSERT INTO schema_lab.orders (
    clinic_id, doctor_name, patient_name, patient_gender, patient_age, 
    status, priority, due_date, is_digital, courier_name, tracking_number, requirement_notes, total_price
)
VALUES 
    -- Stage 1: Clinic Pending
    ('777ebc99-9c0b-4ef8-bb6d-6bb9bd380777', 'Dr. Arana', 'Paciente A', 'F', 28, 'clinic_pending', 'normal', CURRENT_DATE + 5, false, null, null, 'Corona Zirconio', 1200),
    
    -- Stage 2: Digital Picking
    ('777ebc99-9c0b-4ef8-bb6d-6bb9bd380777', 'Dr. Mendez', 'Paciente B', 'M', 45, 'digital_picking', 'high', CURRENT_DATE + 3, true, 'Cargo Expreso', 'GT-99221', 'Carillas 3D', 2500),

    -- Stage 4: Gypsum
    ('777ebc99-9c0b-4ef8-bb6d-6bb9bd380777', 'Dra. Sosa', 'Paciente C', 'F', 52, 'gypsum', 'urgent', CURRENT_DATE + 2, false, null, null, 'Prótesis Total', 3500),

    -- Stage 5: Design
    ('777ebc99-9c0b-4ef8-bb6d-6bb9bd380777', 'Dr. Arana', 'Paciente D', 'M', 31, 'design', 'normal', CURRENT_DATE + 4, true, null, null, 'Incrustación Emax', 800),

    -- Stage 9: QA
    ('777ebc99-9c0b-4ef8-bb6d-6bb9bd380777', 'Dr. Wong', 'Paciente E', 'F', 24, 'qa', 'normal', CURRENT_DATE + 1, false, null, null, 'Puente 3 Unidades', 2100);

-- 3. Add order items to see names
INSERT INTO schema_lab.order_items (order_id, service_id, tooth_number, notes)
SELECT o.id, (SELECT id FROM schema_lab.services LIMIT 1), 11, 'Urgente'
FROM schema_lab.orders o
WHERE o.doctor_name IN ('Dr. Mendez', 'Dra. Sosa')
ON CONFLICT DO NOTHING;
