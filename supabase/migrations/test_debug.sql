
-- Test debug migration
DO $$
BEGIN
    RAISE NOTICE 'Starting debug migration...';
    
    -- 1. Check if schema_lab exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'schema_lab') THEN
        RAISE EXCEPTION 'schema_lab does not exist!';
    ELSE
        RAISE NOTICE 'schema_lab exists.';
    END IF;

    -- 2. Try to create a dummy table in schema_lab
    CREATE TABLE IF NOT EXISTS schema_lab.test_debug_table (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY
    );
    RAISE NOTICE 'Created test_debug_table.';

    -- 3. Check access to schema_medical.clinics
    -- We can't select from it if we don't know it exists, but we can check info schema
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'schema_medical' AND table_name = 'clinics') THEN
        RAISE NOTICE 'WARNING: schema_medical.clinics table NOT found in metadata!';
    ELSE
         RAISE NOTICE 'schema_medical.clinics found.';
    END IF;

    -- Clean up
    DROP TABLE IF EXISTS schema_lab.test_debug_table;
END $$;
