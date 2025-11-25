# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CFM is a multi-tenant SaaS platform for managing digital business cards with NFC and QR code integration. Built with Next.js 14 (App Router), TypeScript, and Supabase.

## Common Commands

### Development
```bash
npm run dev         # Start development server (localhost:3000)
npm run build       # Production build
npm run start       # Start production server
npm run lint        # Run ESLint
```

## Architecture

### Authentication Flow

The app uses Supabase Auth with a custom role-based system:
1. Users authenticate via Supabase Auth (`supabase.auth.signInWithPassword`)
2. User roles are stored in the `users` table in the database
3. After authentication, the app fetches the user's role from the database
4. Users are redirected based on their role:
   - `super_admin` → `/dashboard/admin`
   - `company_admin` → `/dashboard/company`
   - `employee` → `/dashboard/employee`

**Important**: The Supabase Auth user ID must match the `id` field in the `users` table. If they don't match, authentication will fail with UUID mismatch errors.

### Supabase Client Pattern

The app uses two separate Supabase clients:
- **Server Client** (`lib/supabase/server.ts`): For Server Components and Server Actions using `@supabase/ssr` with cookie handling
- **Client Client** (`lib/supabase/client.ts`): For Client Components using `@supabase/ssr` browser client

Always use the appropriate client:
- Server Components: `import { createClient } from "@/lib/supabase/server"`
- Client Components: `import { createClient } from "@/lib/supabase/client"`

### Database Schema

The database follows a multi-tenant structure:

**Core Tables**:
- `companies`: Company accounts with subscription info
- `users`: User accounts with role-based access (`super_admin`, `company_admin`, `employee`)
- `employee_cards`: Digital business card data (linked to users)
- `company_services`: Services displayed on company cards
- `nfc_tags`: NFC tag associations for physical cards
- `analytics_events`: Tracking card interactions

**Important Relationships**:
- `users.id` must match Supabase Auth user ID
- `users.company_id` links users to companies
- `employee_cards.employee_id` links cards to users

### Route Structure

The app uses Next.js App Router with route groups:

```
app/
  (auth)/              # Auth route group (shared layout)
    login/
  dashboard/
    admin/             # Super admin dashboard
    company/           # Company admin dashboard
    employee/          # Employee dashboard
  page.tsx             # Root redirects to login
```

### Form Validation

Forms use React Hook Form with Zod for validation:
- Define schemas with `zod`
- Use `zodResolver` with `useForm`
- Example in `app/(auth)/login/page.tsx`

### Styling

- **Tailwind CSS**: All styling uses Tailwind utility classes
- **UI Components**: Located in `components/ui/`
- **Design System**: Mobile-first responsive design
- **Theme**: Uses green accent color (`text-green-600`, etc.)

### Type Safety

- **Path Aliases**: `@/*` maps to project root (configured in `tsconfig.json`)
- **Database Types**: Auto-generated types in `lib/types/database.ts` (should be kept in sync with Supabase schema)
- **Custom Types**: Defined in `lib/types/index.ts`

## Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
- `NEXT_PUBLIC_APP_URL`: Application URL (defaults to http://localhost:3000)

## Development Guidelines

### When Adding Auth-Protected Routes

1. Create the page component as a Client Component (`"use client"`)
2. Import `getCurrentUser` from `@/lib/auth/helpers`
3. Check authentication and role in `useEffect`
4. Redirect to `/login` if unauthorized
5. Show loading state while checking auth

Example pattern (see `app/dashboard/admin/page.tsx`):
```tsx
const [loading, setLoading] = useState(true);
useEffect(() => {
  async function checkAuth() {
    const user = await getCurrentUser();
    if (!user || user.role !== 'expected_role') {
      router.push('/login');
      return;
    }
    setLoading(false);
  }
  checkAuth();
}, []);
```

### When Working with Supabase Queries

- Always handle errors explicitly
- Use TypeScript types from `lib/types/database.ts`
- Remember that RLS (Row Level Security) policies may affect queries
- Use `.single()` for queries that should return one row

### When Adding New Database Tables

1. Create the table in Supabase
2. Update `lib/types/database.ts` with the new table types
3. Consider RLS policies for multi-tenant access control
