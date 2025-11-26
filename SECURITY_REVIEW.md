# Security & Code Review - Pre-Production Checklist

**Review Date**: 2025-11-26
**Branch**: dev → main
**Reviewer**: Claude Code

---

## ✅ 1. SQL Injection Analysis

### Status: **SAFE** ✅

**Findings:**
- ✅ **All database queries use Supabase client** which provides parameterized queries by default
- ✅ **No raw SQL strings** found in the codebase
- ✅ **All user inputs are passed through Supabase's query builder**

**Evidence:**
```typescript
// lib/services/employees.ts - All queries use parameterized methods
await supabase
  .from("employee_cards")
  .select("*")
  .eq("employee_id", employeeId) // ✅ Parameterized
  .single();

// app/card/[slug]/page.tsx - Public slug lookup
await supabase
  .from("employee_cards")
  .select("*")
  .eq("public_slug", slug) // ✅ Parameterized
  .eq("is_active", true)
  .single();
```

**Recommendation:** ✅ No action needed - Supabase handles SQL injection prevention

---

## ⚠️ 2. XSS (Cross-Site Scripting) Analysis

### Status: **NEEDS ATTENTION** ⚠️

### Critical Findings:

#### **HIGH RISK** 🔴 - User-Controlled Content Rendering

**Location:** `app/card/[slug]/page.tsx`

**Issues:**
1. **Company Description** (Line 518-520):
   ```tsx
   <p className="text-gray-700 text-sm leading-relaxed text-center opacity-80">
     {company.description}  {/* ⚠️ No sanitization */}
   </p>
   ```
   - **Risk**: Admin-controlled, but could contain malicious HTML/scripts
   - **Impact**: Medium (requires admin compromise)

2. **Employee Name** (Line 504-506):
   ```tsx
   <h1 className="text-3xl font-bold text-gray-900 text-center mb-1">
     {card.name || "Unnamed Employee"}  {/* ⚠️ No sanitization */}
   </h1>
   ```
   - **Risk**: User input could contain HTML entities
   - **Impact**: Low (validated as text-only in form)

3. **Contact Information** (Lines 534-548):
   ```tsx
   <a href={href}>
     {children}  {/* ⚠️ Phone/Email displayed raw */}
   </a>
   ```
   - **Risk**: Email/phone could contain malicious strings
   - **Impact**: Low (validated format)

4. **Company Website URL** (Line 546-548):
   ```tsx
   <ContactItem icon={TbWorld} href={company.website_url} external>
     {company.website_url}  {/* ⚠️ URL displayed raw */}
   </ContactItem>
   ```
   - **Risk**: URL could be crafted to execute JavaScript (e.g., `javascript:alert('XSS')`)
   - **Impact**: **HIGH** 🔴

### **MEDIUM RISK** 🟡 - Third-Party Script Injection

**Location:** `app/layout.tsx`

**Issue:** Elfsight Widget Script
```tsx
<Script
  src="https://elfsightcdn.com/platform.js"
  strategy="afterInteractive"
/>
```
- **Risk**: Third-party script has full page access
- **Mitigation**: Using Next.js Script component with proper strategy
- **Recommendation**: Monitor Elfsight's security practices

### Recommended Fixes:

```typescript
// Install DOMPurify for HTML sanitization
// npm install dompurify
// npm install --save-dev @types/dompurify

// 1. Sanitize URLs
function sanitizeUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim().toLowerCase();
  if (trimmed.startsWith('javascript:') ||
      trimmed.startsWith('data:') ||
      trimmed.startsWith('vbscript:')) {
    return '';
  }
  return url;
}

// 2. Use in components
<ContactItem
  icon={TbWorld}
  href={sanitizeUrl(company.website_url)}
  external
>
  {company.website_url}
</ContactItem>

// 3. Add Content Security Policy
// In next.config.js:
headers: async () => [
  {
    source: '/:path*',
    headers: [
      {
        key: 'Content-Security-Policy',
        value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://elfsightcdn.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;"
      }
    ]
  }
]
```

---

## ✅ 3. Client-Side vs Server-Side Review

### **Correctly Placed - Client-Side** ✅

1. **Employee Form** (`app/components/dashboard/employee-form.tsx`)
   - ✅ `"use client"` - Correct (React Hook Form, state management)

2. **Card Page** (`app/card/[slug]/page.tsx`)
   - ✅ `"use client"` - Correct (dynamic rendering, state)

3. **Share Modal** (`app/components/card/share-modal.tsx`)
   - ✅ `"use client"` - Correct (QR generation, modal state)

### **Correctly Placed - Server-Side** ✅

1. **Employee Service** (`lib/services/employees.ts`)
   - ✅ Uses Supabase client-side SDK appropriately
   - ⚠️ **RECOMMENDATION**: Move to Server Actions for better security

### **NEEDS IMPROVEMENT** ⚠️

**Issue**: Database operations in client components

**Location:** `lib/services/employees.ts`

**Current:**
```typescript
// Client-side database access
import { createClient } from "@/lib/supabase/client";
```

