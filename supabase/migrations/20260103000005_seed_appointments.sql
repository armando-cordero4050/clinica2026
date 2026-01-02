-- SEED APPOINTMENTS
WITH patient AS (SELECT id FROM schema_medical.patients LIMIT 1)
INSERT INTO schema_medical.appointments (clinic_id, patient_id, title, start_time, end_time)
SELECT 
    '00000000-0000-0000-0000-000000000000',
    id,
    'Primera Visita',
    NOW() + INTERVAL '1 hour',
    NOW() + INTERVAL '2 hours'
FROM patient
ON CONFLICT DO NOTHING;
