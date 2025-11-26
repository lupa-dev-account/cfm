# Pre-Production Deployment Summary

**Date**: November 26, 2025
**Branch**: dev → main
**Status**: ⚠️ **NEEDS FIXES BEFORE PRODUCTION**

---

## ✅ What's Been Completed

### 1. **Code Pushed to Dev** ✅
- All changes committed and pushed to `dev` branch
- Commit: `62b59fc` - "feat: add multilingual support, phone validation, and UI improvements"

### 2. **Comprehensive Security Review** ✅
- Full security audit completed
- Documented in `SECURITY_REVIEW.md`
- SQL injection: ✅ SAFE
- XSS: ⚠️ Issues found
- File uploads: ⚠️ Needs validation
- Data exposure: 🔴 CRITICAL issue found

### 3. **Test Suite Created** ✅
- Employee form validation tests
- XSS prevention tests
- File upload security tests
- Jest configuration added

---

## 🔴 CRITICAL BLOCKERS (Must Fix)

### 1. Data Leakage in `getEmployeesByCompany`
**File**: `lib/services/employees.ts:264-291`

**Issue**: Fetches ALL employee cards, then filters client-side
```typescript
// ❌ CURRENT (BAD)
const { data } = await supabase
  .from("employee_cards")
  .select("*")  // Gets ALL companies' data!
  .order("created_at", { ascending: false });

return data.filter((card) => {
  return card.theme?.company_id === companyId; // Filters in JS
})
```

**Fix Required**:
```sql
-- Add company_id column
ALTER TABLE employee_cards ADD COLUMN company_id UUID REFERENCES companies(id);
UPDATE employee_cards SET company_id = (theme->>'company_id')::UUID;
CREATE INDEX idx_employee_cards_company_id ON employee_cards(company_id);
```

```typescript
// ✅ NEW (GOOD)
const { data } = await supabase
  .from("employee_cards")
  .select("*")
  .eq("company_id", companyId)  // Filter server-side!
  .order("created_at", { ascending: false});
```

**Impact**: Privacy violation, performance issue, scales poorly

---

### 2. XSS Vulnerability - Malicious URLs
**File**: `app/card/[slug]/page.tsx:546-548`

**Issue**: URLs not sanitized, allows `javascript:` protocol
```typescript
// ❌ CURRENT (DANGEROUS)
<ContactItem icon={TbWorld} href={company.website_url} external>
  {company.website_url}
</ContactItem>
```

**Fix Required**:
```typescript
// Create sanitization function
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

// ✅ USE IT
<ContactItem icon={TbWorld} href={sanitizeUrl(company.website_url)} external>
  {company.website_url}
</ContactItem>
```

**Impact**: Potential XSS attack vector

---

### 3. Unvalidated File Uploads
**File**: `lib/services/employees.ts:30-61`

**Issue**: No file type or size validation on server
```typescript
// ❌ CURRENT (MISSING VALIDATION)
export async function uploadEmployeePhoto(file: File, employeeId: string) {
  const fileExt = file.name.split(".").pop(); // Trusts extension!
  // ... uploads without validation
}
```

**Fix Required**:
```typescript
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 5 * 1024 * 1024;

export async function uploadEmployeePhoto(file: File, employeeId: string) {
  // Validate type
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Only images allowed.');
  }

  // Validate size
  if (file.size > MAX_SIZE) {
    throw new Error('File too large. Maximum 5MB.');
  }

  const ext = file.type.split('/')[1];
  const fileName = `${employeeId}/${Date.now()}.${ext}`;
  // ... rest of upload
}
```

**Impact**: Security risk, could upload malicious files

---

## 🟡 HIGH PRIORITY (Should Fix)

### 4. Email Enumeration
**File**: `app/(auth)/signin/page.tsx:69`

**Issue**: Error messages reveal if email exists
```typescript
// ❌ CURRENT
setError(authError.message || "Invalid email or password");
```

**Fix**:
```typescript
// ✅ BETTER
setError("Invalid credentials");  // Generic message
```

### 5. Dependency Vulnerabilities
```
5 vulnerabilities (2 low, 3 high)
```

**Fix**:
```bash
npm audit
npm audit fix
```

### 6. Move to Server Actions
Current: Database operations in client components
Better: Use Server Actions for security

---

## 🟢 NICE TO HAVE (Future Improvements)

1. **Rate Limiting** - Prevent brute force attacks
2. **Content Security Policy** - Add CSP headers
3. **CAPTCHA** - On login/signup forms
4. **2FA** - For admin accounts
5. **Audit Logging** - Track sensitive operations
6. **E2E Tests** - Playwright/Cypress
7. **Monitoring** - Sentry/DataDog for errors

---

