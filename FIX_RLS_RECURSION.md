# Fix RLS Infinite Recursion Error

## Problem
Error: `infinite recursion detected in policy for relation "users"`

This happens because the RLS policies use helper functions that query the `users` table, which triggers the policies again, creating an infinite loop.

## Solution

Run the SQL script `scripts/fix-rls-policies.sql` in Supabase SQL Editor.

This script will:
1. Drop the problematic policies and functions
2. Create new helper functions that use `SECURITY DEFINER` to bypass RLS
3. Create simplified policies that avoid recursion

## Quick Fix Steps

1. **Open Supabase SQL Editor**
2. **Copy and paste the entire contents of `scripts/fix-rls-policies.sql`**
3. **Run the script**
4. **Test login again**

## What Changed

- Removed `get_user_role(user_id)` and `get_user_company_id(user_id)` functions
- Created `get_current_user_role()` and `get_current_user_company_id()` that use `auth.uid()` directly
- Simplified policies to use direct comparisons instead of nested queries
- Used `SECURITY DEFINER` to bypass RLS in helper functions

## After Running the Fix

Try logging in again:
- Email: `compadmin@cfm.co.mz`
- Password: `compadmin123`

The error should be resolved!

