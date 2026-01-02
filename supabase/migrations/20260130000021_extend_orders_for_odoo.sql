-- Fix patient_id column type
-- Drop if exists and recreate as TEXT
ALTER TABLE schema_lab.orders DROP COLUMN IF EXISTS patient_id CASCADE;
ALTER TABLE schema_lab.orders ADD COLUMN patient_id TEXT;

-- Ensure other columns exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'schema_lab' 
                   AND table_name = 'orders' 
                   AND column_name = 'staff_id') THEN
        ALTER TABLE schema_lab.orders ADD COLUMN staff_id UUID REFERENCES schema_medical.clinic_staff(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'schema_lab' 
                   AND table_name = 'orders' 
                   AND column_name = 'odoo_raw_data') THEN
        ALTER TABLE schema_lab.orders ADD COLUMN odoo_raw_data JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'schema_lab' 
                   AND table_name = 'orders' 
                   AND column_name = 'price') THEN
        ALTER TABLE schema_lab.orders ADD COLUMN price DECIMAL(10,2) DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'schema_lab' 
                   AND table_name = 'orders' 
                   AND column_name = 'last_synced_from_odoo') THEN
        ALTER TABLE schema_lab.orders ADD COLUMN last_synced_from_odoo TIMESTAMPTZ;
    END IF;
END $$;
