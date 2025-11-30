"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { getRedirectPath } from "@/lib/auth/helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Force dynamic rendering - this page uses auth and client-side features
export const dynamic = 'force-dynamic';
import { Loading } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";
import { Mail, Lock } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('auth');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReturningUser, setIsReturningUser] = useState(false);
  const supabase = createClient();

  const signInSchema = z.object({
    email: z.string().email(t('invalidEmail')),
    password: z.string().min(1, 'Password is required'),
  });

  type SignInFormData = z.infer<typeof signInSchema>;

  useEffect(() => {
    // Check if user has existing session/cookies
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsReturningUser(true);
      } else {
        // Check localStorage for any auth-related data
        const hasAuthData = localStorage.getItem("sb-auth-token") || 
                           localStorage.getItem("supabase.auth.token");
        setIsReturningUser(!!hasAuthData);
      }
    };
    checkSession();
  }, [supabase]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        // Use generic error message to prevent email enumeration
        setError("Invalid email or password");
        setIsLoading(false);
        return;
      }

      if (!authData.user) {
        setError("Authentication failed. Please try again.");
        setIsLoading(false);
        return;
      }

      // Fetch user role from database
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("role")
        .eq("id", authData.user.id)
        .single();

      if (userError) {
        // Log error details only in development
        if (process.env.NODE_ENV === 'development') {
          console.error("User fetch error:", userError);
          console.error("Auth User ID:", authData.user.id);
          console.error("Auth User Email:", authData.user.email);
        }
        
        // Use generic error message to prevent information disclosure
        setError("Authentication failed. Please try again.");
        setIsLoading(false);
        return;
      }

      if (!userData) {
        if (process.env.NODE_ENV === 'development') {
          console.error("No user data found for ID:", authData.user.id);
        }
        // Use generic error message to prevent information disclosure
        setError("Authentication failed. Please try again.");
        setIsLoading(false);
        return;
      }

      // Redirect based on role
      const redirectPath = await getRedirectPath((userData as any).role);
      router.push(`/${locale}${redirectPath}`);
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    // Placeholder for social login
    // TODO: Implement social login
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo - Mobile only */}
        <div className="flex justify-center mb-8 md:hidden">
          <Link href={`/${locale}/home`}>
            <div className="relative w-[150px] h-[60px]">
              <Image
                src="/assets/cfm_logo_light.webp"
                alt="CFM Logo"
                fill
                sizes="150px"
                className="object-contain"
                priority
              />
            </div>
          </Link>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-black">
              {isReturningUser ? t('welcomeBack') : t('signIn')}
            </CardTitle>
            <CardDescription>
              {isReturningUser
                ? t('signInToAccess')
                : t('enterCredentials')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Social Login Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialLogin("gmail")}
                className="w-full"
              >
                <Mail className="h-4 w-4 mr-2" />
                Gmail
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialLogin("icloud")}
                className="w-full"
              >
                <Lock className="h-4 w-4 mr-2" />
                iCloud
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialLogin("email")}
                className="w-full"
              >
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialLogin("sso")}
                className="w-full"
              >
                <Lock className="h-4 w-4 mr-2" />
                SSO
              </Button>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">{t('orContinueWith')}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  {t('email')}
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  {...register("email")}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  {t('password')}
                </label>
                <PasswordInput
                  id="password"
                  placeholder={t('passwordPlaceholder')}
                  {...register("password")}
                  disabled={isLoading}
                />
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              {error && <ErrorMessage message={error} />}

              <Button
                type="submit"
                variant="default"
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                disabled={isLoading}
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loading size="sm" className="mr-2" />
                    {t('signingIn')}
                  </>
                ) : (
                  t('signIn')
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-gray-600">{t('dontHaveAccount')} </span>
              <Link href={`/${locale}/signup`} className="text-green-600 hover:text-green-700 font-medium">
                {t('signUp')}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

