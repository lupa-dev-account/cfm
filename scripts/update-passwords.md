# Update Passwords in Supabase Auth

## Problem
- Default password "admin" is less than 6 characters
- Need to update passwords to meet requirements (6+ characters)

## Solution Options

### Option 1: Update via Supabase Management API (Recommended)

Use the Supabase Management API with your service_role key:

#### Step 1: Get Your Service Role Key
1. Go to **Supabase Dashboard** → **Settings** → **API**
2. Find **"service_role"** key (⚠️ Keep this secret!)
3. Copy it

#### Step 2: Update Password via API

**For Super Admin:**
```bash
curl -X PUT 'https://YOUR_PROJECT_REF.supabase.co/auth/v1/admin/users/USER_UUID' \
  -H "apikey: YOUR_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "password": "admin123"
  }'
```

**For Company Admin:**
```bash
curl -X PUT 'https://YOUR_PROJECT_REF.supabase.co/auth/v1/admin/users/2188be2b-f26a-4b5f-ad39-8ca4a73d17a2' \
  -H "apikey: YOUR_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "password": "compadmin123"
  }'
```

**For Employee:**
```bash
curl -X PUT 'https://YOUR_PROJECT_REF.supabase.co/auth/v1/admin/users/2d33a610-a160-43f7-b438-dedc7c9d7602' \
  -H "apikey: YOUR_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "password": "agostinho123"
  }'
```

Replace:
- `YOUR_PROJECT_REF` with your Supabase project reference (from your project URL)
- `YOUR_SERVICE_ROLE_KEY` with your service_role key
- `USER_UUID` with the actual user UUID

### Option 2: Update via SQL (If you have access to auth schema)

**⚠️ Note:** This requires direct access to the `auth.users` table, which may not be available depending on your Supabase setup.

```sql
-- Update password using crypt function
-- This requires the pgcrypto extension
UPDATE auth.users
SET encrypted_password = crypt('admin123', gen_salt('bf'))
WHERE email = 'admin@cfm.co.mz';

UPDATE auth.users
SET encrypted_password = crypt('compadmin123', gen_salt('bf'))
WHERE email = 'compadmin@cfm.co.mz';

UPDATE auth.users
SET encrypted_password = crypt('agostinho123', gen_salt('bf'))
WHERE email = 'agostinho@cfm.co.mz';
```

### Option 3: Use Supabase Client Library (Node.js/TypeScript)

Create a script to update passwords:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service_role key
)

// Update password
const { data, error } = await supabase.auth.admin.updateUserById(
  '2188be2b-f26a-4b5f-ad39-8ca4a73d17a2',
  { password: 'compadmin123' }
)
```

### Option 4: Delete and Recreate Users (Last Resort)

If other methods don't work:

1. **Delete users in Supabase Dashboard:**
   - Go to **Authentication → Users**
   - Delete each user

2. **Recreate with correct passwords:**
   - Go to **Authentication → Users** → **Add User**
   - Create new user with:
     - Email: `compadmin@cfm.co.mz`
     - Password: `compadmin123` (6+ characters)
     - Auto Confirm: ✅
   - Copy the new UUID
   - Update database user with new UUID

## Alternative: Update via Supabase Management API

If you prefer to use the API, you can use the Supabase Management API:

```bash
# Example using curl (requires service_role key)
curl -X PUT 'https://api.supabase.com/v1/projects/YOUR_PROJECT_ID/auth/users/USER_ID' \
  -H "apikey: YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "password": "newpassword123"
  }'
```

**⚠️ Warning:** This requires your service_role key, which should be kept secret!

## Recommended Passwords

For development/testing:
- Super Admin: `admin123`
- Company Admin: `compadmin123`
- Employee: `agostinho123`

For production:
- Use strong, unique passwords
- Consider using password managers
- Enable 2FA for admin accounts

## Test After Update

1. Go to `http://localhost:3000/login`
2. Try logging in with updated credentials
3. Verify redirect works based on role

