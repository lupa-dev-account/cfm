"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function LoginPage() {
  const locale = useLocale();
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header - Visible on tablet+ */}
      <header className="hidden md:flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
        <Link href={`/${locale}/login`} className="flex items-center">
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
              Sign In
            </Button>
          </Link>
          <Link href={`/${locale}/signup`}>
            <Button variant="default" size="default">
              Sign Up
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
                  Sign In
                </Button>
              </Link>
              <Link href={`/${locale}/signup`} className="w-full">
                <Button variant="outline" className="w-full" size="lg">
                  Sign Up
                </Button>
              </Link>
              <div className="flex justify-center mt-2">
                <LanguageSwitcher variant="inline" />
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">
                Digital Business Cards
                <br />
                <span className="text-green-600">Made Simple</span>
              </h1>
              <p className="text-lg text-gray-600 max-w-lg mx-auto lg:mx-0">
                Transform your networking experience with NFC-enabled digital business cards.
                Share your contact information instantly with a simple tap or scan.
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
                <h3 className="font-semibold text-gray-900 mb-2">NFC Enabled</h3>
                <p className="text-sm text-gray-600">
                  Tap to share your contact information instantly
                </p>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">QR Codes</h3>
                <p className="text-sm text-gray-600">
                  Scan and connect in seconds
                </p>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">Analytics</h3>
                <p className="text-sm text-gray-600">
                  Track your card interactions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

