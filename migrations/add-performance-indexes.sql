-- Migration: Add performance indexes for security and performance
-- These indexes improve query performance and help prevent DoS attacks via slow queries

-- Index on employee_cards.company_id (if not already added in previous migration)
-- This is critical for getEmployeesByCompany queries
CREATE INDEX IF NOT EXISTS idx_employee_cards_company_id 
ON employee_cards(company_id);

-- Index on employee_cards.public_slug for public card lookups
CREATE INDEX IF NOT EXISTS idx_employee_cards_public_slug 
ON employee_cards(public_slug);

-- Composite index for common query pattern (company_id + is_active)
CREATE INDEX IF NOT EXISTS idx_employee_cards_company_active 
ON employee_cards(company_id, is_active) 
WHERE is_active = true;

-- Index on users.email for authentication lookups
CREATE INDEX IF NOT EXISTS idx_users_email 
ON users(email);

-- Index on users.company_id for company-based queries
CREATE INDEX IF NOT EXISTS idx_users_company_id 
ON users(company_id);

-- Index on employee_cards.employee_id for employee lookups
CREATE INDEX IF NOT EXISTS idx_employee_cards_employee_id 
ON employee_cards(employee_id);

-- Index on employee_cards.created_at for sorting
CREATE INDEX IF NOT EXISTS idx_employee_cards_created_at 
ON employee_cards(created_at DESC);

-- Index on companies.slug for company lookups
CREATE INDEX IF NOT EXISTS idx_companies_slug 
ON companies(slug);

-- Verification: Check all indexes
-- SELECT 
--   schemaname,
--   tablename,
--   indexname,
--   indexdef
-- FROM pg_indexes
-- WHERE tablename IN ('employee_cards', 'users', 'companies')
-- ORDER BY tablename, indexname;

