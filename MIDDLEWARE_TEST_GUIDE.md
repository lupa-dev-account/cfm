# Middleware Testing Guide

## Overview

This guide helps you test the combined i18n and authentication middleware in `proxy.ts`.

## Middleware Flow

1. **Root path** → Redirects to `/{locale}/home`
2. **i18n processing** → Handles locale routing
3. **Public routes** → Allow access without authentication
4. **Protected routes** → Require authentication and role verification

---

## Test Scenarios

### ✅ Test 1: Public Routes (Should Work Without Auth)

#### 1.1 Home Page
```bash
# Should work - no auth required
http://localhost:3000/en/home
http://localhost:3000/pt/home
```

**Expected:** Page loads successfully without redirect

#### 1.2 Public Card Pages
```bash
# Should work - no auth required
http://localhost:3000/en/card/john-doe
http://localhost:3000/pt/card/jane-smith
```

**Expected:** Card page loads successfully

#### 1.3 Sign In/Sign Up Pages
```bash
# Should work - no auth required
http://localhost:3000/en/signin
http://localhost:3000/en/signup
```

**Expected:** Auth pages load successfully

#### 1.4 Root Path
```bash
# Should redirect to default locale home
http://localhost:3000/
```

**Expected:** Redirects to `/{defaultLocale}/home` (e.g., `/en/home`)

---

### 🔒 Test 2: Protected Routes (Require Authentication)

#### 2.1 Unauthenticated Access to Dashboard

**Test:** Try to access dashboard without logging in

```bash
# Should redirect to signin
http://localhost:3000/en/dashboard/company
http://localhost:3000/en/dashboard/admin
http://localhost:3000/en/dashboard/employee
```

**Expected Behavior:**
- ❌ Cannot access dashboard
- ✅ Redirects to `/{locale}/signin?redirect=/dashboard/...`
- ✅ No content flash (redirect happens server-side)

**How to Test:**
1. Open browser in incognito/private mode
2. Navigate to `http://localhost:3000/en/dashboard/company`
3. Should immediately redirect to signin page
4. Check URL has `?redirect=` parameter

---

#### 2.2 Authenticated Access with Correct Role

**Test:** Login and access your dashboard

**Steps:**
1. Login as `company_admin` user
2. Navigate to `http://localhost:3000/en/dashboard/company`
3. Should load successfully ✅

**Expected:**
- ✅ Page loads without redirect
- ✅ User sees dashboard content
- ✅ No authentication errors

---

#### 2.3 Wrong Role Access (Role-Based Protection)

**Test:** User with wrong role tries to access protected route

**Scenario 1: Employee tries to access Admin Dashboard**
1. Login as `employee` user
2. Try to access `http://localhost:3000/en/dashboard/admin`
3. **Expected:** Redirects to `/en/dashboard/employee` (their correct dashboard)

**Scenario 2: Company Admin tries to access Employee Dashboard**
1. Login as `company_admin` user
2. Try to access `http://localhost:3000/en/dashboard/employee`
3. **Expected:** Redirects to `/en/dashboard/company` (their correct dashboard)

**Scenario 3: Super Admin tries to access Company Dashboard**
1. Login as `super_admin` user
2. Try to access `http://localhost:3000/en/dashboard/company`
3. **Expected:** Redirects to `/en/dashboard/admin` (their correct dashboard)

---

### 🌐 Test 3: Internationalization (i18n)

#### 3.1 Locale Prefix Handling

**Test:** Verify locale is preserved in redirects

```bash
# Login as company_admin, then try:
http://localhost:3000/pt/dashboard/company  # Portuguese
http://localhost:3000/en/dashboard/company   # English
http://localhost:3000/es/dashboard/company   # Spanish
```

**Expected:**
- ✅ Locale is preserved in redirects
- ✅ Signin redirect maintains locale: `/pt/signin`, `/en/signin`, etc.
- ✅ Dashboard redirects maintain locale

---

### 🔐 Test 4: Session Persistence

#### 4.1 Valid Session Cookie

**Test:** User with valid session cookie can access dashboard

**Steps:**
1. Login successfully
2. Close browser tab (but keep browser open)
3. Open new tab
4. Navigate to `http://localhost:3000/en/dashboard/company`

**Expected:**
- ✅ Should access dashboard without re-login
- ✅ Session cookie is valid
- ✅ No redirect to signin

#### 4.2 Invalid/Expired Session

**Test:** User with expired session

**Steps:**
1. Login successfully
2. Wait for session to expire (or manually clear cookies)
3. Try to access dashboard

**Expected:**
- ❌ Cannot access dashboard
- ✅ Redirects to signin page
- ✅ No error messages (clean redirect)

---

## Manual Testing Checklist

### Public Routes ✅
- [ ] `/en/home` loads without auth
- [ ] `/en/card/test-slug` loads without auth
- [ ] `/en/signin` loads without auth
- [ ] `/en/signup` loads without auth
- [ ] `/` redirects to `/{locale}/home`

