"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { NextIntlClientProvider, useTranslations } from "next-intl";
import { defaultLocale, locales } from "@/i18n/request";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/request";

function NotFoundContent({ homePath }: { homePath: string }) {
  const t = useTranslations("common");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">{t("pageNotFound")}</p>
        <Link href={homePath}>
          <Button className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            {t("goHome")}
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function NotFound() {
  const pathname = usePathname();
  const [locale, setLocale] = useState<Locale>(defaultLocale);
  const [messages, setMessages] = useState<any>(null);

  // Extract locale from pathname if present, otherwise use default
  const getLocale = (): Locale => {
    const localeMatch = pathname?.match(/^\/([a-z]{2})(\/|$)/);
    if (localeMatch && locales.includes(localeMatch[1] as Locale)) {
      return localeMatch[1] as Locale;
    }
    return defaultLocale;
  };

  const getHomePath = () => {
    const detectedLocale = getLocale();
    return `/${detectedLocale}/home`;
  };

  // Load messages for the detected locale
  useEffect(() => {
    const detectedLocale = getLocale();
    setLocale(detectedLocale);
    
    // Dynamically import messages for the locale
    import(`@/messages/${detectedLocale}.json`)
      .then((mod) => {
        setMessages(mod.default);
      })
      .catch(() => {
        // Fallback to default locale if locale messages don't exist
        import(`@/messages/${defaultLocale}.json`)
          .then((mod) => {
            setMessages(mod.default);
            setLocale(defaultLocale);
          });
      });
  }, [pathname]);

  const homePath = getHomePath();

  // Show loading state while messages are loading
  if (!messages) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
        </div>
      </div>
    );
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <NotFoundContent homePath={homePath} />
    </NextIntlClientProvider>
  );
}
