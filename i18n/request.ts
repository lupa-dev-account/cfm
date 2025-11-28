import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

// Can be imported from a shared config
export const locales = ['en', 'pt', 'es', 'fr', 'de', 'it', 'zh', 'ja', 'ar', 'ru'] as const;
export const defaultLocale = 'en' as const;

// Type for valid locales
export type Locale = typeof locales[number];

export default getRequestConfig(async ({ locale }) => {
  // Use default locale if the incoming locale is invalid
  const validLocale = locale && locales.includes(locale as Locale) ? locale : defaultLocale;

  return {
    locale: validLocale,
    messages: (await import(`../messages/${validLocale}.json`)).default
  };
});
