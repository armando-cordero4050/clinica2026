-- Extend clinic_staff table to store additional contact info from Odoo
ALTER TABLE schema_medical.clinic_staff
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS job_position TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS mobile TEXT;

-- Add comments
COMMENT ON COLUMN schema_medical.clinic_staff.title IS 'Contact title from Odoo (e.g., Doctor, Manager)';
COMMENT ON COLUMN schema_medical.clinic_staff.job_position IS 'Job position/function from Odoo';
COMMENT ON COLUMN schema_medical.clinic_staff.phone IS 'Contact phone number';
COMMENT ON COLUMN schema_medical.clinic_staff.mobile IS 'Contact mobile number';
