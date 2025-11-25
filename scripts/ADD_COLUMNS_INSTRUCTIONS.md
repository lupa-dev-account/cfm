# Adding Social Media Columns to Supabase

## Option 1: Via Supabase SQL Editor (Recommended)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `niivkjrhszjuyboqrirj`
3. Click on "SQL Editor" in the left sidebar
4. Click "New query"
5. Copy and paste the following SQL:

```sql
-- Add social media columns to companies table
ALTER TABLE companies
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS facebook_url TEXT,
ADD COLUMN IF NOT EXISTS instagram_url TEXT;

-- Verify the columns were added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'companies'
  AND column_name IN ('linkedin_url', 'facebook_url', 'instagram_url');
```

6. Click "Run" (or press Ctrl+Enter)
7. You should see the 3 new columns listed in the results

## Option 2: Via Supabase Table Editor

1. Go to your Supabase Dashboard
2. Click on "Table Editor" in the left sidebar
3. Select the "companies" table
4. Click the "+" button to add a new column
5. Add each column:
   - Column name: `linkedin_url`, Type: `text`, Nullable: ✓
   - Column name: `facebook_url`, Type: `text`, Nullable: ✓
   - Column name: `instagram_url`, Type: `text`, Nullable: ✓

## After Adding Columns

Run this command to populate CFM company data:
```bash
node scripts/setup-cfm-data.js
```

This will update the CFM company with:
- LinkedIn URL
- Facebook URL
- Instagram URL
- Company description
- Website
- Footer text
