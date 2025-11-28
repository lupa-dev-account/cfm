# Authentication Fix Plan

## Overview
Fix UUID mismatches between Supabase Auth and database users, and update passwords to meet requirements.

## Issues to Fix
1. ✅ UUID mismatch: Auth user IDs don't match database user IDs
2. ✅ Password requirement: "admin" password is less than 6 characters
3. ✅ User sync: Ensure all Auth users have corresponding database records

## Step-by-Step Execution Plan

### Phase 1: Diagnostics
1. Check current database users and their UUIDs
2. Check Supabase Auth users and their UUIDs
3. Identify mismatches

### Phase 2: Fix UUID Mismatches
1. Get Auth UUIDs from Supabase Dashboard
2. Update database users to match Auth UUIDs
3. Or create database users with Auth UUIDs if they don't exist

### Phase 3: Update Passwords
1. Update passwords in Supabase Auth Dashboard
2. Ensure all passwords meet 6+ character requirement
3. Document new passwords

### Phase 4: Verification
1. Test login for each user role
2. Verify redirects work correctly
3. Check RLS policies allow access

## Files Created
- `scripts/fix-authentication.sql` - SQL script to fix UUID mismatches
- `scripts/update-passwords.md` - Instructions for updating passwords
- `AUTHENTICATION_FIX_PLAN.md` - This plan document

## Quick Reference

### Get Auth UUIDs
1. Supabase Dashboard → Authentication → Users
2. Click on each user
3. Copy the UUID shown

### Update Database Users
Run `scripts/fix-authentication.sql` in Supabase SQL Editor, replacing `AUTH_UUID_HERE` with actual UUIDs.

### Update Passwords
Follow instructions in `scripts/update-passwords.md`

### Test Login
- Super Admin: `admin@cfm.co.mz` / `admin123`
- Company Admin: `compadmin@cfm.co.mz` / `compadmin123`
- Employee: `agostinho@cfm.co.mz` / `agostinho123`








