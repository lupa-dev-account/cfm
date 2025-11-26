-- ============================================
-- FIX EMPLOYEE_CARDS FOREIGN KEY CONSTRAINT
-- ============================================
-- This script checks and removes the foreign key constraint
-- on employee_cards.employee_id since employees don't need
-- to be users in the users table

-- ============================================
-- STEP 1: Check existing foreign key constraints
-- ============================================
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'employee_cards'
    AND kcu.column_name = 'employee_id';

-- ============================================
-- STEP 2: Drop the foreign key constraint
-- ============================================
-- Drop the constraint (the error message tells us it's named employee_cards_employee_id_fkey)
ALTER TABLE employee_cards DROP CONSTRAINT IF EXISTS employee_cards_employee_id_fkey;

-- Also try dropping any other possible constraint names
DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    FOR constraint_record IN
        SELECT conname
        FROM pg_constraint
        WHERE conrelid = 'employee_cards'::regclass
        AND confrelid != 0
        AND conname LIKE '%employee_id%'
    LOOP
        EXECUTE format('ALTER TABLE employee_cards DROP CONSTRAINT IF EXISTS %I', constraint_record.conname);
        RAISE NOTICE 'Dropped constraint: %', constraint_record.conname;
    END LOOP;
END $$;

-- ============================================
-- STEP 3: Verify the constraint is removed
-- ============================================
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'employee_cards'
    AND kcu.column_name = 'employee_id';

-- If the query above returns no rows, the foreign key has been successfully removed.