### Protected Routes 🔒
- [ ] `/en/dashboard/company` redirects to signin when not authenticated
- [ ] `/en/dashboard/admin` redirects to signin when not authenticated
- [ ] `/en/dashboard/employee` redirects to signin when not authenticated

### Role-Based Access Control 👤
- [ ] `company_admin` can access `/dashboard/company`
- [ ] `company_admin` redirected from `/dashboard/admin` to `/dashboard/company`
- [ ] `employee` can access `/dashboard/employee`
- [ ] `employee` redirected from `/dashboard/admin` to `/dashboard/employee`
- [ ] `super_admin` can access `/dashboard/admin`
- [ ] `super_admin` redirected from `/dashboard/company` to `/dashboard/admin`

### Internationalization 🌐
- [ ] Locale preserved in redirects (`/pt/dashboard` → `/pt/signin`)
- [ ] All locales work correctly
- [ ] Default locale fallback works

### Session Management 🔐
- [ ] Valid session allows dashboard access
- [ ] Invalid session redirects to signin
- [ ] Session persists across browser tabs
- [ ] Logout clears session and redirects

---

## Browser DevTools Testing

### 1. Check Network Tab

**Test:** Verify redirects happen server-side

1. Open DevTools → Network tab
2. Navigate to `/en/dashboard/company` (without auth)
3. Look for:
   - ✅ Status code: `307` or `308` (redirect)
   - ✅ Location header: `/en/signin?redirect=...`
   - ✅ No page content loaded (redirect happens before page)

### 2. Check Cookies

**Test:** Verify session cookies are set

1. Open DevTools → Application → Cookies
2. Login successfully
3. Check for Supabase auth cookies:
   - `sb-<project-ref>-auth-token`
   - Should be `HttpOnly` and `Secure` (in production)

### 3. Disable JavaScript

**Test:** Verify middleware works without JavaScript

1. Disable JavaScript in browser settings
2. Try to access `/en/dashboard/company`
3. **Expected:** Still redirects to signin (server-side protection)

---

## Common Issues & Solutions

### Issue: Redirect Loop

**Symptoms:** Page keeps redirecting between signin and dashboard

**Possible Causes:**
1. Signin page is not in public routes list
2. Circular redirect logic
3. Session not being set properly

**Solution:**
- Verify `/signin` is in `publicRoutes` array
- Check that signin page doesn't redirect authenticated users incorrectly
- Verify Supabase cookie settings

### Issue: Locale Lost in Redirect

**Symptoms:** Redirect goes to `/signin` instead of `/en/signin`

**Solution:**
- Check locale extraction logic in middleware
- Verify `locale` variable is set correctly before redirect

### Issue: Middleware Not Running

**Symptoms:** Can access protected routes without auth

**Possible Causes:**
1. Middleware file not named correctly (`proxy.ts`)
2. Matcher config excludes the route
3. Environment variables not set

**Solution:**
- Verify file is named `proxy.ts` in root directory
- Check `matcher` config includes your routes
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set

---

## Automated Testing (Optional)

You can create automated tests using Playwright or Cypress:

```typescript
// Example Playwright test
import { test, expect } from '@playwright/test';

test('redirects unauthenticated user to signin', async ({ page }) => {
  await page.goto('http://localhost:3000/en/dashboard/company');
  await expect(page).toHaveURL(/\/en\/signin/);
});

test('allows authenticated company_admin to access dashboard', async ({ page }) => {
  // Login first
  await page.goto('http://localhost:3000/en/signin');
  await page.fill('input[type="email"]', 'admin@cfm.com');
  await page.fill('input[type="password"]', 'password');
  await page.click('button[type="submit"]');
  
  // Then access dashboard
  await page.goto('http://localhost:3000/en/dashboard/company');
  await expect(page).toHaveURL(/\/en\/dashboard\/company/);
});
```

---

## Verification Commands

### Check if middleware is running:

```bash
# Start dev server
npm run dev

# In another terminal, test with curl
curl -I http://localhost:3000/en/dashboard/company

# Should see:
# HTTP/1.1 307 Temporary Redirect
# Location: /en/signin?redirect=/en/dashboard/company
```

### Check environment variables:

```bash
# Verify env vars are set
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

---

## Success Criteria

✅ **Middleware is working correctly if:**

1. Public routes are accessible without authentication
2. Protected routes redirect to signin when not authenticated
3. Role-based access control works (wrong role → correct dashboard)
4. Locale is preserved in all redirects
5. Session cookies work correctly
6. No redirect loops occur
7. Server-side protection works (cannot be bypassed)

---

## Next Steps

After testing:

1. ✅ Fix any issues found
2. ✅ Update documentation if needed
3. ✅ Deploy to staging environment
4. ✅ Test in production-like environment
5. ✅ Monitor for errors in production

---

**Last Updated:** 2024  
**Status:** Ready for Testing

