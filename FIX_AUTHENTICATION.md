# Fix Authentication Issue

## Problem
You're getting "Unable to fetch user information" because the Supabase Auth user UUID doesn't match the database user UUID.

## Quick Fix Steps

### Step 1: Get the Auth User UUID
1. Go to your Supabase Dashboard
2. Navigate to **Authentication → Users**
3. Find the user `compadmin@cfm.co.mz`
4. **Copy the UUID** (it's shown in the user details)

### Step 2: Update Database User
Run this SQL in Supabase SQL Editor, replacing `AUTH_UUID_HERE` with the UUID from Step 1:

```sql
-- Update compadmin user to match Auth UUID
UPDATE users
SET id = 'AUTH_UUID_HERE'::uuid  -- Replace with actual UUID from Supabase Auth
WHERE email = 'compadmin@cfm.co.mz'
RETURNING id, email, role;
```

### Step 3: Verify
Run this to check:

```sql
-- Verify the user exists with correct UUID
SELECT 
  u.id,
  u.email,
  u.role,
  u.first_name || ' ' || u.last_name AS full_name
FROM users u
WHERE u.email = 'compadmin@cfm.co.mz';
```

### Step 4: Test Login Again
1. Go to `http://localhost:3000/login`
2. Login with:
   - Email: `compadmin@cfm.co.mz`
   - Password: `compadmin`
3. Check browser console (F12) for any additional errors

## Alternative: Create User with Auth UUID

If updating doesn't work, delete and recreate:

```sql
-- Delete existing user (be careful - this removes related data)
DELETE FROM users WHERE email = 'compadmin@cfm.co.mz';

-- Insert with Auth UUID
INSERT INTO users (id, company_id, email, role, first_name, last_name, title)
VALUES (
  'AUTH_UUID_HERE'::uuid,  -- From Supabase Auth
  (SELECT id FROM companies WHERE slug = 'cfm'),
  'compadmin@cfm.co.mz',
  'company_admin',
  'Company',
  'Admin',
  'Company Administrator'
);
```

## Check Browser Console

After trying to login, open browser console (F12) and check for:
- The Auth User ID
- The Database User ID (if found by email)
- Any RLS policy errors

The improved error messages will show you exactly what's wrong.

