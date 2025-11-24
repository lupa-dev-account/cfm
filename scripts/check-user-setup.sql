-- Diagnostic script to check user setup
-- Run this in Supabase SQL Editor

-- Step 1: Check if user exists in database with email
SELECT 
  id,
  email,
  role,
  first_name,
  last_name,
  company_id,
  created_at
FROM users
WHERE email = 'compadmin@cfm.co.mz';

-- Step 2: Check Auth users (if you have access to auth schema)
-- Note: This might not work depending on your RLS setup
-- SELECT id, email, created_at 
-- FROM auth.users 
-- WHERE email = 'compadmin@cfm.co.mz';

-- Step 3: Check if RLS is blocking access
-- This will show if the user can read their own data
-- (Run this after logging in, or temporarily disable RLS for testing)

-- Step 4: Verify company relationship
SELECT 
  u.id AS user_id,
  u.email,
  u.role,
  c.id AS company_id,
  c.name AS company_name,
  c.slug AS company_slug
FROM users u
LEFT JOIN companies c ON c.id = u.company_id
WHERE u.email = 'compadmin@cfm.co.mz';

