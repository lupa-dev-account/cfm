"use client";

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useTransition, useRef, useEffect } from "react";
import React from "react";
import { Globe } from "lucide-react";
import { locales } from '@/i18n/request';

const languages = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "pt", name: "Português", flag: "🇵🇹" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "zh", name: "中文 (简体)", flag: "🇨🇳" },
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
    ? "fixed top-5 right-5 z-[10000]"
    : `${className || ""} relative z-[10000]`;

  // Get button position for fixed dropdown positioning
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const updatePosition = () => {
        if (buttonRef.current) {
          const rect = buttonRef.current.getBoundingClientRect();
          setButtonRect(rect);
        }
      };
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    } else {
      setButtonRect(null);
    }
  }, [isOpen]);

  return (
    <div className={containerClass}>
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 md:gap-2 bg-green-800 border border-green-800 rounded-lg px-2.5 md:px-3 py-1.5 md:py-2 shadow-lg hover:bg-green-700 hover:border-green-700 transition-all duration-200 relative z-[10001]"
          disabled={isPending}
        >
          <Globe className="w-4 h-4 md:w-5 md:h-5 text-white flex-shrink-0" />
          <span className="text-base md:text-lg flex-shrink-0">{currentLanguage.flag}</span>
          <span className="text-xs md:text-sm font-medium text-white">{currentLanguage.code.toUpperCase()}</span>
        </button>

        {isOpen && buttonRect && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-[10000]"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown - Fixed positioning to appear on top of everything */}
            <div 
              className="fixed bg-white border border-green-800 rounded-lg shadow-2xl w-[120px] md:w-[160px] max-h-[40vh] md:max-h-[320px] overflow-y-auto z-[10001]"
              style={{
                top: `${buttonRect.bottom + 4}px`,
                right: typeof window !== 'undefined' ? `${window.innerWidth - buttonRect.right}px` : '0px',
                maxWidth: 'calc(100vw - 16px)',
              }}
            >
              <div className="p-0.5 md:p-1">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => switchLanguage(lang.code)}
                    className={`w-full flex items-center gap-0.5 md:gap-1.5 px-1 py-0.5 md:py-1.5 rounded transition-all duration-150 ${
                      lang.code === locale
                        ? "bg-green-800 text-white shadow-md"
                        : "hover:bg-green-50 text-gray-900"
                    }`}
                    disabled={isPending}
                  >
                    <span className="text-sm md:text-lg flex-shrink-0 leading-none" role="img" aria-label={`${lang.name} flag`} style={{ fontSize: '1rem', lineHeight: '1' }}>{lang.flag}</span>
                    <div className="flex flex-col items-start flex-1 min-w-0">
                      <span className={`text-[9px] md:text-xs font-medium truncate w-full leading-tight ${
                        lang.code === locale ? "text-white" : "text-gray-900"
                      }`}>
                        {lang.name}
                      </span>
                      <span className={`text-[7px] md:text-[9px] leading-tight ${
                        lang.code === locale ? "text-green-100" : "text-gray-500"
                      }`}>
                        {lang.code.toUpperCase()}
                      </span>
                    </div>
                    {lang.code === locale && (
                      <span className="ml-auto text-white flex-shrink-0 text-[8px] md:text-xs">✓</span>
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
