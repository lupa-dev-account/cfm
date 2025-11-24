-- Script to sync Supabase Auth users with database users
-- Run this in Supabase SQL Editor

-- IMPORTANT: First, get the Auth user UUIDs from Supabase Dashboard
-- Go to Authentication → Users and copy the UUID for each user

-- Step 1: Update existing users with Auth UUIDs
-- Replace 'AUTH_UUID_HERE' with the actual UUID from Supabase Auth

-- Update compadmin user
UPDATE users
SET id = 'AUTH_UUID_HERE'::uuid  -- Replace with actual Auth UUID for compadmin@cfm.co.mz
WHERE email = 'compadmin@cfm.co.mz'
RETURNING id, email, role;

-- Step 2: Alternative - Insert user if they don't exist
-- Use this if the user doesn't exist in the database yet
-- INSERT INTO users (id, company_id, email, role, first_name, last_name, title)
-- VALUES (
--   'AUTH_UUID_HERE'::uuid,  -- From Supabase Auth
--   (SELECT id FROM companies WHERE slug = 'cfm'),
--   'compadmin@cfm.co.mz',
--   'company_admin',
--   'Company',
--   'Admin',
--   'Company Administrator'
-- )
-- ON CONFLICT (id) DO UPDATE SET
--   email = EXCLUDED.email,
--   role = EXCLUDED.role;

-- Step 3: Verify the update
SELECT 
  u.id,
  u.email,
  u.role,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM auth.users WHERE id = u.id
    ) THEN '✅ Auth user exists'
    ELSE '❌ No matching Auth user'
  END AS auth_status
FROM users u
WHERE u.email = 'compadmin@cfm.co.mz';

