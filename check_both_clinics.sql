-- Check both schemas
SELECT 'schema_core' as schema, id, name FROM schema_core.clinics WHERE id = '64b03e60-0e0b-4efc-a84a-fbf952284b48'
UNION ALL
SELECT 'schema_medical' as schema, id, name FROM schema_medical.clinics WHERE id = '64b03e60-0e0b-4efc-a84a-fbf952284b48'
