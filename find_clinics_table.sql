-- Check all schemas for clinics table
SELECT 
    table_schema, 
    table_name 
FROM information_schema.tables 
WHERE table_name = 'clinics'
ORDER BY table_schema
