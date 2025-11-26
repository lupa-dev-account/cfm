-- ============================================
-- COPY AND PASTE THIS INTO SUPABASE SQL EDITOR
-- ============================================

-- Step 1: Add social media columns to companies table
ALTER TABLE companies
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS facebook_url TEXT,
ADD COLUMN IF NOT EXISTS instagram_url TEXT;

-- Step 2: Update CFM company with data
UPDATE companies
SET
  name = 'CFM',
  description = 'Mozambican public company responsible for managing and operating the country''s ports and railways. Its mission is to provide integrated and efficient logistical solutions for goods and passengers, contributing to the economic development of Mozambique and the wider region.',
  footer_text = 'PORTOS E CAMINHOS DE FERRO DE MOÇAMBIQUE, E.P.',
  website_url = 'https://www.cfm.co.mz',
  linkedin_url = 'https://linkedin.com/company/cfm-mozambique',
  facebook_url = 'https://facebook.com/CFMMocambique',
  instagram_url = 'https://instagram.com/cfm_mozambique'
WHERE name ILIKE '%CFM%' OR slug ILIKE '%cfm%';

-- Step 3: Verify the changes
SELECT
  id,
  name,
  description,
  website_url,
  linkedin_url,
  facebook_url,
  instagram_url
FROM companies
WHERE name ILIKE '%CFM%';

-- ============================================
-- INSTRUCTIONS:
-- 1. Go to https://supabase.com/dashboard
-- 2. Select your project: niivkjrhszjuyboqrirj
-- 3. Click on "SQL Editor" in the left sidebar
-- 4. Click "New query"
-- 5. Paste this entire SQL file
-- 6. Click "Run" (or press Ctrl+Enter)
-- 7. Check the results to verify the update
-- ============================================
