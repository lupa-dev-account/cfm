# 🚀 CFM Quick Start Guide

## ✅ All Tasks Completed!

Your CFM digital business card system is ready to test!

---

## 📍 Current Status

- ✅ Dev server running: **http://localhost:3001**
- ✅ Build successful (no errors)
- ✅ All features implemented
- ✅ TypeScript types updated
- ✅ Documentation created

---

## ⚡ Quick Actions

### 1. First: Run the Database Migration

**IMPORTANT**: Before testing, you must add the social media columns to your database.

1. **Open Supabase SQL Editor**:
   - Go to: https://supabase.com/dashboard/project/niivkjrhszjuyboqrirj/editor
   - Click "SQL Editor" → "New query"

2. **Run this SQL**:
   ```sql
   -- Add social media columns to companies table
   ALTER TABLE companies
   ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
   ADD COLUMN IF NOT EXISTS facebook_url TEXT,
   ADD COLUMN IF NOT EXISTS instagram_url TEXT;

   -- Update CFM company with data
   UPDATE companies
   SET
     name = 'CFM',
     description = 'Mozambican public company responsible for managing and operating the country''s ports and railways. Its mission is to provide integrated and efficient logistical solutions for goods and passengers, contributing to the economic development of Mozambique and the wider region.',
     footer_text = 'PORTOS E CAMINHOS DE FERRO DE MOÇAMBIQUE, E.P.',
     website_url = 'https://www.cfm.co.mz',
     linkedin_url = 'https://linkedin.com/company/cfm-mozambique',
     facebook_url = 'https://facebook.com/CFMMocambique',
     instagram_url = 'https://instagram.com/cfm_mozambique'
   WHERE name ILIKE '%CFM%' OR slug ILIKE '%cfm%';
   ```

3. **Click "Run"** (Ctrl+Enter)

---

### 2. Test the Application

#### Option A: Follow the Full Testing Guide
Open `TESTING_GUIDE.md` for comprehensive step-by-step testing instructions.

#### Option B: Quick Test (5 minutes)

1. **Test Company Settings**:
   - Go to: http://localhost:3001/dashboard/company/settings
   - Log in as company admin
   - Verify CFM data is loaded
   - Try editing and saving

2. **Test Employee Creation**:
   - Go to: http://localhost:3001/dashboard/company
   - Click "Add Employee"
   - Notice simplified form (no social media fields)
   - Create a test employee

3. **Test Employee Card**:
   - Copy the employee's public URL
   - Open in new tab/incognito
   - Verify company data appears correctly
   - Verify employee data appears correctly

---

## 📁 Important Files

| File | Purpose |
|------|---------|
| `TESTING_GUIDE.md` | Complete testing instructions |
| `IMPLEMENTATION_SUMMARY.md` | Technical details of what changed |
| `scripts/COPY_THIS_SQL.sql` | SQL to run in Supabase |
| `scripts/add-columns-automated.html` | Browser-based migration tool |
| `QUICK_START.md` | This file |

---

## 🔑 Key URLs

| URL | Purpose |
|-----|---------|
| http://localhost:3001 | Home page (redirects to login) |
| http://localhost:3001/login | Login page |
| http://localhost:3001/dashboard/company | Company admin dashboard |
| http://localhost:3001/dashboard/company/settings | ⭐ Company settings page (NEW!) |
| http://localhost:3001/card/[slug] | Employee business card |

---

## 🎯 What Changed

### Before:
- ❌ Company data hardcoded in card component
- ❌ Social media links stored per employee
- ❌ Duplicate data across all employee cards
- ❌ No easy way to update company info

### After:
- ✅ Company data centralized in `companies` table
- ✅ Social media links stored once, used everywhere
- ✅ Single source of truth
- ✅ Company Settings page for easy updates
- ✅ Changes apply to all cards instantly

---

## 📊 Architecture

```
companies table (company-wide data)
├── name, description, logo_url
├── website_url
├── linkedin_url, facebook_url, instagram_url (NEW!)
└── footer_text

company_services table (services)
├── title, description, icon_name
└── display_order

employee_cards table (employee-specific data)
├── name, title, photo_url
├── phone, email, whatsapp
└── business_hours
```

---

## 🛠️ Commands

```bash
# Development server (already running)
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Type checking
npm run lint
```

---

## ❓ Troubleshooting

### Issue: "Column not found" error
**Solution**: Run the SQL migration in Supabase Dashboard

### Issue: Company data not showing on cards
**Solution**:
1. Verify the SQL migration ran successfully
2. Check CFM company exists in `companies` table
3. Ensure social media columns have data

### Issue: Services not showing
**Solution**: Check `company_services` table has entries

### Issue: Card shows "Not found"
**Solution**: Ensure employee card is marked as `is_active = true`

---

## 📞 Support

If you encounter issues:

1. Check browser console for errors
2. Check dev server terminal for errors
3. Review `TESTING_GUIDE.md` for detailed instructions
4. Verify database migration ran successfully

---

## 🎉 Success Criteria

Your implementation is successful if:

- ✅ Company Settings page loads without errors
- ✅ Can create employees with simplified form
- ✅ Employee cards display company data dynamically
- ✅ Updating company settings affects all cards
- ✅ Build completes without errors
- ✅ No TypeScript errors

---

## 🚀 Next Steps

1. **Test the application** using TESTING_GUIDE.md
2. **Verify database migration** ran successfully
3. **Create test employees** and view their cards
4. **Update company settings** and see changes propagate
5. **Deploy to production** when ready!

---

## 📝 Summary of Files Created/Modified

### Created:
- ✨ `scripts/add-company-social-media.sql` - Migration SQL
- ✨ `scripts/run-migration.js` - Node.js migration runner
- ✨ `scripts/setup-cfm-data.js` - CFM data populator
- ✨ `scripts/add-columns-automated.html` - Browser migration tool
- ✨ `scripts/COPY_THIS_SQL.sql` - Easy copy-paste SQL
- ✨ `scripts/ADD_COLUMNS_INSTRUCTIONS.md` - Manual instructions
- ✨ `app/dashboard/company/settings/page.tsx` - Company settings page
- ✨ `components/ui/textarea.tsx` - Textarea component
- ✨ `IMPLEMENTATION_SUMMARY.md` - Technical documentation
- ✨ `TESTING_GUIDE.md` - Testing instructions
- ✨ `QUICK_START.md` - This file

### Modified:
- 📝 `lib/types/index.ts` - Added social media fields
- 📝 `app/card/[slug]/page.tsx` - Dynamic company data
- 📝 `app/components/dashboard/employee-form.tsx` - Simplified form
- 📝 `lib/services/employees.ts` - Optional social links
- 📝 `app/dashboard/company/page.tsx` - Added settings button
- 📝 `lib/supabase/server.ts` - Fixed TypeScript types

---

## ✨ Features

- 🏢 Centralized company data management
- 📱 Responsive digital business cards
- 🎨 Customizable company branding
- 🔗 Social media integration
- 🎯 Multi-tenant SaaS architecture
- ⚡ Real-time updates across all cards
- 🔒 Role-based access control
- 📊 Company services showcase
- 🌐 Public sharing via unique URLs

---

**Ready to test? Follow the instructions above!** 🎉
