-- =====================================================
-- Migration: Auto-generate full_name from first_name + last_name
-- Date: 2026-01-31
-- Author: DentalFlow Team
-- Description: Adds a trigger to automatically populate full_name
--              when inserting or updating patients
-- =====================================================

-- Step 1: Create the trigger function
CREATE OR REPLACE FUNCTION schema_medical.sync_patient_full_name()
RETURNS TRIGGER AS $$
BEGIN
  -- Concatenate first_name and last_name, handling nulls
  NEW.full_name := TRIM(COALESCE(NEW.first_name, '') || ' ' || COALESCE(NEW.last_name, ''));
  
  -- If both are null/empty, set a default
  IF NEW.full_name = '' THEN
    NEW.full_name := 'Sin Nombre';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 2: Create the trigger on INSERT and UPDATE
DROP TRIGGER IF EXISTS tr_sync_patient_full_name ON schema_medical.patients;

CREATE TRIGGER tr_sync_patient_full_name
  BEFORE INSERT OR UPDATE OF first_name, last_name
  ON schema_medical.patients
  FOR EACH ROW
  EXECUTE FUNCTION schema_medical.sync_patient_full_name();

-- Step 3: Backfill existing records (if any have null full_name)
UPDATE schema_medical.patients
SET full_name = TRIM(COALESCE(first_name, '') || ' ' || COALESCE(last_name, ''))
WHERE full_name IS NULL OR full_name = '';

-- Step 4: Add a comment for documentation
COMMENT ON FUNCTION schema_medical.sync_patient_full_name() IS 
  'Auto-generates full_name from first_name and last_name on INSERT/UPDATE';

COMMENT ON TRIGGER tr_sync_patient_full_name ON schema_medical.patients IS 
  'Ensures full_name is always populated from first_name + last_name';
