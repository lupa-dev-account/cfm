-- ============================================
-- AUTHENTICATION FIX SCRIPT
-- ============================================
-- This script helps fix UUID mismatches between Supabase Auth and database users
-- Run this in Supabase SQL Editor

-- ============================================
-- STEP 1: DIAGNOSTIC - Check current state
-- ============================================
-- Run this first to see what users exist and their UUIDs

SELECT 
  'Database Users' AS source,
  u.id AS user_id,
  u.email,
  u.role,
  u.first_name || ' ' || u.last_name AS full_name,
  'Check Supabase Auth Dashboard for matching UUID' AS auth_check
FROM users u
ORDER BY u.role, u.email;

-- ============================================
-- STEP 2: FIX UUID MISMATCHES
-- ============================================
-- IMPORTANT: Get the Auth UUIDs from Supabase Dashboard first!
-- Go to: Authentication → Users → Copy the UUID for each user

-- Update Super Admin
-- Replace 'AUTH_UUID_HERE' with actual UUID from Supabase Auth
UPDATE users
SET id = '4cb06658-7033-4be4-b8e3-0fe4d7ec888f'::uuid
WHERE email = 'admin@cfm.co.mz'
RETURNING id, email, role;

-- Update Company Admin
UPDATE users
SET id = '2188be2b-f26a-4b5f-ad39-8ca4a73d17a2'::uuid  -- Replace with Auth UUID for compadmin@cfm.co.mz
WHERE email = 'compadmin@cfm.co.mz'
RETURNING id, email, role;

-- Update Employee
UPDATE users
SET id = '2d33a610-a160-43f7-b438-dedc7c9d7602'::uuid  -- Replace with Auth UUID for agostinho@cfm.co.mz
WHERE email = 'agostinho@cfm.co.mz'
RETURNING id, email, role;

-- ============================================
-- STEP 3: ALTERNATIVE - Create users if they don't exist
-- ============================================
-- Use this if users don't exist in database yet

-- Super Admin
INSERT INTO users (id, company_id, email, role, first_name, last_name, title)
VALUES (
  '4cb06658-7033-4be4-b8e3-0fe4d7ec888f'::uuid,  -- From Supabase Auth
  NULL,
  'admin@cfm.co.mz',
  'super_admin',
  'Super',
  'Admin',
  'Platform Administrator'
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  title = EXCLUDED.title;

-- Company Admin
INSERT INTO users (id, company_id, email, role, first_name, last_name, title)
VALUES (
  '2188be2b-f26a-4b5f-ad39-8ca4a73d17a2'::uuid,  -- From Supabase Auth
  (SELECT id FROM companies WHERE slug = 'cfm'),
  'compadmin@cfm.co.mz',
  'company_admin',
  'Company',
  'Admin',
  'Company Administrator'
)
ON CONFLICT (id) DO UPDATE SET
  company_id = EXCLUDED.company_id,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  title = EXCLUDED.title;

-- Employee
INSERT INTO users (id, company_id, email, role, first_name, last_name, title)
VALUES (
  '2d33a610-a160-43f7-b438-dedc7c9d7602'::uuid,  -- From Supabase Auth
  (SELECT id FROM companies WHERE slug = 'cfm'),
  'agostinho@cfm.co.mz',
  'employee',
  'Agostinho F.',
  'Langa Jr',
  'Chairman of the Board of Directors'
)
ON CONFLICT (id) DO UPDATE SET
  company_id = EXCLUDED.company_id,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  title = EXCLUDED.title;

-- ============================================
-- STEP 4: VERIFY FIX
-- ============================================
-- Run this after updating to verify everything is correct

SELECT 
  u.id,
  u.email,
  u.role,
  u.first_name || ' ' || u.last_name AS full_name,
  c.name AS company_name,
  '✅ Ready for login' AS status
FROM users u
LEFT JOIN companies c ON c.id = u.company_id
ORDER BY u.role, u.email;

