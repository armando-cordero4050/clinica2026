-- SEED DATA: PATIENTS

INSERT INTO schema_medical.patients (clinic_id, full_name, phone, email, date_of_birth, allergies)
VALUES
    ('00000000-0000-0000-0000-000000000000', 'Ana Gomez', '555-0101', 'ana@example.com', '1990-05-15', '["Penicillin"]'::JSONB),
    ('00000000-0000-0000-0000-000000000000', 'Carlos Tevez', '555-0102', 'carlos@example.com', '1985-08-20', '[]'::JSONB),
    ('00000000-0000-0000-0000-000000000000', 'Luisa Lane', '555-0103', 'luisa@dailyplanet.com', '1995-11-01', '["Latex", "Peanuts"]'::JSONB)
ON CONFLICT DO NOTHING;
