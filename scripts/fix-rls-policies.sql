-- Fix RLS policies to allow public read access for card display
-- This allows anonymous users to view company services and company data on public cards

-- Enable RLS on tables (if not already enabled)
ALTER TABLE company_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow public read access to company services" ON company_services;
DROP POLICY IF EXISTS "Allow public read access to companies" ON companies;

-- Create policy to allow anyone to read company services
CREATE POLICY "Allow public read access to company services"
ON company_services
FOR SELECT
TO public
USING (true);

-- Create policy to allow anyone to read company data
CREATE POLICY "Allow public read access to companies"
ON companies
FOR SELECT
TO public
USING (true);

-- Note: employee_cards should already have public read access for is_active=true cards
-- If not, uncomment and run this:
-- DROP POLICY IF EXISTS "Allow public read access to active employee cards" ON employee_cards;
-- CREATE POLICY "Allow public read access to active employee cards"
-- ON employee_cards
-- FOR SELECT
-- TO public
-- USING (is_active = true);
