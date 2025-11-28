# Create PR from dev to main

Since you've already pushed to `dev`, just create the PR:

## Option 1: Using GitHub CLI (Fastest)

Run in Git Bash:

```bash
gh pr create --base main --head dev \
  --title "feat: Add server-side auth middleware and optimize images" \
  --body "## Changes

- ✅ Added server-side authentication middleware in \`proxy.ts\`
- ✅ Implemented route protection for dashboard routes
- ✅ Added role-based access control
- ✅ Fixed Next.js Image warnings across all pages
- ✅ Optimized images with proper \`sizes\` prop
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

See \`MIDDLEWARE_TEST_GUIDE.md\` for testing instructions.

## Files Changed

- \`proxy.ts\` - Middleware implementation
- Image optimization fixes in 4 page files
- 3 new documentation files"
```

## Option 2: Using GitHub Web Interface

1. Go to your repository on GitHub
2. Click on **"Pull requests"** tab
3. Click **"New pull request"**
4. Set:
   - **base:** `main`
   - **compare:** `dev`
5. Click **"Create pull request"**
6. Use this title and description:

**Title:**
```
feat: Add server-side auth middleware and optimize images
```

**Description:**
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

## Files Changed

- `proxy.ts` - Middleware implementation
- Image optimization fixes in 4 page files
- 3 new documentation files
```

7. Click **"Create pull request"**

## After Creating PR

1. Review the changes in the PR
2. Wait for CI/CD checks (if any)
3. Get approval (if required)
4. Merge to `main` when ready

