-- ============================================
-- FIX EMPLOYEE_CARDS RLS POLICIES
-- ============================================
-- This script creates RLS policies for employee_cards table
-- to allow company admins to manage employee cards for their company

-- ============================================
-- STEP 1: Ensure RLS is enabled on employee_cards
-- ============================================
ALTER TABLE employee_cards ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 2: Drop existing policies if they exist
-- ============================================
DROP POLICY IF EXISTS "Super Admin: Full access to employee_cards" ON employee_cards;
DROP POLICY IF EXISTS "Company Admin: Manage company employee cards" ON employee_cards;
DROP POLICY IF EXISTS "Company Admin: Insert company employee cards" ON employee_cards;
DROP POLICY IF EXISTS "Company Admin: Select company employee cards" ON employee_cards;
DROP POLICY IF EXISTS "Company Admin: Update company employee cards" ON employee_cards;
DROP POLICY IF EXISTS "Company Admin: Delete company employee cards" ON employee_cards;
DROP POLICY IF EXISTS "Employee: View own card" ON employee_cards;
DROP POLICY IF EXISTS "Employee: Update own card" ON employee_cards;
DROP POLICY IF EXISTS "Public: View active employee cards" ON employee_cards;

-- ============================================
-- STEP 3: Create helper function to extract company_id from theme JSON
-- ============================================
-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_employee_card_company_id(JSONB);
DROP FUNCTION IF EXISTS get_employee_card_company_id(JSON);

-- Create function that accepts JSONB (Supabase typically uses JSONB)
CREATE OR REPLACE FUNCTION get_employee_card_company_id(card_theme JSONB)
RETURNS UUID AS $$
  SELECT (card_theme->>'company_id')::uuid;
$$ LANGUAGE sql IMMUTABLE;

-- Also create overload for JSON type (in case column is JSON not JSONB)
CREATE OR REPLACE FUNCTION get_employee_card_company_id(card_theme JSON)
RETURNS UUID AS $$
  SELECT (card_theme::jsonb->>'company_id')::uuid;
$$ LANGUAGE sql IMMUTABLE;

-- ============================================
-- STEP 4: Create RLS policies for employee_cards
-- ============================================

-- Super Admin: Full access to all employee cards
CREATE POLICY "Super Admin: Full access to employee_cards"
  ON employee_cards
  FOR ALL
  USING (get_current_user_role() = 'super_admin')
  WITH CHECK (get_current_user_role() = 'super_admin');

-- Company Admin: Select employee cards for their company
-- Checks if company_id in theme JSON matches the admin's company_id
CREATE POLICY "Company Admin: Select company employee cards"
  ON employee_cards
  FOR SELECT
  USING (
    get_current_user_role() = 'company_admin'
    AND get_employee_card_company_id(theme::jsonb) = get_current_user_company_id()
  );

-- Company Admin: Insert employee cards for their company
-- Ensures the theme JSON contains the correct company_id
CREATE POLICY "Company Admin: Insert company employee cards"
  ON employee_cards
  FOR INSERT
  WITH CHECK (
    get_current_user_role() = 'company_admin'
    AND get_employee_card_company_id(theme::jsonb) = get_current_user_company_id()
  );

-- Company Admin: Update employee cards for their company
-- Ensures they can only update cards belonging to their company
CREATE POLICY "Company Admin: Update company employee cards"
  ON employee_cards
  FOR UPDATE
  USING (
    get_current_user_role() = 'company_admin'
    AND get_employee_card_company_id(theme::jsonb) = get_current_user_company_id()
  )
  WITH CHECK (
    get_current_user_role() = 'company_admin'
    AND get_employee_card_company_id(theme::jsonb) = get_current_user_company_id()
  );

-- Company Admin: Delete employee cards for their company
CREATE POLICY "Company Admin: Delete company employee cards"
  ON employee_cards
  FOR DELETE
  USING (
    get_current_user_role() = 'company_admin'
    AND get_employee_card_company_id(theme::jsonb) = get_current_user_company_id()
  );

-- Public: View active employee cards (for public card pages)
-- This allows anyone to view active employee cards via their public_slug
CREATE POLICY "Public: View active employee cards"
  ON employee_cards
  FOR SELECT
  USING (is_active = true);

-- ============================================
-- STEP 5: Verify policies
-- ============================================
-- Test that policies are created
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
ORDER BY policyname;

