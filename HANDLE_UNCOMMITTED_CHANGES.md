# Handle Uncommitted Changes

You have uncommitted changes that need to be handled before switching branches.

## Option 1: Stash Changes (Recommended if you want to keep them)

```bash
# Stash your local changes
git stash

# Switch to main
git checkout main

# Pull latest changes
git pull origin main

# (Optional) Apply stashed changes later
git stash pop
```

## Option 2: Discard Changes (If they're already merged)

If the changes in `app/[locale]/(auth)/home/page.tsx` are already in the merged PR, you can discard them:

```bash
# Discard local changes to that file
git checkout -- app/[locale]/(auth)/home/page.tsx

# Or discard all uncommitted changes
git checkout -- .

# Then switch to main
git checkout main

# Pull latest
git pull origin main
```

## Option 3: Commit Changes (If they're new work)

If these are new changes you want to keep:

```bash
# Stage and commit
git add app/[locale]/(auth)/home/page.tsx
git commit -m "fix: Additional changes to home page"

# Then switch to main
git checkout main
git pull origin main
```

## Check Current Status

First, see what branch you're on and what changes exist:

```bash
# Check current branch
git branch

# Check status
git status

# See what changed
git diff app/[locale]/(auth)/home/page.tsx
```

