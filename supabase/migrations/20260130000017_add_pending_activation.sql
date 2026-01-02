-- Add is_pending_activation column to users table
ALTER TABLE schema_core.users 
ADD COLUMN IF NOT EXISTS is_pending_activation BOOLEAN DEFAULT FALSE;

-- Add comment
COMMENT ON COLUMN schema_core.users.is_pending_activation IS 'Indicates if user was created from Odoo sync and needs to activate their account';