## 📋 Action Plan

### **Phase 1: Critical Fixes** (4-6 hours) 🔴
- [ ] **Step 1**: Add `company_id` column to `employee_cards` table
- [ ] **Step 2**: Update `getEmployeesByCompany` to filter server-side
- [ ] **Step 3**: Implement URL sanitization function
- [ ] **Step 4**: Add file upload validation
- [ ] **Step 5**: Run `npm audit fix`
- [ ] **Step 6**: Test all critical paths

### **Phase 2: High Priority** (2-3 hours) 🟡
- [ ] Fix email enumeration
- [ ] Generic error messages
- [ ] Test authentication flow

### **Phase 3: Testing** (2-3 hours) 🧪
- [ ] Run test suite: `npm test`
- [ ] Manual testing of:
  - Employee creation with validation
  - Card viewing with sanitized URLs
  - File upload with type checking
  - Multi-language switching

### **Phase 4: Deploy to Main** ✅
- [ ] Create PR from dev → main
- [ ] Code review
- [ ] Merge to main
- [ ] Deploy to production
- [ ] Monitor for errors

---

## 🎯 Deployment Decision

### **Current State**: ⚠️ **NOT READY FOR PRODUCTION**

### **Why?**
1. 🔴 **Data leakage** - Fetching all companies' data
2. 🔴 **XSS vulnerability** - Malicious URLs possible
3. 🔴 **Unvalidated uploads** - Security risk

### **When Can We Deploy?**

✅ **MINIMUM VIABLE SECURITY** (After Phase 1):
- Fix getEmployeesByCompany (database migration)
- Implement URL sanitization
- Add file upload validation
- Patch npm vulnerabilities
- Run basic tests

**Estimated Time**: 4-6 hours of focused work

---

## 📊 Risk Assessment

| Issue | Risk | Impact | Effort | Priority |
|-------|------|--------|--------|----------|
| Data Leakage | 🔴 High | Critical | 2h | **MUST FIX** |
| XSS - URLs | 🟡 Medium | High | 30m | **MUST FIX** |
| File Uploads | 🟡 Medium | Medium | 1h | **MUST FIX** |
| Email Enum | 🟢 Low | Low | 15m | Should Fix |
| Dependencies | 🟡 Medium | Varies | 30m | Should Fix |

---

## 🛠️ Quick Fix Scripts

### Fix 1: Database Migration
```sql
-- Run in Supabase SQL Editor
BEGIN;

ALTER TABLE employee_cards
  ADD COLUMN company_id UUID REFERENCES companies(id);

UPDATE employee_cards
  SET company_id = (theme->>'company_id')::UUID
  WHERE theme->>'company_id' IS NOT NULL;

CREATE INDEX idx_employee_cards_company_id
  ON employee_cards(company_id);

COMMIT;
```

### Fix 2: URL Sanitization
```typescript
// Add to lib/utils/security.ts
export function sanitizeUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim().toLowerCase();
  const dangerous = ['javascript:', 'data:', 'vbscript:', 'file:'];
  for (const protocol of dangerous) {
    if (trimmed.startsWith(protocol)) return '';
  }
  return url.trim();
}
```

### Fix 3: File Validation
```typescript
// Update lib/services/employees.ts
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 5 * 1024 * 1024;

if (!ALLOWED_TYPES.includes(file.type)) {
  throw new Error('Invalid file type');
}
if (file.size > MAX_SIZE) {
  throw new Error('File too large');
}
```

---

## ✅ Testing Checklist

Before deploying to production:

- [ ] Employee creation works with new validation
- [ ] Phone numbers validated correctly (all countries)
- [ ] Email domain validation (@cfm.com/@cfm.co.mz)
- [ ] Text fields reject numbers/special chars
- [ ] Language switcher appears and functions
- [ ] URLs sanitized (test javascript: protocol)
- [ ] File uploads validated
- [ ] Cards display correctly
- [ ] QR codes generate with new logo
- [ ] Border radius visible on cards
- [ ] Mobile responsive design works
- [ ] No console errors
- [ ] Performance acceptable (<3s load time)

---

## 📞 Next Steps

1. **Review this document** with team
2. **Prioritize fixes** based on timeline
3. **Execute Phase 1** (critical fixes)
4. **Test thoroughly**
5. **Create PR** to main
6. **Deploy to production**
7. **Monitor** for 24-48 hours

---

## 📄 Related Documents

- `SECURITY_REVIEW.md` - Detailed security analysis
- `__tests__/` - Test suite
- `CLAUDE.md` - Project documentation

---

## 👤 Prepared By
Claude Code - AI Assistant
Date: November 26, 2025

**Recommendation**: Allocate 1 full day for critical fixes before production deployment.
