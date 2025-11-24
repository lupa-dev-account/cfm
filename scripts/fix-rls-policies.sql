-- ============================================
-- FIX RLS POLICIES - Remove Infinite Recursion
-- ============================================
-- The issue is that helper functions query users table,
-- and policies also query users table, causing recursion.
-- This script fixes the policies to avoid recursion.

-- ============================================
-- STEP 1: Drop ALL existing policies that depend on helper functions
-- ============================================
-- Drop users table policies
DROP POLICY IF EXISTS "Super Admin: Full access to users" ON users;
DROP POLICY IF EXISTS "Company Admin: View own company users" ON users;
DROP POLICY IF EXISTS "Company Admin: Manage own company users" ON users;
DROP POLICY IF EXISTS "Users: View own profile" ON users;
DROP POLICY IF EXISTS "Users: Update own profile" ON users;

-- Drop companies table policies that depend on get_user_company_id
DROP POLICY IF EXISTS "Super Admin: Full access to companies" ON companies;
DROP POLICY IF EXISTS "Company Admin: View own company" ON companies;
DROP POLICY IF EXISTS "Company Admin: Update own company" ON companies;
DROP POLICY IF EXISTS "Employee: View own company" ON companies;
DROP POLICY IF EXISTS "Public: View companies" ON companies;

-- Drop company_services policies
DROP POLICY IF EXISTS "Super Admin: Full access to company_services" ON company_services;
DROP POLICY IF EXISTS "Company Admin: Manage own company services" ON company_services;
DROP POLICY IF EXISTS "Public: View company services" ON company_services;

-- Drop employee_cards policies
DROP POLICY IF EXISTS "Super Admin: Full access to employee_cards" ON employee_cards;
DROP POLICY IF EXISTS "Company Admin: Manage company employee cards" ON employee_cards;
DROP POLICY IF EXISTS "Employee: View own card" ON employee_cards;
DROP POLICY IF EXISTS "Employee: Update own card" ON employee_cards;
DROP POLICY IF EXISTS "Public: View active employee cards" ON employee_cards;

-- Drop nfc_tags policies
DROP POLICY IF EXISTS "Super Admin: Full access to nfc_tags" ON nfc_tags;
DROP POLICY IF EXISTS "Company Admin: Manage company nfc_tags" ON nfc_tags;
DROP POLICY IF EXISTS "Employee: View own nfc_tags" ON nfc_tags;

-- Drop analytics_events policies
DROP POLICY IF EXISTS "Super Admin: Full access to analytics" ON analytics_events;
DROP POLICY IF EXISTS "Company Admin: View company analytics" ON analytics_events;
DROP POLICY IF EXISTS "Employee: View own analytics" ON analytics_events;
DROP POLICY IF EXISTS "Public: Insert analytics events" ON analytics_events;

-- ============================================
-- STEP 2: Drop problematic helper functions
-- ============================================
DROP FUNCTION IF EXISTS get_user_role(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_user_company_id(UUID) CASCADE;

-- ============================================
-- STEP 3: Create new helper functions that don't cause recursion
-- ============================================
-- These functions use SECURITY DEFINER to bypass RLS
-- and use auth.uid() directly instead of querying users table

CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM users WHERE id = auth.uid()::uuid;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION get_current_user_company_id()
RETURNS UUID AS $$
  SELECT company_id FROM users WHERE id = auth.uid()::uuid;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================
-- STEP 4: Create fixed RLS policies for users table
-- ============================================
-- IMPORTANT: These policies use the SECURITY DEFINER functions
-- which bypass RLS, avoiding infinite recursion

-- Super Admin: Full access (uses SECURITY DEFINER function)
CREATE POLICY "Super Admin: Full access to users"
  ON users
  FOR ALL
  USING (get_current_user_role() = 'super_admin')
  WITH CHECK (get_current_user_role() = 'super_admin');

-- Company Admin: View and manage users in their company
CREATE POLICY "Company Admin: View own company users"
  ON users
  FOR SELECT
  USING (
    get_current_user_role() = 'company_admin'
    AND (
      id = auth.uid()::uuid
      OR company_id = get_current_user_company_id()
    )
  );

CREATE POLICY "Company Admin: Manage own company users"
  ON users
  FOR ALL
  USING (
    get_current_user_role() = 'company_admin'
    AND (
      id = auth.uid()::uuid
      OR company_id = get_current_user_company_id()
    )
  )
  WITH CHECK (
    get_current_user_role() = 'company_admin'
    AND (
      id = auth.uid()::uuid
      OR company_id = get_current_user_company_id()
    )
  );

-- Users: View and update their own profile
-- Simple direct comparison - no recursion
CREATE POLICY "Users: View own profile"
  ON users
  FOR SELECT
  USING (id = auth.uid()::uuid);

CREATE POLICY "Users: Update own profile"
  ON users
  FOR UPDATE
  USING (id = auth.uid()::uuid)
  WITH CHECK (id = auth.uid()::uuid);

-- ============================================
-- STEP 5: Fix other policies that might have recursion
-- ============================================

-- Fix companies policies (use SECURITY DEFINER functions)
CREATE POLICY "Super Admin: Full access to companies"
  ON companies
  FOR ALL
  USING (get_current_user_role() = 'super_admin');

CREATE POLICY "Company Admin: View own company"
  ON companies
  FOR SELECT
  USING (
    get_current_user_role() = 'company_admin'
    AND id = get_current_user_company_id()
  );

CREATE POLICY "Company Admin: Update own company"
  ON companies
  FOR UPDATE
  USING (
    get_current_user_role() = 'company_admin'
    AND id = get_current_user_company_id()
  );

CREATE POLICY "Employee: View own company"
  ON companies
  FOR SELECT
  USING (
    get_current_user_role() = 'employee'
    AND id = get_current_user_company_id()
  );

-- Public: Can view companies (for public card pages)
DROP POLICY IF EXISTS "Public: View companies" ON companies;
CREATE POLICY "Public: View companies"
  ON companies
  FOR SELECT
  USING (true);

-- ============================================
-- STEP 6: Verify policies are working
-- ============================================
-- Test query (should work for authenticated users)
-- SELECT * FROM users WHERE id = auth.uid();

