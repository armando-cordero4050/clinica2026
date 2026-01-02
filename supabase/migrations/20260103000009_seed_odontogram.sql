-- SEED ODONTOGRAM
-- Create an initial record for the first patient with some demo data (e.g. Tooth 18 missing)

WITH patient AS (SELECT id FROM schema_medical.patients LIMIT 1)
INSERT INTO schema_medical.odontograms (clinic_id, patient_id, teeth_state)
SELECT 
    '00000000-0000-0000-0000-000000000000',
    id,
    '{
        "18": { "condition": "missing", "notes": "Extracted 2020" },
        "24": { "condition": "caries", "surface": "occlusal" }
    }'::JSONB
FROM patient
ON CONFLICT DO NOTHING;
