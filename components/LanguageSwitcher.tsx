"use client";

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useTransition } from "react";
import { Globe } from "lucide-react";
import { locales } from '@/i18n/request';

const languages = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "pt", name: "Português", flag: "🇵🇹" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
];

interface LanguageSwitcherProps {
  variant?: 'fixed' | 'inline';
  className?: string;
}

export default function LanguageSwitcher({ variant = 'fixed', className = '' }: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const currentLanguage = languages.find((lang) => lang.code === locale) || languages[0];

  const switchLanguage = (newLocale: string) => {
    startTransition(() => {
      // Replace the locale in the current pathname
      const segments = pathname.split('/').filter(Boolean);

      // Check if the first segment is a locale
      const allLocales = Array.from(locales);
      const firstSegmentIsLocale = allLocales.includes(segments[0] as any);

      if (firstSegmentIsLocale) {
        // Replace existing locale
        segments[0] = newLocale;
      } else {
        // Add locale at the beginning
        segments.unshift(newLocale);
      }

      const newPath = '/' + segments.join('/');
      router.push(newPath);
      setIsOpen(false);
    });
  };

  const containerClass = variant === 'fixed'
    ? "fixed top-5 right-5 z-50"
    : className;

  return (
    <div className={containerClass}>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-lg px-3 py-2 shadow-lg hover:shadow-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200"
          disabled={isPending}
        >
          <Globe className="w-5 h-5 text-green-400" />
          <span className="text-lg">{currentLanguage.flag}</span>
          <span className="text-sm font-medium text-white">{currentLanguage.code.toUpperCase()}</span>
        </button>

        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <div className="absolute top-full right-0 mt-2 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-lg shadow-2xl min-w-[200px] max-h-[400px] overflow-y-auto z-50">
              <div className="p-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => switchLanguage(lang.code)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-150 ${
                      lang.code === locale
                        ? "bg-green-600 text-white shadow-md"
                        : "hover:bg-gray-700 text-gray-200"
                    }`}
                    disabled={isPending}
                  >
                    <span className="text-xl">{lang.flag}</span>
                    <div className="flex flex-col items-start flex-1">
                      <span className="text-sm font-medium">{lang.name}</span>
                      <span className={`text-xs ${
                        lang.code === locale ? "text-green-100" : "text-gray-400"
                      }`}>
                        {lang.code.toUpperCase()}
                      </span>
                    </div>
                    {lang.code === locale && (
                      <span className="ml-auto text-white">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
