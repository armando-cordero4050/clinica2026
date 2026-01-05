-- Fix duplicate users and improve trigger to prevent role conflicts

-- 1. Delete duplicate patient records for staff members
DELETE FROM schema_core.users 
WHERE role = 'patient' 
AND email IN (
  SELECT DISTINCT u.email 
  FROM schema_core.users u
  INNER JOIN schema_medical.clinic_staff cs ON u.id = cs.user_id
  WHERE u.role IN ('clinic_admin', 'clinic_staff')
)
AND id NOT IN (
  SELECT user_id FROM schema_medical.clinic_staff
);

-- 2. Improve the trigger to respect existing users with staff roles
CREATE OR REPLACE FUNCTION schema_core.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if user already exists
  IF EXISTS (SELECT 1 FROM schema_core.users WHERE id = new.id) THEN
    -- User exists, just update email if changed
    UPDATE schema_core.users 
    SET email = new.email, updated_at = NOW()
    WHERE id = new.id;
  ELSIF EXISTS (SELECT 1 FROM schema_core.users WHERE email = new.email) THEN
    -- Email exists with different ID - this is a staff member being activated
    -- Update the existing record's ID to match auth
    UPDATE schema_core.users 
    SET id = new.id, updated_at = NOW()
    WHERE email = new.email;
    
    -- Also update clinic_staff if this user is staff
    UPDATE schema_medical.clinic_staff
    SET user_id = new.id
    WHERE user_id IN (
      SELECT id FROM schema_core.users WHERE email = new.email AND id != new.id
    );
  ELSE
    -- New user, insert with default patient role
    INSERT INTO schema_core.users (id, email, role)
    VALUES (new.id, new.email, 'patient');
  END IF;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION schema_core.handle_new_user() IS 
  'Trigger function to sync auth.users to schema_core.users. 
   Prevents duplicate users and respects existing staff roles.';
