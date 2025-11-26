# Company Data Architecture - Implementation Summary

## Overview

Successfully refactored the CFM application to separate company-wide data from employee-specific data. This improves data consistency, reduces duplication, and makes the system more scalable for multi-tenant use.

---

## What Was Changed

### 1. Database Schema (Migration SQL)

**File**: `scripts/add-company-social-media.sql`

Added three new columns to the `companies` table:
- `linkedin_url` (TEXT) - Company LinkedIn profile
- `facebook_url` (TEXT) - Company Facebook page
- `instagram_url` (TEXT) - Company Instagram profile

**Action Required**: Run this SQL script in your Supabase database:
```bash
# Navigate to Supabase SQL Editor and run:
scripts/add-company-social-media.sql
```

---

### 2. TypeScript Types Updated

**File**: `lib/types/index.ts`

- Added social media fields to `Company` interface
- Updated `ContactLinks` comments to clarify employee-specific fields
- Deprecated `SocialLinks` (now company-wide, not employee-specific)
- Added `company` and `services` to `EmployeeWithCard` interface

---

### 3. Card Page - Now Fully Dynamic

**File**: `app/card/[slug]/page.tsx`

**Before**: Hardcoded CFM company data (logo, description, services, social links)

**After**: Dynamically fetches from database:
- Company logo and name from `companies.logo_url`, `companies.name`
- Company description from `companies.description`
- Company services from `company_services` table (with carousel)
- Company website from `companies.website_url`
- Company social media from `companies.linkedin_url`, `companies.facebook_url`, `companies.instagram_url`
- Footer text from `companies.footer_text`

**Employee-specific data** (still from `employee_cards`):
- Name, title, photo
- Phone, email, WhatsApp

---

### 4. Employee Form Simplified

**File**: `app/components/dashboard/employee-form.tsx`

**Removed fields**:
- ❌ LinkedIn (now company-wide)
- ❌ Facebook (now company-wide)
- ❌ Instagram (now company-wide)
- ❌ Website (now company-wide)

**Kept fields**:
- ✅ First Name, Last Name, Title
- ✅ Photo
- ✅ Email, Phone, WhatsApp (employee-specific)
- ✅ Business Hours (optional)
- ✅ Active Status

Added a helpful note directing admins to Company Settings for company-wide information.

---

### 5. Employee Service Updated

**File**: `lib/services/employees.ts`

- Made `socialLinks` optional in `EmployeeFormData`
- Provides default empty social links for backward compatibility
- No longer requires social links when creating/updating employees

---

### 6. New: Company Settings Page

**File**: `app/dashboard/company/settings/page.tsx`

A dedicated page for company admins to manage company-wide information:

**Editable Fields**:
- Company Name *
- Company Description (shown on all cards)
- Company Logo URL
- Footer Text (shown in header/footer)
- Website URL
- LinkedIn Profile URL
- Facebook Page URL
- Instagram Profile URL

**Features**:
- Real-time validation with Zod
- Success/error messages
- Navigation back to dashboard
- All changes apply to all employee cards instantly

**Access**: Navigate to `/dashboard/company/settings` or click "Company Settings" button in the navbar.

---

### 7. UI Components

**New File**: `components/ui/textarea.tsx`
- Created Textarea component for multi-line description input

**Updated File**: `app/dashboard/company/page.tsx`
- Added "Company Settings" button to navbar with Settings icon

---

## How to Use the New System

### For Company Admins

1. **Set Up Company Information** (One-time setup):
   - Go to Dashboard → Company Settings
   - Fill in company name, description, logo URL
   - Add company website and social media links
   - Save changes

2. **Add Employees**:
   - Go to Dashboard → Add Employee
   - Fill in employee-specific information only:
     - Name, title, photo
     - Personal phone, email, WhatsApp
   - Company information will automatically appear on their card

3. **Update Company Information**:
   - Changes made in Company Settings apply to ALL employee cards immediately
   - No need to update each employee card individually

### Data Ownership

