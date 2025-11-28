#!/bin/bash

# Script to commit, push, and create PR
# Run this in Git Bash: bash create-pr.sh

set -e  # Exit on error

echo "🚀 Starting PR creation process..."
echo ""

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

# Get current branch name
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Current branch: $CURRENT_BRANCH"
echo ""

# Check for uncommitted changes
if [ -z "$(git status --porcelain)" ]; then
    echo "⚠️  No changes to commit"
    exit 0
fi

echo "📋 Current git status:"
git status --short
echo ""

# Ask for confirmation
read -p "Continue with commit? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Aborted"
    exit 1
fi

# Stage files (excluding sensitive/temporary files)
echo ""
echo "📦 Staging files..."
git add proxy.ts
git add CODE_REVIEW_REPORT.md
git add SECURITY_IMPLEMENTATION_GUIDE.md
git add MIDDLEWARE_TEST_GUIDE.md
git add "app/[locale]/(auth)/home/page.tsx"
git add "app/[locale]/(auth)/signin/page.tsx"
git add "app/[locale]/(auth)/signup/page.tsx"
git add "app/[locale]/card/[slug]/page.tsx"

echo "✅ Files staged"
echo ""

# Show what will be committed
echo "📝 Files to be committed:"
git status --short
echo ""

# Create feature branch if not already on one
FEATURE_BRANCH="feat/security-middleware-and-image-optimization"
if [ "$CURRENT_BRANCH" = "main" ] || [ "$CURRENT_BRANCH" = "master" ]; then
    echo "🌿 Creating feature branch: $FEATURE_BRANCH"
    git checkout -b "$FEATURE_BRANCH"
else
    FEATURE_BRANCH="$CURRENT_BRANCH"
    echo "📍 Using current branch: $FEATURE_BRANCH"
fi
echo ""

# Commit
echo "💾 Committing changes..."
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

echo "✅ Committed successfully"
echo ""

# Push to remote
echo "📤 Pushing to remote..."
git push -u origin "$FEATURE_BRANCH"

echo ""
echo "✅ Pushed successfully!"
echo ""

# Check if GitHub CLI is available
if command -v gh &> /dev/null; then
    echo "🔧 GitHub CLI detected. Creating PR..."
    gh pr create --title "feat: Add server-side auth middleware and optimize images" \
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

See \`MIDDLEWARE_TEST_GUIDE.md\` for testing instructions." \
        --base main
    
    echo ""
    echo "✅ Pull Request created!"
else
    echo "📝 GitHub CLI not found. Please create PR manually:"
    echo ""
    echo "   Visit: https://github.com/YOUR_USERNAME/YOUR_REPO/compare/main...$FEATURE_BRANCH"
    echo ""
    echo "   Or use: gh pr create (if you install GitHub CLI)"
fi

echo ""
echo "🎉 Done!"

