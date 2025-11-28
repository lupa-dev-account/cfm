import React from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, defaultLocale, type Locale } from '@/i18n/request';
import { HtmlAttributes } from './html-attributes';
import '@/styles/globals.css';
import type { Metadata, Viewport } from 'next';

// RTL languages that need dir="rtl"
const rtlLocales: readonly string[] = ['ar', 'he', 'fa', 'ur'] as const;

// Favicon URL - can be overridden via environment variable
const FAVICON_URL = process.env.NEXT_PUBLIC_FAVICON_URL || 
  "https://niivkjrhszjuyboqrirj.supabase.co/storage/v1/object/public/company-logos/thumb_for_the_home_screen.jpg";

export const metadata: Metadata = {
  title: {
    template: '%s | CFM',
    default: 'CFM - Digital Business Cards',
  },
  description: 'Multi-tenant SaaS platform for digital business cards',
  icons: {
    icon: [
      {
        url: FAVICON_URL,
        sizes: "32x32",
        type: "image/jpeg",
      },
      {
        url: FAVICON_URL,
        sizes: "16x16",
        type: "image/jpeg",
      },
    ],
    apple: [
      {
        url: FAVICON_URL,
        sizes: "180x180",
        type: "image/jpeg",
      },
    ],
    shortcut: FAVICON_URL,
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#16a34a", // green-600
};

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // Await the params in Next.js 16
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  // Load messages with error handling
  let messages;
  try {
    messages = await getMessages({ locale });
  } catch (error) {
    console.error(`Failed to load messages for locale "${locale}":`, error);
    // Fallback to default locale messages
    try {
      messages = await getMessages({ locale: defaultLocale });
    } catch (fallbackError) {
      console.error(`Failed to load fallback messages:`, fallbackError);
      // Use empty messages as last resort
      messages = {};
    }
  }

  // Determine if locale is RTL
  const isRTL = rtlLocales.includes(locale);

  // Note: html/body tags are in root layout (app/layout.tsx)
  // We use a client component to set locale-specific html attributes
  return (
    <>
      <HtmlAttributes locale={locale} isRTL={isRTL} />
      <NextIntlClientProvider locale={locale} messages={messages}>
        {children}
      </NextIntlClientProvider>
    </>
  );
}
