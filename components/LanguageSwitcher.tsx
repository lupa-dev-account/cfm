"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Globe } from "lucide-react";

const languages = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "pt", name: "Português", flag: "🇵🇹" },
];

export default function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();

  // Get current locale from pathname (e.g., "/en/dashboard" -> "en")
  const currentLocale = pathname.split("/")[1] || "en";
  const currentLanguage = languages.find((lang) => lang.code === currentLocale) || languages[0];

  const switchLanguage = (locale: string) => {
    startTransition(() => {
      // Remove current locale from pathname and add new one
      const pathWithoutLocale = pathname.replace(`/${currentLocale}`, "") || "/";
      const newPath = `/${locale}${pathWithoutLocale}`;
      router.push(newPath);
      setIsOpen(false);
    });
  };

  return (
    <div className="fixed top-5 right-5 z-50">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2 shadow-md hover:shadow-lg transition-shadow"
          disabled={isPending}
        >
          <Globe className="w-5 h-5 text-gray-600" />
          <span className="text-lg">{currentLanguage.flag}</span>
          <span className="text-sm font-medium">{currentLanguage.code.toUpperCase()}</span>
        </button>

        {isOpen && (
          <div className="absolute top-full right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-xl min-w-[160px] overflow-hidden">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => switchLanguage(lang.code)}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition-colors ${
                  lang.code === currentLocale ? "bg-green-50" : ""
                }`}
                disabled={isPending}
              >
                <span className="text-xl">{lang.flag}</span>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">{lang.name}</span>
                  <span className="text-xs text-gray-500">{lang.code.toUpperCase()}</span>
                </div>
                {lang.code === currentLocale && (
                  <span className="ml-auto text-green-600">✓</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
