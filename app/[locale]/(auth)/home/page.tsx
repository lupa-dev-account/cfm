"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function LoginPage() {
  const locale = useLocale();
  const t = useTranslations('home');
  const tAuth = useTranslations('auth');
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header - Visible on tablet+ */}
      <header className="hidden md:flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
        <Link href={`/${locale}/home`} className="flex items-center">
          <Image
            src="/assets/cfm_logo_light.webp"
            alt="CFM Logo"
            width={150}
            height={60}
            className="object-contain"
            priority
          />
        </Link>
        <div className="flex items-center gap-3">
          <Link href={`/${locale}/signin`}>
            <Button variant="ghost" size="default">
              {tAuth('signIn')}
            </Button>
          </Link>
          <Link href={`/${locale}/signup`}>
            <Button variant="default" size="default">
              {tAuth('signUp')}
            </Button>
          </Link>
          <LanguageSwitcher variant="inline" />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row items-center justify-center min-h-[calc(100vh-4rem)] gap-8">
          {/* Left Side - Landing Content */}
          <div className="w-full lg:w-1/2 space-y-8 text-center lg:text-left">
            {/* Logo - Visible on mobile only */}
            <div className="flex justify-center md:hidden mb-8">
              <Image
                src="/assets/cfm_logo_light.webp"
                alt="CFM Logo"
                width={200}
                height={80}
                className="object-contain"
                priority
              />
            </div>

            {/* Mobile Navigation Buttons */}
            <div className="flex flex-col gap-3 md:hidden mb-8 max-w-md mx-auto">
              <Link href={`/${locale}/signin`} className="w-full">
                <Button className="w-full" size="lg">
                  {tAuth('signIn')}
                </Button>
              </Link>
              <Link href={`/${locale}/signup`} className="w-full">
                <Button variant="outline" className="w-full" size="lg">
                  {tAuth('signUp')}
                </Button>
              </Link>
              <div className="flex justify-center mt-2">
                <LanguageSwitcher variant="inline" />
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">
                {t('title')}
                <br />
                <span className="text-green-600">{t('titleHighlight')}</span>
              </h1>
              <p className="text-lg text-gray-600 max-w-lg mx-auto lg:mx-0">
                {t('description')}
              </p>
            </div>

            <div className="relative w-full max-w-2xl mx-auto lg:mx-0">
              <Image
                src="/assets/cfm_home_banner.webp"
                alt="CFM Platform"
                width={800}
                height={400}
                className="rounded-lg shadow-lg object-cover w-full"
                priority
              />
            </div>

            {/* Feature Cards - Hidden on mobile */}
            <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto lg:mx-0">
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">{t('nfcTitle')}</h3>
                <p className="text-sm text-gray-600">
                  {t('nfcDesc')}
                </p>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">{t('qrTitle')}</h3>
                <p className="text-sm text-gray-600">
                  {t('qrDesc')}
                </p>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">{t('analyticsTitle')}</h3>
                <p className="text-sm text-gray-600">
                  {t('analyticsDesc')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

