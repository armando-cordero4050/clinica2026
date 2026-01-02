-- Fix ID mismatch for drpedro@clinica.com
-- The user in auth.users has a different ID than the one in schema_core.users

-- Step 1: Delete the incorrect user from auth.users
-- (This will be done via Admin API, not SQL)

-- Step 2: Ensure the correct user exists in schema_core.users
-- (Already exists with correct role)

-- Step 3: The resetStaffPassword function should create the auth user with the SAME ID
-- This is already implemented in the updated function

-- For now, we need to manually sync the IDs:
-- Delete the wrong auth user and let the system recreate it with the correct ID

-- Note: This SQL cannot delete from auth.users directly (requires service_role)
-- We'll handle this via the Admin API in the TypeScript action

SELECT 'ID Mismatch Detected' as status,
       'Auth ID: c8f7c5d5-24a6-475f-bbef-9185d8a01f7b' as auth_user,
       'Core ID: 5106edb9-e0ed-43bb-a49c-8427bbde07ae' as core_user,
       'Action: Delete auth user and recreate with correct ID' as solution;
