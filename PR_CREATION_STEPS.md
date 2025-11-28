# Create PR and Merge to Main - Step by Step

## Quick Method (Using Script)

1. **Open Git Bash** in your project directory
2. **Run the script:**
   ```bash
   bash create-pr.sh
   ```
3. **Follow the prompts** - it will:
   - Stage the files
   - Create a feature branch
   - Commit the changes
   - Push to remote
   - Create PR (if GitHub CLI is installed)

## Manual Method (Step by Step)

### Step 1: Open Git Bash
Navigate to your project:
```bash
cd /c/Users/EricMbarushimana/code/lupa/cfm
```

### Step 2: Check Status
```bash
git status
```

### Step 3: Create Feature Branch
```bash
git checkout -b feat/security-middleware-and-image-optimization
```

### Step 4: Stage Files
```bash
git add proxy.ts
git add CODE_REVIEW_REPORT.md
git add SECURITY_IMPLEMENTATION_GUIDE.md
git add MIDDLEWARE_TEST_GUIDE.md
git add "app/[locale]/(auth)/home/page.tsx"
git add "app/[locale]/(auth)/signin/page.tsx"
git add "app/[locale]/(auth)/signup/page.tsx"
git add "app/[locale]/card/[slug]/page.tsx"
```

### Step 5: Verify Staged Files
```bash
git status
```

### Step 6: Commit
```bash
git commit -m "feat: Add server-side auth middleware and optimize images

- Add combined i18n and authentication middleware in proxy.ts
- Implement server-side route protection for dashboard routes
- Add role-based access control with locale-aware redirects
- Fix Next.js Image warnings across all pages
- Add sizes prop for responsive image optimization
- Optimize LCP images with priority and eager loading
- Add comprehensive code review and security documentation

Security:
- Server-side authentication checks cannot be bypassed
- Public routes (home, cards) remain accessible
- Protected routes require authentication and correct role

Performance:
- Improved image loading with proper sizes prop
- Optimized LCP with priority images
- Better Core Web Vitals scores"
```

### Step 7: Push to Remote
```bash
git push -u origin feat/security-middleware-and-image-optimization
```

### Step 8: Create Pull Request

#### Option A: Using GitHub Web Interface
1. Go to your repository on GitHub
2. You should see a banner: "feat/security-middleware-and-image-optimization had recent pushes"
3. Click **"Compare & pull request"**
4. Fill in the PR details:
   - **Title:** `feat: Add server-side auth middleware and optimize images`
   - **Description:**
     ```markdown
     ## Changes
     
     - ✅ Added server-side authentication middleware in `proxy.ts`
     - ✅ Implemented route protection for dashboard routes
     - ✅ Added role-based access control
     - ✅ Fixed Next.js Image warnings across all pages
     - ✅ Optimized images with proper `sizes` prop
     - ✅ Improved LCP with priority images
     
     ## Security Improvements
     
     - Server-side authentication checks (cannot be bypassed)
     - Public routes remain accessible (home, cards)
     - Protected routes require authentication and correct role
     
     ## Performance Improvements
     
     - Better image loading with responsive sizes
     - Optimized LCP scores
     - Improved Core Web Vitals
     
     ## Testing
     
     See `MIDDLEWARE_TEST_GUIDE.md` for testing instructions.
     ```
5. Click **"Create pull request"**

#### Option B: Using GitHub CLI
```bash
gh pr create --title "feat: Add server-side auth middleware and optimize images" \
  --body "## Changes

- ✅ Added server-side authentication middleware
- ✅ Implemented route protection
- ✅ Fixed Next.js Image warnings
- ✅ Optimized images

See MIDDLEWARE_TEST_GUIDE.md for testing." \
  --base main
```

### Step 9: Review and Merge

1. **Review the PR** on GitHub
2. **Run tests** (if you have CI/CD)
3. **Get approval** (if required)
4. **Merge the PR:**
   - Click **"Merge pull request"**
   - Choose merge type (usually "Create a merge commit")
   - Click **"Confirm merge"**
5. **Delete the feature branch** (optional, GitHub will prompt)

### Step 10: Update Local Main Branch
```bash
git checkout main
git pull origin main
```

## PR Title and Description Template

**Title:**
```
feat: Add server-side auth middleware and optimize images
```

**Description:**
```markdown
## 🎯 Summary
This PR adds server-side authentication middleware and optimizes image loading across the application.

## ✨ Changes

### Security
- ✅ Added combined i18n and authentication middleware in `proxy.ts`
- ✅ Implemented server-side route protection for `/dashboard/*` routes
- ✅ Added role-based access control (super_admin, company_admin, employee)
- ✅ Public routes remain accessible: `/home`, `/card/*`, `/signin`, `/signup`

### Performance
- ✅ Fixed Next.js Image warnings across all pages
- ✅ Added `sizes` prop for responsive image optimization
- ✅ Optimized LCP images with `priority` and `loading="eager"`
- ✅ Improved Core Web Vitals scores

### Documentation
- ✅ Added comprehensive code review report
- ✅ Added security implementation guide
- ✅ Added middleware testing guide

## 🔒 Security Impact
- Server-side authentication checks cannot be bypassed
- Routes are protected before page code executes
- Role-based access control enforced at middleware level

## 🚀 Performance Impact
- Better image loading performance
- Improved LCP (Largest Contentful Paint) scores
- Reduced layout shifts

## 🧪 Testing
See `MIDDLEWARE_TEST_GUIDE.md` for detailed testing instructions.

## 📝 Files Changed
- `proxy.ts` - Middleware implementation
- Image optimization fixes in 4 page files
- 3 new documentation files

## ✅ Checklist
- [x] Code follows project style guidelines
- [x] Documentation updated
- [x] No sensitive information committed
- [x] Images optimized
- [x] Security improvements tested
```

## Troubleshooting

### If push fails:
```bash
# Check remote
git remote -v

# If remote not set:
git remote add origin YOUR_REPO_URL
```

### If branch already exists:
```bash
# Delete local branch
git branch -D feat/security-middleware-and-image-optimization

# Delete remote branch
git push origin --delete feat/security-middleware-and-image-optimization

# Then create again
git checkout -b feat/security-middleware-and-image-optimization
```

### If you need to amend commit:
```bash
git commit --amend -m "New message"
git push --force-with-lease
```

