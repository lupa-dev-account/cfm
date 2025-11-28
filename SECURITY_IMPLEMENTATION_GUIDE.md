# Security Implementation Guide

## Overview

This guide explains the authentication and authorization security implementation for the CFM platform.

## Security Model

### ✅ **Secure Implementation**

The application uses a **two-layer security approach**:

1. **Server-Side Protection (Primary)** - Next.js Middleware
2. **Client-Side Validation (Secondary)** - UI/UX enhancement

### Route Protection Strategy

#### 🔒 **Protected Routes** (Require Authentication)

- `/dashboard/admin/*` - Requires `super_admin` role
- `/dashboard/company/*` - Requires `company_admin` role  
- `/dashboard/employee/*` - Requires `employee` role

**How it works:**
- Middleware checks authentication **before** the page loads
- Validates session cookies server-side
- Verifies user role from database
- Redirects unauthorized users to `/signin`
- **Cannot be bypassed** - runs on server before any page code executes

#### 🌐 **Public Routes** (No Authentication Required)

- `/home` - Landing page
- `/card/*` - Public business card pages
- `/signin` - Login page
- `/signup` - Registration page
- `/` - Root (redirects to home)

**How it works:**
- Middleware allows these routes to pass through without auth checks
- Anyone can access these pages
- Perfect for sharing business cards publicly

---

## Implementation Details

### 1. Middleware (`middleware.ts`)

The middleware runs on **every request** before the page loads:

```typescript
// Server-side authentication check
const { data: { user } } = await supabase.auth.getUser();

// If no user, redirect to signin
if (!user) {
  return NextResponse.redirect(signInUrl);
}

// Verify role from database
const { data: userData } = await supabase
  .from("users")
  .select("role, company_id")
  .eq("id", user.id)
  .single();

// Role-based access control
if (path.startsWith('/dashboard/admin') && role !== 'super_admin') {
  // Redirect to appropriate dashboard
}
```

**Key Benefits:**
- ✅ Runs on server (cannot be bypassed)
- ✅ Validates session cookies
- ✅ Checks database for user role
- ✅ No content flash (redirects before page loads)
- ✅ Works even if JavaScript is disabled

### 2. Client-Side Checks (Dashboard Pages)

Dashboard pages still have client-side checks as a **backup** and for **UX**:

```typescript
useEffect(() => {
  async function checkAuth() {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "company_admin") {
      router.push("/signin");
      return;
    }
    setUser(currentUser);
    setLoading(false);
  }
  checkAuth();
}, [router]);
```

**Purpose:**
- Shows loading state while checking auth
- Provides better UX (smooth transitions)
- **Note:** Middleware already protects the route, this is just for UX

---

## Security Features

### ✅ **Session-Based Authentication**

- Uses Supabase Auth with secure HTTP-only cookies
- Sessions persist across browser sessions (if user checked "Remember me")
- Automatic token refresh handled by Supabase

### ✅ **Role-Based Access Control (RBAC)**

- Three roles: `super_admin`, `company_admin`, `employee`
- Each role has access to specific dashboard routes
- Users are automatically redirected to their appropriate dashboard

### ✅ **Server-Side Validation**

- All authentication checks happen on the server
- Database queries for user roles are server-side only
- No sensitive data exposed to client

### ✅ **Public Card Access**

- Business cards (`/card/[slug]`) are completely public
- No authentication required
- Perfect for sharing via QR codes, NFC, or links

---

## How It Works: User Flow

### Scenario 1: Authenticated User Accessing Dashboard

1. User navigates to `/dashboard/company`
2. **Middleware runs** (server-side):
   - Checks for auth cookie
   - Validates session with Supabase
   - Fetches user role from database
   - Verifies role matches route (`company_admin`)
3. ✅ **Access granted** - Page loads
4. Client-side check runs (for UX):
   - Fetches user data
   - Shows dashboard content

### Scenario 2: Unauthenticated User Accessing Dashboard

1. User navigates to `/dashboard/company`
2. **Middleware runs** (server-side):
   - No auth cookie found
   - ❌ **Access denied**
3. User redirected to `/signin?redirect=/dashboard/company`
4. After login, user redirected back to dashboard

### Scenario 3: Wrong Role Accessing Dashboard

1. `employee` user navigates to `/dashboard/admin`
2. **Middleware runs** (server-side):
   - User is authenticated ✅
   - But role is `employee`, not `super_admin` ❌
3. User redirected to `/dashboard/employee` (their correct dashboard)

### Scenario 4: Public Access to Card

1. Anyone navigates to `/card/john-doe`
2. **Middleware runs** (server-side):
   - Route is in public list ✅
   - No auth check needed
3. Card page loads (public access)

---

## Security Best Practices Implemented

### ✅ **Defense in Depth**

- Multiple layers of security (middleware + client checks)
- Server-side validation cannot be bypassed
- Client-side checks provide UX and backup

### ✅ **Principle of Least Privilege**

- Users only access routes appropriate for their role
- Automatic redirection to correct dashboard
- No privilege escalation possible

### ✅ **Secure Session Management**

- HTTP-only cookies (cannot be accessed via JavaScript)
- Secure cookie flags (HTTPS in production)
- Automatic session refresh
- Session invalidation on logout

### ✅ **No Information Leakage**

- Generic error messages (no email enumeration)
- No sensitive data in URLs
- Proper error handling

---

## Testing Security

### Test Cases

1. **Unauthenticated Access:**
   ```bash
   # Should redirect to /signin
   curl http://localhost:3000/dashboard/company
   ```

2. **Wrong Role:**
   - Login as `employee`
   - Try to access `/dashboard/admin`
   - Should redirect to `/dashboard/employee`

3. **Public Access:**
   ```bash
   # Should work without auth
   curl http://localhost:3000/card/test-slug
   ```

4. **Session Persistence:**
   - Login and check "Remember me"
   - Close browser
   - Reopen and navigate to dashboard
   - Should still be authenticated

---

## Configuration

### Environment Variables

Required in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Middleware Configuration

The middleware is configured to run on all routes except:
- Static files (`_next/static/*`)
- Images (`_next/image/*`)
- Favicon
- Public assets

See `middleware.ts` for the exact matcher configuration.

---

## Troubleshooting

### Issue: Users can still access protected routes

**Solution:** 
- Check that middleware is running (check server logs)
- Verify Supabase environment variables are set
- Ensure cookies are being set correctly

### Issue: Redirect loops

**Solution:**
- Check that `/signin` is in the public routes list
- Verify redirect logic in middleware
- Check for circular redirects in signin page

### Issue: Cards not accessible

**Solution:**
- Verify `/card/*` is in public routes
- Check that card pages don't have auth checks
- Ensure middleware allows public routes

---

## Summary

✅ **Your security model is CORRECT:**

- ✅ Company/dashboard pages require authentication
- ✅ Cards and home page are public
- ✅ Session cookies are validated server-side
- ✅ Role-based access control enforced
- ✅ Cannot be bypassed (server-side protection)

**The middleware implementation provides enterprise-grade security** that cannot be bypassed by disabling JavaScript or manipulating client-side code.

---

## Next Steps (Optional Enhancements)

1. **Rate Limiting:** Add rate limiting to prevent brute force attacks
2. **CSRF Protection:** Add CSRF tokens for form submissions
3. **Audit Logging:** Log all authentication attempts
4. **2FA:** Add two-factor authentication for admin users
5. **Session Timeout:** Implement automatic session timeout

---

**Last Updated:** 2024  
**Status:** ✅ Production Ready

