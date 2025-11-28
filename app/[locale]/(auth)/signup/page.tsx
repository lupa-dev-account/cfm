"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";
import { Mail, Lock, User } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('auth');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const signUpSchema = z.object({
    fullName: z.string().min(2, t('fullNameMinLength')),
    email: z.string().email(t('invalidEmail')),
    password: z.string().min(6, t('passwordMinLength')),
    confirmPassword: z.string().min(6, t('confirmPasswordRequired')),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t('passwordsDoNotMatch'),
    path: ["confirmPassword"],
  });

  type SignUpFormData = z.infer<typeof signUpSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
          },
        },
      });

      if (authError) {
        setError(authError.message || "Failed to create account");
        setIsLoading(false);
        return;
      }

      if (!authData.user) {
        setError("Account creation failed. Please try again.");
        setIsLoading(false);
        return;
      }

      // Create user record in database
      const { error: userError } = await supabase
        .from("users")
        .insert({
          id: authData.user.id,
          email: data.email,
          full_name: data.fullName,
          role: "user", // Default role
        } as any);

      if (userError) {
        console.error("User creation error:", userError);
        setError("Account created but failed to set up profile. Please contact support.");
        setIsLoading(false);
        return;
      }

      // Redirect to sign in page or dashboard
      router.push(`/${locale}/signin?registered=true`);
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    // Placeholder for social login
    if (process.env.NODE_ENV === 'development') {
      console.log(`Sign up with ${provider}`);
    }
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
            <CardTitle className="text-2xl">{t('createAccount')}</CardTitle>
            <CardDescription>
              {t('signUpDescription')}
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
                <label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                  {t('fullName')}
                </label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder={t('fullNamePlaceholder')}
                  {...register("fullName")}
                  disabled={isLoading}
                />
                {errors.fullName && (
                  <p className="text-sm text-red-600">{errors.fullName.message}</p>
                )}
              </div>

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
                  placeholder={t('createPasswordPlaceholder')}
                  {...register("password")}
                  disabled={isLoading}
                />
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  {t('confirmPassword')}
                </label>
                <PasswordInput
                  id="confirmPassword"
                  placeholder={t('confirmPasswordPlaceholder')}
                  {...register("confirmPassword")}
                  disabled={isLoading}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>

              {error && <ErrorMessage message={error} />}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loading size="sm" className="mr-2" />
                    {t('creatingAccount')}
                  </>
                ) : (
                  t('signUp')
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-gray-600">{t('alreadyHaveAccount')} </span>
              <Link href={`/${locale}/signin`} className="text-green-600 hover:text-green-700 font-medium">
                {t('signIn')}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}







