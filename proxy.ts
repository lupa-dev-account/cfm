import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'pt', 'fr', 'es', 'de', 'it', 'ru', 'zh', 'ja', 'ar'],

  // Used when no locale matches
  defaultLocale: 'en',

  localePrefix: 'always'
});

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(ar|de|en|es|fr|it|ja|pt|ru|zh)/:path*']
};
