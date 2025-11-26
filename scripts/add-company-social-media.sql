-- Migration: Add social media columns to companies table
-- This allows companies to have their own social media links that are shared across all employee cards

-- Add social media columns to companies table
ALTER TABLE companies
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS facebook_url TEXT,
ADD COLUMN IF NOT EXISTS instagram_url TEXT;

-- Add comment to explain the purpose
COMMENT ON COLUMN companies.linkedin_url IS 'Company LinkedIn profile URL (shared across all employee cards)';
COMMENT ON COLUMN companies.facebook_url IS 'Company Facebook page URL (shared across all employee cards)';
COMMENT ON COLUMN companies.instagram_url IS 'Company Instagram profile URL (shared across all employee cards)';

-- Optional: Update existing company with CFM data if it exists
-- Uncomment and modify the WHERE clause to match your CFM company
/*
UPDATE companies
SET
  description = 'Mozambican public company responsible for managing and operating the country''s ports and railways. Its mission is to provide integrated and efficient logistical solutions for goods and passengers, contributing to the economic development of Mozambique and the wider region.',
  linkedin_url = 'https://linkedin.com/company/cfm',
  facebook_url = 'https://facebook.com/cfm',
  instagram_url = 'https://instagram.com/cfm',
  website_url = 'https://cfm.co.mz'
WHERE name = 'CFM' OR slug = 'cfm';
*/

-- Verify the changes
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'companies'
  AND column_name IN ('linkedin_url', 'facebook_url', 'instagram_url', 'description', 'logo_url', 'website_url');
