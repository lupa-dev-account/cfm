# Deployment Guide

This document provides deployment instructions for the CFM application.

## GitHub Actions CI/CD

The project uses GitHub Actions for automated builds and deployments.

### Workflow

On every push to `main`:
1. Build and test the application
2. Run linter (continues on error)
3. Run tests (continues on error)
4. Security audit with npm audit
5. Check for exposed secrets
6. Prepare deployment artifacts

### Required GitHub Secrets

Add these in: `Settings > Secrets and variables > Actions`

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `NEXT_PUBLIC_APP_URL` - Your production app URL

### Manual Deployment Trigger

To manually trigger a deployment:
```bash
git commit --allow-empty -m "chore: trigger deployment"
git push origin main
```

## Vercel Deployment (Coming Soon)

Instructions for Vercel deployment will be added when ready.

## Environment Variables

Ensure all required environment variables are set:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL`

## Security Notes

- Never commit `.env.local` files
- Rotate service role keys if exposed
- Keep GitHub Secrets updated
- Monitor GitHub Actions logs for security warnings
