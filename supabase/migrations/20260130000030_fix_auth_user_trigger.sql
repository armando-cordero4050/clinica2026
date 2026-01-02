-- Fix the trigger function to handle existing users from Odoo sync
-- This prevents duplicate key violations when creating auth.users for users
-- that were already created in schema_core.users via Odoo sync

CREATE OR REPLACE FUNCTION schema_core.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert new user in schema_core.users if not exists
  INSERT INTO schema_core.users (id, email, role)
  VALUES (new.id, new.email, 'patient')
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION schema_core.handle_new_user() IS 
  'Trigger function to sync auth.users to schema_core.users. 
   Handles conflicts for users created via Odoo sync.';
