-- Migration: Add company_id column to employee_cards table
-- This fixes the critical data leakage issue where all employee cards were fetched and filtered client-side
-- 
-- Steps:
-- 1. Add company_id column (nullable initially)
-- 2. Migrate existing data from theme JSON to the new column
-- 3. Make column NOT NULL after migration
-- 4. Add foreign key constraint
-- 5. Add index for performance
-- 6. Update RLS policies will be done in a separate script

-- Step 1: Add company_id column (nullable initially)
ALTER TABLE employee_cards 
ADD COLUMN IF NOT EXISTS company_id UUID;

-- Step 2: Migrate existing data from theme JSON to company_id column
-- Extract company_id from theme JSON and update the column
UPDATE employee_cards
SET company_id = (theme->>'company_id')::UUID
WHERE company_id IS NULL 
  AND theme IS NOT NULL 
  AND theme->>'company_id' IS NOT NULL;

-- Step 3: Make column NOT NULL (only if all rows have been migrated)
-- Note: This will fail if there are rows without company_id
-- You may need to handle orphaned records first
-- ALTER TABLE employee_cards ALTER COLUMN company_id SET NOT NULL;

-- Step 4: Add foreign key constraint
ALTER TABLE employee_cards
ADD CONSTRAINT fk_employee_cards_company_id 
FOREIGN KEY (company_id) 
REFERENCES companies(id) 
ON DELETE CASCADE;

-- Step 5: Add index for performance (critical for getEmployeesByCompany query)
CREATE INDEX IF NOT EXISTS idx_employee_cards_company_id 
ON employee_cards(company_id);

-- Step 6: Add index on public_slug for public card lookups
CREATE INDEX IF NOT EXISTS idx_employee_cards_public_slug 
ON employee_cards(public_slug);

-- Step 7: Add composite index for common query pattern (company_id + is_active)
CREATE INDEX IF NOT EXISTS idx_employee_cards_company_active 
ON employee_cards(company_id, is_active) 
WHERE is_active = true;

-- Verification query: Check migration status
-- SELECT 
--   COUNT(*) as total_cards,
--   COUNT(company_id) as cards_with_company_id,
--   COUNT(*) - COUNT(company_id) as cards_without_company_id
-- FROM employee_cards;

