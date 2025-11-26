# Quick Fix Guide - Authentication & Passwords

## 🚀 Quick Start (5 minutes)

### Step 1: Get Auth User UUIDs (2 min)
1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. For each user, click on them and **copy the UUID**:
   - `admin@cfm.co.mz` → Copy UUID: `________________`
   - `compadmin@cfm.co.mz` → Copy UUID: `________________`
   - `agostinho@cfm.co.mz` → Copy UUID: `________________`

### Step 2: Fix UUID Mismatches (1 min)
1. Open **Supabase SQL Editor**
2. Open `scripts/fix-authentication.sql`
3. Replace all `AUTH_UUID_HERE` with the UUIDs from Step 1
4. Run the UPDATE statements (Step 2 section)

### Step 3: Update Passwords (3 min)

**Option A: Using API Script (Easiest)**
1. Get your **Service Role Key** from Supabase Dashboard → Settings → API
2. Update `scripts/update-passwords.js` with your:
   - `SUPABASE_URL` (your project URL)
   - `SERVICE_ROLE_KEY` (your service_role key)
3. Run: `node scripts/update-passwords.js`

**Option B: Using cURL (Manual)**
1. Get your **Service Role Key** from Supabase Dashboard → Settings → API
2. Run these commands (replace YOUR_PROJECT_REF and YOUR_SERVICE_ROLE_KEY):

```bash
# Update Company Admin
curl -X PUT 'https://YOUR_PROJECT_REF.supabase.co/auth/v1/admin/users/2188be2b-f26a-4b5f-ad39-8ca4a73d17a2' \
  -H "apikey: YOUR_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"password": "compadmin123"}'
```

**Option C: Delete and Recreate Users**
1. In **Supabase Dashboard** → **Authentication** → **Users**
2. Delete existing users
3. Create new users with passwords:
   - `admin@cfm.co.mz` → Password: `admin123`
   - `compadmin@cfm.co.mz` → Password: `compadmin123`
   - `agostinho@cfm.co.mz` → Password: `agostinho123`
4. Copy new UUIDs and update database (run Step 2 again with new UUIDs)

### Step 4: Test Login
1. Go to `http://localhost:3000/login`
2. Try logging in with:
   - Email: `compadmin@cfm.co.mz`
   - Password: `compadmin123`
3. Should redirect to `/dashboard/company`

## 📋 Detailed Instructions

### Fix UUID Mismatch

**Option A: Update Existing Users**
```sql
-- Replace UUIDs with actual values from Supabase Auth
UPDATE users
SET id = 'YOUR_AUTH_UUID_HERE'::uuid
WHERE email = 'compadmin@cfm.co.mz'
RETURNING id, email, role;
```

**Option B: Create Users if Missing**
```sql
-- Use the INSERT statements from scripts/fix-authentication.sql
-- Replace AUTH_UUID_HERE with actual UUIDs
```

### Update Passwords

**Via Dashboard (Recommended):**
1. Supabase Dashboard → Authentication → Users
2. Click user → Reset Password
3. Enter new password (6+ characters)
4. Save

**Via API (Advanced):**
See `scripts/update-passwords.md` for API method.

## ✅ Verification Checklist

- [ ] All Auth UUIDs copied
- [ ] Database users updated with Auth UUIDs
- [ ] All passwords updated to 6+ characters
- [ ] Tested login for super_admin
- [ ] Tested login for company_admin
- [ ] Tested login for employee
- [ ] Verified redirects work correctly

## 🔍 Troubleshooting

### "User not found in database"
- Check if user exists in database: Run diagnostic query in `scripts/fix-authentication.sql`
- Verify UUID matches: Compare Auth UUID with database user ID

### "Invalid email or password"
- Verify password was updated in Supabase Auth
- Check password meets 6+ character requirement
- Try resetting password again

### "Unable to fetch user information"
- UUID mismatch: Update database user ID to match Auth UUID
- RLS policy issue: Check RLS policies allow user to read their own data

## 📝 Password Reference

| User | Email | Default Password | New Password |
|------|-------|------------------|--------------|
| Super Admin | admin@cfm.co.mz | admin | admin123 |
| Company Admin | compadmin@cfm.co.mz | compadmin | compadmin123 |
| Employee | agostinho@cfm.co.mz | (set in Auth) | agostinho123 |