**Recommended:** Create Server Actions
```typescript
// app/actions/employees.ts
'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createEmployeeAction(
  companyId: string,
  employeeData: EmployeeFormData
) {
  const supabase = createClient();
  // ... database logic
  revalidatePath('/dashboard/company');
  return data;
}
```

**Benefits:**
- ✅ Credentials stay server-side
- ✅ Better security (no exposed API keys)
- ✅ Reduced client bundle size

---

## 4. Authentication & Authorization

### **SECURE** ✅ with Recommendations

**Current Implementation:**
```typescript
// app/(auth)/signin/page.tsx
const { data: authData } = await supabase.auth.signInWithPassword({
  email: data.email,
  password: data.password,
});
```

**Issues Found:**
1. ⚠️ **Email Enumeration**: Error messages reveal if email exists
   ```typescript
   setError(authError.message || "Invalid email or password");
   // Better: setError("Invalid credentials")
   ```

2. ⚠️ **No Rate Limiting**: Multiple login attempts not throttled
   - **Recommendation**: Implement rate limiting at API level

3. ✅ **Password Handling**: Correctly handled by Supabase (hashed, salted)

---

## 5. Input Validation Summary

### **Phone Number** ✅
```typescript
const phoneValidation = z.string().refine(
  (phone) => {
    if (!phone) return false;
    return isValidPhoneNumber(phone);
  },
  { message: "Invalid phone number" }
);
```
- ✅ Uses `libphonenumber-js` for proper validation

### **Email** ✅
```typescript
const cfmEmailValidation = z.string().email().refine(
  (email) => {
    const domain = email.split("@")[1]?.toLowerCase();
    return domain === "cfm.com" || domain === "cfm.co.mz";
  },
  { message: "Email must end with @cfm.com or @cfm.co.mz" }
);
```
- ✅ Domain validation enforced
- ✅ Email format validated

### **Text Fields** ✅
```typescript
const textOnlyValidation = (fieldName: string) =>
  z.string().min(1, `${fieldName} is required`).refine(
    (value) => /^[a-zA-Z\s]+$/.test(value),
    { message: `${fieldName} can only contain letters and spaces` }
  );
```
- ✅ Prevents injection via names

---

## 6. File Upload Security

### **Status: NEEDS IMPROVEMENT** ⚠️

**Location:** `lib/services/employees.ts`

**Current Implementation:**
```typescript
const fileExt = file.name.split(".").pop();
const fileName = `${employeeId}/${Date.now()}.${fileExt}`;
```

**Issues:**
1. ⚠️ **No file type validation** - Could upload malicious files
2. ⚠️ **No file size limit enforced** in code (only client-side: 5MB)
3. ⚠️ **File extension trusted** - Could be spoofed

**Recommended Fix:**
```typescript
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function uploadEmployeePhoto(
  file: File,
  employeeId: string
): Promise<string> {
  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Only images allowed.');
  }

  // Validate file size
  if (file.size > MAX_SIZE) {
    throw new Error('File too large. Maximum 5MB.');
  }

  // Sanitize extension
  const ext = file.type.split('/')[1];
  const fileName = `${employeeId}/${Date.now()}.${ext}`;

  // ... rest of upload logic
}
```

---

## 7. Data Exposure

### **CRITICAL** 🔴 - getEmployeesByCompany Performance Issue

**Location:** `lib/services/employees.ts:264-291`

```typescript
export async function getEmployeesByCompany(
  companyId: string
): Promise<EmployeeWithCard[]> {
  // ⚠️ Fetches ALL employee cards, then filters client-side
  const { data } = await supabase
    .from("employee_cards")
    .select("*")
    .order("created_at", { ascending: false });

  // Filters in JavaScript
  return (data || []).filter((card) => {
    const theme = card.theme as any;
    return theme?.company_id === companyId;
  })
}
```

**Issues:**
1. 🔴 **Fetches all companies' data** - Privacy violation
2. 🔴 **Performance** - Scales poorly with data growth
3. 🔴 **Bandwidth waste** - Downloads unnecessary data

**Recommended Fix:**
Add `company_id` column to `employee_cards` table:

```sql
ALTER TABLE employee_cards ADD COLUMN company_id UUID REFERENCES companies(id);
UPDATE employee_cards SET company_id = (theme->>'company_id')::UUID;
CREATE INDEX idx_employee_cards_company_id ON employee_cards(company_id);
```

Then update query:
```typescript
const { data } = await supabase
  .from("employee_cards")
  .select("*")
  .eq("company_id", companyId) // ✅ Filter server-side
  .order("created_at", { ascending: false });
```

---

## 8. Environment Variables

### **Status: SECURE** ✅

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

- ✅ Using `NEXT_PUBLIC_` for client-exposed vars
- ✅ Anon key is safe for client (RLS protects data)
- ⚠️ **VERIFY**: Ensure RLS policies are enabled on all tables

---

## 9. Dependencies Audit

### **Vulnerabilities Found** ⚠️

```
5 vulnerabilities (2 low, 3 high)
```

**Action Required:**
```bash
npm audit
npm audit fix
```

