"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { getRedirectPath } from "@/lib/auth/helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        setError(authError.message || "Invalid email or password");
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
        console.error("User fetch error:", userError);
        console.error("Auth User ID:", authData.user.id);
        console.error("Auth User Email:", authData.user.email);
        
        // Check if user exists by email (for debugging)
        const { data: emailCheck } = await supabase
          .from("users")
          .select("id, email, role")
          .eq("email", authData.user.email!)
          .single();
        
        if (emailCheck) {
          setError(
            `UUID mismatch detected! Auth ID: ${authData.user.id}, Database ID: ${emailCheck.id}. Please update the database user ID to match the Auth ID. See browser console for details.`
          );
        } else {
          setError(
            `User not found in database. Auth User ID: ${authData.user.id}, Email: ${authData.user.email}. Please create the user in the database. See browser console for details.`
          );
        }
        setIsLoading(false);
        return;
      }

      if (!userData) {
        console.error("No user data found for ID:", authData.user.id);
        setError(
          `User not found in database. Auth User ID: ${authData.user.id}, Email: ${authData.user.email}. Please create the user in the database.`
        );
        setIsLoading(false);
        return;
      }

      // Redirect based on role
      const redirectPath = await getRedirectPath(userData.role as any);
      router.push(redirectPath);
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row items-center justify-center min-h-[calc(100vh-4rem)] gap-8">
          {/* Left Side - Landing Content */}
          <div className="w-full lg:w-1/2 space-y-8 text-center lg:text-left">
            <div className="flex justify-center lg:justify-start">
              <Image
                src="/assets/cfm_logo_light.webp"
                alt="CFM Logo"
                width={200}
                height={80}
                className="object-contain"
                priority
              />
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto lg:mx-0">
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

          {/* Right Side - Login Form */}
          <div className="w-full lg:w-1/2 max-w-md">
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl">Welcome Back</CardTitle>
                <CardDescription>
                  Sign in to access your dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      {...register("email")}
                      disabled={isLoading}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
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
                    className="w-full"
                    disabled={isLoading}
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <Loading size="sm" className="mr-2" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

