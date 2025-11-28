"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslations, useLocale } from "next-intl";
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

type CompanyFormData = {
  name: string;
  description?: string;
  logo_url?: string;
  website_url?: string;
  linkedin_url?: string;
  facebook_url?: string;
  instagram_url?: string;
  footer_text?: string;
};

export default function CompanySettingsPage() {
  const t = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  // Create schema with translations
  const companySchema = z.object({
    name: z.string().min(1, t('companyNameRequired')),
    description: z.string().optional(),
    logo_url: z.string().url(t('invalidUrl')).optional().or(z.literal("")),
    website_url: z.string().url(t('invalidUrl')).optional().or(z.literal("")),
    linkedin_url: z.string().url(t('invalidLinkedInUrl')).optional().or(z.literal("")),
    facebook_url: z.string().url(t('invalidFacebookUrl')).optional().or(z.literal("")),
    instagram_url: z.string().url(t('invalidInstagramUrl')).optional().or(z.literal("")),
    footer_text: z.string().optional(),
  });

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
        router.push("/signin");
        return;
      }
      if (currentUser.role !== "company_admin") {
        router.push("/signin");
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
      setError(err.message || t('failedToLoadCompanyData'));
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
      setError(err.message || t('failedToUpdateCompanySettings'));
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push(`/${locale}/home`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <nav className="bg-white shadow-sm border-b overflow-x-hidden">
        <div className="container mx-auto px-3 md:px-4 py-2 md:py-4 flex justify-between items-center overflow-x-hidden">
          <div className="flex items-center gap-2 md:gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard/company")}
              className="bg-green-600 hover:bg-green-700 text-white text-xs md:text-sm px-2 md:px-3 py-1 md:py-2 h-7 md:h-9"
            >
              <ArrowLeft className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">{t('backToDashboard')}</span>
              <span className="sm:hidden">{t('backToDashboard').split(' ')[0]}</span>
            </Button>
            <h1 className="text-lg md:text-2xl font-bold text-black truncate">{t('companySettings')}</h1>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <span className="text-[10px] md:text-sm text-gray-600 hidden sm:inline truncate max-w-[100px] md:max-w-none">{user?.email}</span>
            <Button onClick={handleLogout} variant="outline" size="sm" className="bg-green-600 hover:bg-green-700 text-white border-green-600 text-[10px] md:text-sm px-2 md:px-3 py-1 md:py-2 h-7 md:h-9 whitespace-nowrap">
              {t('logout')}
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-3 md:px-4 py-4 md:py-8 max-w-4xl overflow-x-hidden">
        <Card className="p-3 md:p-6">
          <CardHeader className="px-0 pt-0 pb-3 md:pb-6">
            <div className="flex items-center gap-2 md:gap-3">
              <Building2 className="h-4 w-4 md:h-6 md:w-6 text-green-600 flex-shrink-0" />
              <div>
                <CardTitle className="text-base md:text-xl text-black">{t('companyInformation')}</CardTitle>
                <CardDescription className="text-xs md:text-sm mt-0.5 md:mt-1">
                  {t('companyInformationDesc')}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-0 pt-0">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
              {/* Company Name */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  {t('companyName')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  {...register("name")}
                  disabled={saving}
                  placeholder={t('companyNamePlaceholder')}
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              {/* Company Description */}
              <div className="space-y-2">
                <Label htmlFor="description">{t('companyDescription')}</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  disabled={saving}
                  placeholder={t('companyDescriptionPlaceholder')}
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-gray-500">
                  {t('companyDescriptionHint')}
                </p>
                {errors.description && (
                  <p className="text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              {/* Company Logo URL */}
              <div className="space-y-2">
                <Label htmlFor="logo_url">{t('companyLogoUrl')}</Label>
                <Input
                  id="logo_url"
                  type="url"
                  {...register("logo_url")}
                  disabled={saving}
                  placeholder={t('companyLogoUrlPlaceholder')}
                />
                <p className="text-xs text-gray-500">
                  {t('companyLogoUrlHint')}
                </p>
                {errors.logo_url && (
                  <p className="text-sm text-red-600">{errors.logo_url.message}</p>
                )}
              </div>

              {/* Footer Text */}
              <div className="space-y-2">
                <Label htmlFor="footer_text">{t('footerText')}</Label>
                <Input
                  id="footer_text"
                  {...register("footer_text")}
                  disabled={saving}
                  placeholder={t('footerTextPlaceholder')}
                />
                <p className="text-xs text-gray-500">
                  {t('footerTextHint')}
                </p>
                {errors.footer_text && (
                  <p className="text-sm text-red-600">{errors.footer_text.message}</p>
                )}
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4 text-black">
                  {t('companyLinks')}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {t('companyLinksDesc')}
                </p>

                {/* Website URL */}
                <div className="space-y-2 mb-4">
                  <Label htmlFor="website_url">{t('companyWebsite')}</Label>
                  <Input
                    id="website_url"
                    type="url"
                    {...register("website_url")}
                    disabled={saving}
                    placeholder={t('companyWebsitePlaceholder')}
                  />
                  {errors.website_url && (
                    <p className="text-sm text-red-600">{errors.website_url.message}</p>
                  )}
                </div>

                {/* LinkedIn URL */}
                <div className="space-y-2 mb-4">
                  <Label htmlFor="linkedin_url">{t('linkedInProfile')}</Label>
                  <Input
                    id="linkedin_url"
                    type="url"
                    {...register("linkedin_url")}
                    disabled={saving}
                    placeholder={t('linkedInProfilePlaceholder')}
                  />
                  {errors.linkedin_url && (
                    <p className="text-sm text-red-600">{errors.linkedin_url.message}</p>
                  )}
                </div>

                {/* Facebook URL */}
                <div className="space-y-2 mb-4">
                  <Label htmlFor="facebook_url">{t('facebookPage')}</Label>
                  <Input
                    id="facebook_url"
                    type="url"
                    {...register("facebook_url")}
                    disabled={saving}
                    placeholder={t('facebookPagePlaceholder')}
                  />
                  {errors.facebook_url && (
                    <p className="text-sm text-red-600">{errors.facebook_url.message}</p>
                  )}
                </div>

                {/* Instagram URL */}
                <div className="space-y-2">
                  <Label htmlFor="instagram_url">{t('instagramProfile')}</Label>
                  <Input
                    id="instagram_url"
                    type="url"
                    {...register("instagram_url")}
                    disabled={saving}
                    placeholder={t('instagramProfilePlaceholder')}
                  />
                  {errors.instagram_url && (
                    <p className="text-sm text-red-600">{errors.instagram_url.message}</p>
                  )}
                </div>
              </div>

              {error && <ErrorMessage message={error} />}

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded">
                  {t('companySettingsUpdatedSuccessfully')}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboard/company")}
                  disabled={saving}
                  className="bg-green-600 hover:bg-green-700 text-white border-green-600"
                >
                  {t('cancel')}
                </Button>
                <Button type="submit" disabled={saving} className="bg-green-600 hover:bg-green-700 text-white">
                  {saving ? (
                    <>
                      <Loading size="sm" className="mr-2" />
                      {t('saving')}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {t('saveChanges')}
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