"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createClient } from "@/lib/supabase/client";
import { getCurrentUser } from "@/lib/auth/helpers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loading } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";
import type { Company } from "@/lib/types";
import { ArrowLeft, Building2, Save } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const companySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  description: z.string().optional(),
  logo_url: z.string().url("Invalid URL").optional().or(z.literal("")),
  website_url: z.string().url("Invalid URL").optional().or(z.literal("")),
  linkedin_url: z.string().url("Invalid LinkedIn URL").optional().or(z.literal("")),
  facebook_url: z.string().url("Invalid Facebook URL").optional().or(z.literal("")),
  instagram_url: z.string().url("Invalid Instagram URL").optional().or(z.literal("")),
  footer_text: z.string().optional(),
});

type CompanyFormData = z.infer<typeof companySchema>;

export default function CompanySettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
  });

  useEffect(() => {
    async function checkAuth() {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.push("/login");
        return;
      }
      if (currentUser.role !== "company_admin") {
        router.push("/login");
        return;
      }
      setUser(currentUser);
      await loadCompanyData(currentUser.company_id);
      setLoading(false);
    }
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const loadCompanyData = async (companyId: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from("companies")
        .select("*")
        .eq("id", companyId)
        .single();

      if (fetchError) throw fetchError;

      setCompany(data);
      reset({
        name: (data as any).name || "",
        description: (data as any).description || "",
        logo_url: (data as any).logo_url || "",
        website_url: (data as any).website_url || "",
        linkedin_url: (data as any).linkedin_url || "",
        facebook_url: (data as any).facebook_url || "",
        instagram_url: (data as any).instagram_url || "",
        footer_text: (data as any).footer_text || "",
      });
    } catch (err: any) {
      setError(err.message || "Failed to load company data");
    }
  };

  const onSubmit = async (data: CompanyFormData) => {
    if (!user?.company_id) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const { error: updateError } = await (supabase as any)
        .from("companies")
        .update({
          name: data.name,
          description: data.description || null,
          logo_url: data.logo_url || null,
          website_url: data.website_url || null,
          linkedin_url: data.linkedin_url || null,
          facebook_url: data.facebook_url || null,
          instagram_url: data.instagram_url || null,
          footer_text: data.footer_text || null,
        })
        .eq("id", user.company_id);

      if (updateError) throw updateError;

      setSuccess(true);
      await loadCompanyData(user.company_id);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update company settings");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard/company")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Company Settings</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.email}</span>
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Building2 className="h-6 w-6 text-green-600" />
              <div>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>
                  Update your company profile. This information will be displayed on all employee business cards.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Company Name */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Company Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  {...register("name")}
                  disabled={saving}
                  placeholder="e.g., CFM - Portos e Caminhos de Ferro de Moçambique"
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              {/* Company Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Company Description</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  disabled={saving}
                  placeholder="Describe your company's mission and services..."
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-gray-500">
                  This description will be displayed on all employee cards
                </p>
                {errors.description && (
                  <p className="text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              {/* Company Logo URL */}
              <div className="space-y-2">
                <Label htmlFor="logo_url">Company Logo URL</Label>
                <Input
                  id="logo_url"
                  type="url"
                  {...register("logo_url")}
                  disabled={saving}
                  placeholder="https://example.com/logo.png"
                />
                <p className="text-xs text-gray-500">
                  Enter a URL to your company logo image
                </p>
                {errors.logo_url && (
                  <p className="text-sm text-red-600">{errors.logo_url.message}</p>
                )}
              </div>

              {/* Footer Text */}
              <div className="space-y-2">
                <Label htmlFor="footer_text">Footer Text</Label>
                <Input
                  id="footer_text"
                  {...register("footer_text")}
                  disabled={saving}
                  placeholder="e.g., Portos E Caminhos De Ferro De Moçambique, E.P."
                />
                <p className="text-xs text-gray-500">
                  Text displayed in the header and footer of employee cards
                </p>
                {errors.footer_text && (
                  <p className="text-sm text-red-600">{errors.footer_text.message}</p>
                )}
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">
                  Company Links
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  These links will be displayed on all employee business cards
                </p>

                {/* Website URL */}
                <div className="space-y-2 mb-4">
                  <Label htmlFor="website_url">Company Website</Label>
                  <Input
                    id="website_url"
                    type="url"
                    {...register("website_url")}
                    disabled={saving}
                    placeholder="https://www.company.com"
                  />
                  {errors.website_url && (
                    <p className="text-sm text-red-600">{errors.website_url.message}</p>
                  )}
                </div>

                {/* LinkedIn URL */}
                <div className="space-y-2 mb-4">
                  <Label htmlFor="linkedin_url">LinkedIn Profile</Label>
                  <Input
                    id="linkedin_url"
                    type="url"
                    {...register("linkedin_url")}
                    disabled={saving}
                    placeholder="https://linkedin.com/company/your-company"
                  />
                  {errors.linkedin_url && (
                    <p className="text-sm text-red-600">{errors.linkedin_url.message}</p>
                  )}
                </div>

                {/* Facebook URL */}
                <div className="space-y-2 mb-4">
                  <Label htmlFor="facebook_url">Facebook Page</Label>
                  <Input
                    id="facebook_url"
                    type="url"
                    {...register("facebook_url")}
                    disabled={saving}
                    placeholder="https://facebook.com/your-company"
                  />
                  {errors.facebook_url && (
                    <p className="text-sm text-red-600">{errors.facebook_url.message}</p>
                  )}
                </div>

                {/* Instagram URL */}
                <div className="space-y-2">
                  <Label htmlFor="instagram_url">Instagram Profile</Label>
                  <Input
                    id="instagram_url"
                    type="url"
                    {...register("instagram_url")}
                    disabled={saving}
                    placeholder="https://instagram.com/your-company"
                  />
                  {errors.instagram_url && (
                    <p className="text-sm text-red-600">{errors.instagram_url.message}</p>
                  )}
                </div>
              </div>

              {error && <ErrorMessage message={error} />}

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded">
                  Company settings updated successfully!
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboard/company")}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loading size="sm" className="mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
