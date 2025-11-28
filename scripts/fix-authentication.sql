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
-- Replace 'YOUR_AUTH_UUID_HERE' with actual UUID from Supabase Auth Dashboard
UPDATE users
SET id = 'YOUR_SUPER_ADMIN_AUTH_UUID_HERE'::uuid
WHERE email = 'your-admin@example.com'
RETURNING id, email, role;

-- Update Company Admin
UPDATE users
SET id = 'YOUR_COMPANY_ADMIN_AUTH_UUID_HERE'::uuid
WHERE email = 'your-company-admin@example.com'
RETURNING id, email, role;

-- Update Employee
UPDATE users
SET id = 'YOUR_EMPLOYEE_AUTH_UUID_HERE'::uuid
WHERE email = 'your-employee@example.com'
RETURNING id, email, role;

-- ============================================
-- STEP 3: ALTERNATIVE - Create users if they don't exist
-- ============================================
-- Use this if users don't exist in database yet

-- Super Admin
INSERT INTO users (id, company_id, email, role, first_name, last_name, title)
VALUES (
  'YOUR_SUPER_ADMIN_AUTH_UUID_HERE'::uuid,  -- From Supabase Auth Dashboard
  NULL,
  'your-admin@example.com',
  'super_admin',
  'First',
  'Last',
  'Administrator'
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
  'YOUR_COMPANY_ADMIN_AUTH_UUID_HERE'::uuid,  -- From Supabase Auth Dashboard
  (SELECT id FROM companies WHERE slug = 'your-company-slug'),
  'your-company-admin@example.com',
  'company_admin',
  'First',
  'Last',
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
  'YOUR_EMPLOYEE_AUTH_UUID_HERE'::uuid,  -- From Supabase Auth Dashboard
  (SELECT id FROM companies WHERE slug = 'your-company-slug'),
  'your-employee@example.com',
  'employee',
  'First',
  'Last',
  'Job Title'
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








