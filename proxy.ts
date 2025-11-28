import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/request';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/lib/types/database';

const intlMiddleware = createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale,

  // Always use locale prefix
  localePrefix: 'always'
});

/**
 * Combined middleware for i18n and authentication
 * 
 * Flow:
 * 1. Handle root path redirect
 * 2. Run i18n middleware (handles locale routing)
 * 3. Check authentication for protected routes
 * 
 * Protected routes:
 * - /dashboard/* - Requires authentication and appropriate role
 * 
 * Public routes:
 * - /home - Public landing page
 * - /card/* - Public card pages
 * - /signin, /signup - Public auth pages
 */
export default async function middleware(request: NextRequest) {
  // Handle root path - redirect to default locale home
  if (request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL(`/${defaultLocale}/home`, request.url));
  }

  // First, run i18n middleware to handle locale routing
  const intlResponse = intlMiddleware(request);
  
  // If i18n middleware returns a redirect (e.g., missing locale), return it immediately
  if (intlResponse.status === 307 || intlResponse.status === 308 || intlResponse.status === 301 || intlResponse.status === 302) {
    return intlResponse;
  }
  
  // Extract locale from pathname (after i18n middleware processing)
  const pathname = request.nextUrl.pathname;
  const localeMatch = pathname.match(/^\/([a-z]{2})(\/|$)/);
  const locale = localeMatch ? localeMatch[1] : defaultLocale;
  const pathWithoutLocale = locale 
    ? pathname.replace(`/${locale}`, '') || '/'
    : pathname;

  // Define public routes that don't require authentication
  const publicRoutes = [
    '/home',
    '/card',
    '/signin',
    '/signup',
    '/', // root (already handled above)
  ];

  // Check if route is public
  const isPublicRoute = publicRoutes.some(route => 
    pathWithoutLocale === route || pathWithoutLocale.startsWith(`${route}/`)
  );

  // If it's a public route, allow access (return i18n response)
  if (isPublicRoute) {
    return intlResponse;
  }

  // Protected routes require authentication
  if (pathWithoutLocale.startsWith('/dashboard')) {
    let response = intlResponse || NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    // Create Supabase client for server-side auth check
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            request.cookies.set({
              name,
              value,
              ...options,
            });
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            response.cookies.set({
              name,
              value,
              ...options,
            });
          },
          remove(name: string, options: any) {
            request.cookies.set({
              name,
              value: '',
              ...options,
            });
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            response.cookies.set({
              name,
              value: '',
              ...options,
            });
          },
        },
      }
    );

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    // If no user or auth error, redirect to signin
    if (!user || authError) {
      const signInUrl = new URL(
        `/${locale}/signin`,
        request.url
      );
      signInUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Fetch user role from database
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role, company_id")
      .eq("id", user.id)
      .single();

    // If user not found in database, redirect to signin
    if (userError || !userData) {
      const signInUrl = new URL(
        `/${locale}/signin`,
        request.url
      );
      signInUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(signInUrl);
    }

    const userRole = (userData as any).role;

    // Role-based route protection
    if (pathWithoutLocale.startsWith('/dashboard/admin')) {
      if (userRole !== 'super_admin') {
        // Redirect to appropriate dashboard based on role
        const redirectPath = getDashboardPath(userRole, locale);
        return NextResponse.redirect(new URL(redirectPath, request.url));
      }
    } else if (pathWithoutLocale.startsWith('/dashboard/company')) {
      if (userRole !== 'company_admin') {
        const redirectPath = getDashboardPath(userRole, locale);
        return NextResponse.redirect(new URL(redirectPath, request.url));
      }
    } else if (pathWithoutLocale.startsWith('/dashboard/employee')) {
      if (userRole !== 'employee') {
        const redirectPath = getDashboardPath(userRole, locale);
        return NextResponse.redirect(new URL(redirectPath, request.url));
      }
    }

    // Add user info to headers for use in pages (optional)
    response.headers.set('x-user-id', user.id);
    response.headers.set('x-user-role', userRole);
    
    return response;
  }

  // For all other routes, return i18n response
  return intlResponse;
}

/**
 * Get the appropriate dashboard path based on user role
 */
function getDashboardPath(role: string, locale: string): string {
  const basePath = `/${locale}`;
  
  switch (role) {
    case 'super_admin':
      return `${basePath}/dashboard/admin`;
    case 'company_admin':
      return `${basePath}/dashboard/company`;
    case 'employee':
      return `${basePath}/dashboard/employee`;
    default:
      return `${basePath}/signin`;
  }
}

export const config = {
  // Match all pathnames except for
  // - api routes
  // - _next (internal Next.js routes)
  // - static files
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
