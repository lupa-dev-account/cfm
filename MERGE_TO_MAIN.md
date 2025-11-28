# Merge PR to Main

## Option 1: Using GitHub CLI (Fastest)

Run in Git Bash:

```bash
# List open PRs to find the PR number
gh pr list

# Merge the PR (replace PR_NUMBER with actual number, or use --head dev)
gh pr merge dev --merge --delete-branch=false

# Or if you know the PR number:
gh pr merge PR_NUMBER --merge
```

## Option 2: Using GitHub Web Interface

1. Go to your repository on GitHub
2. Click on **"Pull requests"** tab
3. Find the PR from `dev` to `main`
4. Click on the PR
5. Scroll down and click **"Merge pull request"**
6. Choose merge type:
   - **"Create a merge commit"** (recommended) - preserves full history
   - **"Squash and merge"** - combines all commits into one
   - **"Rebase and merge"** - linear history
7. Click **"Confirm merge"**
8. (Optional) Delete the `dev` branch if you're done with it

## Option 3: Direct Merge via Git (if PR is already approved)

If the PR is approved and you want to merge directly:

```bash
# Switch to main
git checkout main

# Pull latest changes
git pull origin main

# Merge dev into main
git merge dev

# Push to main
git push origin main
```

## After Merging

1. Update your local main branch:
   ```bash
   git checkout main
   git pull origin main
   ```

2. (Optional) Delete local dev branch if you're done:
   ```bash
   git branch -d dev
   ```

3. (Optional) Delete remote dev branch:
   ```bash
   git push origin --delete dev
   ```