| Data Type | Stored In | Managed By |
|-----------|-----------|------------|
| Company logo, description | `companies` table | Company Settings page |
| Company social media (LinkedIn, FB, IG) | `companies` table | Company Settings page |
| Company website | `companies` table | Company Settings page |
| Services | `company_services` table | (Future: Company Settings) |
| Employee name, title, photo | `employee_cards` table | Employee Form |
| Employee phone, email, WhatsApp | `employee_cards` table | Employee Form |
| Business hours | `employee_cards` table | Employee Form |

---

## Migration Steps

### Step 1: Run Database Migration
```sql
-- In Supabase SQL Editor:
-- Run scripts/add-company-social-media.sql
```

### Step 2: Populate Company Data
1. Go to `/dashboard/company/settings`
2. Fill in your company information:
   - Name: "CFM - Portos E Caminhos De Ferro De Moçambique"
   - Description: "Mozambican public company responsible for managing and operating the country's ports and railways..."
   - Logo URL: (upload your logo and paste the URL)
   - Website: "https://cfm.co.mz"
   - LinkedIn: "https://linkedin.com/company/cfm"
   - Facebook: "https://facebook.com/cfm"
   - Instagram: "https://instagram.com/cfm"
   - Footer Text: "PORTOS E CAMINHOS DE FERRO DE MOÇAMBIQUE, E.P."

### Step 3: (Optional) Add Company Services
Currently, services are fetched from `company_services` table. You can add services manually in the database, or we can create a services management UI in the Company Settings page.

Example services for CFM:
```sql
INSERT INTO company_services (company_id, title, description, icon_name, display_order)
VALUES
  ('your-company-id', 'Handling Of Cargo', 'Work with a view to improving our infrastructure.', '🏗️', 1),
  ('your-company-id', 'Transport Of Passengers', 'Daily trains on the Goba, Ressano Garcia and Limpopo lines.', '🚂', 2);
```

### Step 4: Test
1. Create a test employee
2. View their card at `/card/[slug]`
3. Verify company information appears correctly
4. Update company settings
5. Verify changes appear on employee card

---

## Benefits of This Architecture

### ✅ Single Source of Truth
- Company information stored once, used everywhere
- Update once, applies to all employee cards

### ✅ No Data Duplication
- Company logo, description, and social links no longer duplicated per employee
- Reduces database size and maintenance overhead

### ✅ Scalability
- Easy to add new employees without re-entering company data
- Perfect for multi-tenant SaaS architecture

### ✅ Simplified Employee Management
- Admins only enter employee-specific information
- Fewer fields = faster onboarding

### ✅ Consistency
- All cards have consistent company branding
- No risk of mismatched information across cards

### ✅ Flexibility
- Company can rebrand (logo, description) and all cards update instantly
- No need to update hundreds of employee records

---

## Future Enhancements

### Recommended Next Steps:

1. **Services Management UI**
   - Add CRUD interface for company services in Company Settings
   - Allow admins to add/edit/delete services without SQL

2. **Logo Upload**
   - Add direct image upload to Supabase Storage
   - Generate public URL automatically

3. **Company Themes**
   - Allow customization of brand colors
   - Store theme preferences in `companies` table

4. **Analytics**
   - Track which services are most viewed
   - Monitor card engagement

---

## Files Modified/Created

### Created:
- ✨ `scripts/add-company-social-media.sql`
- ✨ `app/dashboard/company/settings/page.tsx`
- ✨ `components/ui/textarea.tsx`
- ✨ `IMPLEMENTATION_SUMMARY.md` (this file)

### Modified:
- 📝 `lib/types/index.ts`
- 📝 `app/card/[slug]/page.tsx`
- 📝 `app/components/dashboard/employee-form.tsx`
- 📝 `lib/services/employees.ts`
- 📝 `app/dashboard/company/page.tsx`

---

## Support

If you encounter any issues:
1. Ensure the migration SQL script was run successfully
2. Check that your company has data in the new fields
3. Verify RLS policies allow reading from `companies` table
4. Check browser console for any errors

---

## Questions?

Feel free to ask if you need:
- Help setting up the database migration
- Additional features or modifications
- Clarification on any part of the implementation
- Assistance with testing

**Status**: ✅ All tasks completed successfully!
