# Create and Merge PR from dev to main

## Step 1: Create PR via GitHub Web

1. Go to: `https://github.com/lupa-dev-account/cfm/compare/main...dev`
2. Click **"Create pull request"**
3. Use this information:

**Title:**
```
fix: Resolve TypeScript error in getEmployeesByCompany function
```

**Description:**
```markdown
## Fix

- Resolve TypeScript type inference error in `getEmployeesByCompany` function
- Explicitly type Supabase query result array to fix 'never' type error
- Fixes Vercel build failure

## Changes

- `lib/services/employees.ts` - Fixed type inference issue

## Impact

- ✅ Vercel build will now succeed
- ✅ TypeScript compilation passes
- ✅ No functional changes, only type fix
```

4. Click **"Create pull request"**

## Step 2: Merge the PR

Once the PR is created:

1. On the PR page, click **"Merge pull request"**
2. Click **"Confirm merge"**

Or use GitHub CLI (if available in Git Bash):
```bash
gh pr list
gh pr merge PR_NUMBER --merge
```

