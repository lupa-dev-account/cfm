-- Add business_hours column to companies table
-- This allows all employees to share the same business hours

ALTER TABLE companies
ADD COLUMN IF NOT EXISTS business_hours JSONB;

-- Add a comment explaining the column
COMMENT ON COLUMN companies.business_hours IS 'Company-wide business hours shared by all employees. Format: {"monday": {"open": "08:00 AM", "close": "05:00 PM", "closed": false}, ...}';

-- Set business hours ONLY for CFM company (Monday-Friday 8AM-5PM, Weekend closed)
UPDATE companies
SET business_hours = '{
  "monday": {"open": "08:00 AM", "close": "05:00 PM", "closed": false},
  "tuesday": {"open": "08:00 AM", "close": "05:00 PM", "closed": false},
  "wednesday": {"open": "08:00 AM", "close": "05:00 PM", "closed": false},
  "thursday": {"open": "08:00 AM", "close": "05:00 PM", "closed": false},
  "friday": {"open": "08:00 AM", "close": "05:00 PM", "closed": false},
  "saturday": {"open": "", "close": "", "closed": true},
  "sunday": {"open": "", "close": "", "closed": true}
}'::jsonb
WHERE id = '181981fb-41c2-4d65-8313-2bada85b8012';  -- CFM company ID only
