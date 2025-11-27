import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n/request';
import '@/styles/globals.css';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  icons: {
    icon: [
      {
        url: "https://niivkjrhszjuyboqrirj.supabase.co/storage/v1/object/public/company-logos/thumb_for_the_home_screen.jpg",
        sizes: "32x32",
        type: "image/jpeg",
      },
      {
        url: "https://niivkjrhszjuyboqrirj.supabase.co/storage/v1/object/public/company-logos/thumb_for_the_home_screen.jpg",
        sizes: "16x16",
        type: "image/jpeg",
      },
    ],
    apple: [
      {
        url: "https://niivkjrhszjuyboqrirj.supabase.co/storage/v1/object/public/company-logos/thumb_for_the_home_screen.jpg",
        sizes: "180x180",
        type: "image/jpeg",
      },
    ],
    shortcut: "https://niivkjrhszjuyboqrirj.supabase.co/storage/v1/object/public/company-logos/thumb_for_the_home_screen.jpg",
  },
  other: {
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
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages({ locale });

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
