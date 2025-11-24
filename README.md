# CFM - Digital Business Cards Platform

A multi-tenant SaaS platform for managing digital business cards with NFC and QR code integration.

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account and project

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
   - Copy `.env.local.example` to `.env.local`
   - Fill in your Supabase credentials:
     - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
     - `NEXT_PUBLIC_APP_URL`: Your app URL (default: http://localhost:3000)

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000/login](http://localhost:3000/login) in your browser.

## Project Structure

```
/app
  /(auth)                    # Auth group routes
    /login                   # Login page
  /card/[slug]               # Public card page (future)
  /dashboard                 # Dashboard routes (future)
    /admin                   # Super admin
    /company                 # Company admin
    /employee                # Employee
  /api                       # API routes (future)
  /components
    /ui                      # Reusable UI components
    /auth                    # Auth-specific components
  /lib
    /supabase                # Supabase client & utilities
    /auth                    # Auth helpers
    /types                   # TypeScript types
    /utils                   # General utilities
  /styles                    # Global styles
/public
  /assets                    # Static assets
```

## Features

- **Landing/Login Page**: Single-page application with company branding and login form
- **Authentication**: Supabase Auth integration with role-based access control
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Type Safety**: Full TypeScript support

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form + Zod
- **Auth**: Supabase Auth
- **Icons**: Lucide React

## Next Steps

1. Set up Supabase database schema (companies, users, employee_cards, etc.)
2. Implement dashboard pages for each user role
3. Create public card page with NFC/QR integration
4. Add analytics tracking
5. Implement subscription management

## License

Private - All rights reserved

