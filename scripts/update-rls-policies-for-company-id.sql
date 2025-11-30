-- Update RLS Policies to Use company_id Column
-- Run this AFTER running the migration: migrations/add-company-id-to-employee-cards.sql
-- 
-- This script updates RLS policies to use the new company_id column instead of
-- extracting it from the theme JSON, which is more efficient and secure.

-- ============================================
-- STEP 1: Drop existing policies that use theme JSON
-- ============================================
DROP POLICY IF EXISTS "Company Admin: Select company employee cards" ON employee_cards;
DROP POLICY IF EXISTS "Company Admin: Insert company employee cards" ON employee_cards;
DROP POLICY IF EXISTS "Company Admin: Update company employee cards" ON employee_cards;
DROP POLICY IF EXISTS "Company Admin: Delete company employee cards" ON employee_cards;

-- ============================================
-- STEP 2: Create new policies using company_id column
-- ============================================

-- Company Admin: Select employee cards for their company
-- Now uses the company_id column directly (much more efficient)
CREATE POLICY "Company Admin: Select company employee cards"
  ON employee_cards
  FOR SELECT
  USING (
    get_current_user_role() = 'company_admin'
    AND company_id = get_current_user_company_id()
  );

-- Company Admin: Insert employee cards for their company
-- Ensures the company_id column matches the admin's company_id
CREATE POLICY "Company Admin: Insert company employee cards"
  ON employee_cards
  FOR INSERT
  WITH CHECK (
    get_current_user_role() = 'company_admin'
    AND company_id = get_current_user_company_id()
  );

-- Company Admin: Update employee cards for their company
-- Ensures they can only update cards belonging to their company
CREATE POLICY "Company Admin: Update company employee cards"
  ON employee_cards
  FOR UPDATE
  USING (
    get_current_user_role() = 'company_admin'
    AND company_id = get_current_user_company_id()
  )
  WITH CHECK (
    get_current_user_role() = 'company_admin'
    AND company_id = get_current_user_company_id()
  );

-- Company Admin: Delete employee cards for their company
CREATE POLICY "Company Admin: Delete company employee cards"
  ON employee_cards
  FOR DELETE
  USING (
    get_current_user_role() = 'company_admin'
    AND company_id = get_current_user_company_id()
  );

-- ============================================
-- STEP 3: Verify policies
-- ============================================
-- Test that policies are created correctly
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'employee_cards'
  AND policyname LIKE 'Company Admin%'
ORDER BY policyname;

-- ============================================
-- NOTES:
-- ============================================
-- 1. The Super Admin and Public policies remain unchanged
-- 2. Employee policies (if any) should also be updated to use company_id
-- 3. The theme JSON still contains company_id for backward compatibility
--    but the column is now the source of truth
-- 4. All queries should now use company_id column for better performance

