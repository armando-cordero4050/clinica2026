-- SEED DATA: LAB ORDERS
-- Using 00000000-0000-0000-0000-000000000000 as default clinic_id for demo purposes

INSERT INTO schema_lab.services (code, name, category, base_price)
VALUES 
    ('ZR-CROWN', 'Zirconia Crown', 'fija', 150.00),
    ('ZR-BRIDGE', 'Zirconia Bridge (3 Units)', 'fija', 450.00),
    ('ACRYLIC-DENTURE', 'Acrylic Denture', 'removible', 200.00)
ON CONFLICT DO NOTHING;

INSERT INTO schema_lab.orders (id, clinic_id, patient_name, doctor_name, status, priority, due_date)
VALUES
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '00000000-0000-0000-0000-000000000000', 'Maria Mendez', 'Dr. Wong', 'new', 'high', NOW() + INTERVAL '2 days'),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '00000000-0000-0000-0000-000000000000', 'Jorge Ortiz', 'Dr. Smith', 'design', 'normal', NOW() + INTERVAL '5 days'),
    ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '00000000-0000-0000-0000-000000000000', 'Lucia Torres', 'Dr. Wong', 'milling', 'urgent', NOW() + INTERVAL '1 day'),
    ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', '00000000-0000-0000-0000-000000000000', 'Carlos Ruiz', 'Dr. House', 'qc', 'normal', NOW())
ON CONFLICT DO NOTHING;

-- Link items
INSERT INTO schema_lab.order_items (order_id, service_id, tooth_number, notes)
SELECT 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', id, 21, 'Shade A2' FROM schema_lab.services WHERE code = 'ZR-CROWN' LIMIT 1;
