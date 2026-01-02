-- Add name column to users table
ALTER TABLE schema_core.users 
ADD COLUMN IF NOT EXISTS name TEXT;

-- Add comment
COMMENT ON COLUMN schema_core.users.name IS 'Full name of the user';
