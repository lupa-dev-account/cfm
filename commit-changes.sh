#!/bin/bash

# Script to commit changes while excluding sensitive files
# Run this in Git Bash: bash commit-changes.sh

echo "🔍 Checking git status..."
git status

echo ""
echo "📦 Staging files (excluding sensitive/temporary files)..."

# Stage the middleware file
git add proxy.ts

# Stage documentation files
git add CODE_REVIEW_REPORT.md
git add SECURITY_IMPLEMENTATION_GUIDE.md
git add MIDDLEWARE_TEST_GUIDE.md

# Stage image optimization fixes
git add "app/[locale]/(auth)/home/page.tsx"
git add "app/[locale]/(auth)/signin/page.tsx"
git add "app/[locale]/(auth)/signup/page.tsx"
git add "app/[locale]/card/[slug]/page.tsx"

echo ""
echo "✅ Files staged. Reviewing what will be committed..."
git status

echo ""
echo "📝 Ready to commit. Run the following command:"
echo ""
echo "git commit -m \"feat: Add server-side auth middleware and optimize images

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
- Better Core Web Vitals scores\""
echo ""
echo "Then push with: git push origin HEAD"
echo ""
echo "Or create a new branch first:"
echo "  git checkout -b feat/security-middleware-and-image-optimization"
echo "  git commit -m \"...\""
echo "  git push -u origin feat/security-middleware-and-image-optimization"