**Note**: Some may be in dev dependencies (lower risk)

---

## 🧪 10. Recommended Tests

### **Critical Tests to Add:**

#### **1. Input Validation Tests**
```typescript
// __tests__/validation/employee-form.test.ts
import { describe, it, expect } from '@jest/globals';
import { phoneValidation, cfmEmailValidation } from '@/lib/validation';

describe('Employee Form Validation', () => {
  describe('Phone Validation', () => {
    it('accepts valid Mozambique number', () => {
      expect(phoneValidation.safeParse('+258841234567').success).toBe(true);
    });

    it('rejects invalid phone', () => {
      expect(phoneValidation.safeParse('123').success).toBe(false);
    });
  });

  describe('Email Validation', () => {
    it('accepts @cfm.com domain', () => {
      expect(cfmEmailValidation.safeParse('test@cfm.com').success).toBe(true);
    });

    it('rejects other domains', () => {
      expect(cfmEmailValidation.safeParse('test@gmail.com').success).toBe(false);
    });
  });
});
```

#### **2. XSS Prevention Tests**
```typescript
// __tests__/security/xss.test.ts
describe('XSS Prevention', () => {
  it('sanitizes malicious URLs', () => {
    const maliciousUrl = 'javascript:alert("XSS")';
    expect(sanitizeUrl(maliciousUrl)).toBe('');
  });

  it('allows valid HTTPS URLs', () => {
    const validUrl = 'https://example.com';
    expect(sanitizeUrl(validUrl)).toBe(validUrl);
  });
});
```

#### **3. Authentication Tests**
```typescript
// __tests__/auth/signin.test.ts
describe('Authentication', () => {
  it('prevents email enumeration', async () => {
    const response1 = await attemptLogin('exists@cfm.com', 'wrong');
    const response2 = await attemptLogin('notexists@cfm.com', 'wrong');
    expect(response1.error).toBe(response2.error); // Same error message
  });
});
```

#### **4. File Upload Tests**
```typescript
// __tests__/services/file-upload.test.ts
describe('File Upload', () => {
  it('rejects non-image files', async () => {
    const maliciousFile = new File([''], 'test.exe', { type: 'application/exe' });
    await expect(uploadEmployeePhoto(maliciousFile, 'id')).rejects.toThrow();
  });

  it('rejects oversized files', async () => {
    const largeFile = new File([new ArrayBuffer(10 * 1024 * 1024)], 'large.jpg');
    await expect(uploadEmployeePhoto(largeFile, 'id')).rejects.toThrow();
  });
});
```

---

## 📋 Pre-Production Checklist

### **MUST FIX Before Production** 🔴

- [ ] **Fix getEmployeesByCompany** - Add company_id column, update query
- [ ] **Implement URL sanitization** - Prevent javascript: URLs
- [ ] **Add file upload validation** - Type and size checks
- [ ] **Fix email enumeration** - Generic error messages
- [ ] **Run npm audit fix** - Patch security vulnerabilities

### **SHOULD FIX** 🟡

- [ ] **Move to Server Actions** - Better security architecture
- [ ] **Add rate limiting** - Prevent brute force
- [ ] **Add CSP headers** - Defense in depth
- [ ] **Create test suite** - Validation, XSS, auth tests
- [ ] **Add monitoring** - Error tracking (Sentry)

### **NICE TO HAVE** 🟢

- [ ] **Add CAPTCHA** - On login/signup
- [ ] **Implement 2FA** - For admin accounts
- [ ] **Add audit logging** - Track sensitive operations
- [ ] **Performance monitoring** - Lighthouse CI
- [ ] **E2E tests** - Playwright/Cypress

---

## 🎯 Deployment Recommendation

### **Current State**: ⚠️ **NOT READY** for production

### **Blockers**:
1. 🔴 **Data leakage in getEmployeesByCompany** - Must fix
2. 🔴 **XSS vulnerability in URLs** - Must fix
3. 🔴 **Unvalidated file uploads** - Security risk

### **Timeline to Production**:
- **Quick fixes** (2-4 hours): URL sanitization, file validation
- **Database migration** (1-2 hours): Add company_id column
- **Testing** (2-3 hours): Write critical tests
- **Total**: ~1 day of focused work

### **Minimal Viable Security** (Can deploy after):
✅ Fix getEmployeesByCompany
✅ Sanitize URLs
✅ Validate file uploads
✅ Run npm audit fix
✅ Write basic tests

---

## 📊 Risk Assessment

| Category | Risk Level | Impact | Likelihood |
|----------|-----------|--------|------------|
| SQL Injection | 🟢 Low | High | Very Low |
| XSS | 🟡 Medium | High | Medium |
| File Upload | 🟡 Medium | Medium | Low |
| Data Exposure | 🔴 High | High | High |
| Auth Bypass | 🟢 Low | Critical | Very Low |
| Dependency Vulns | 🟡 Medium | Varies | Medium |

**Overall Risk**: 🟡 **MEDIUM** (with critical issue to fix)

---

## 👤 Prepared By
Claude Code - AI Assistant
Review Date: November 26, 2025
