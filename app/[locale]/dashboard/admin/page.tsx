"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { getCurrentUser } from "@/lib/auth/helpers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";

export default function AdminDashboard() {
  const t = useTranslations('common');
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function checkAuth() {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.push("/signin");
        return;
      }
      if (currentUser.role !== "super_admin") {
        router.push("/signin");
        return;
      }
      setUser(currentUser);
      setLoading(false);
    }
    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/signin");
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
          <h1 className="text-2xl font-bold text-black">{t("superAdminDashboard")}</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.email}</span>
            <Button onClick={handleLogout} variant="outline" className="bg-green-600 hover:bg-green-700 text-white border-green-600">
              {t("logout")}
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("companies")}</CardTitle>
              <CardDescription>{t("manageAllCompanies")}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">{t("comingSoon")}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("subscriptions")}</CardTitle>
              <CardDescription>{t("manageSubscriptionPlans")}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">{t("comingSoon")}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("analytics")}</CardTitle>
              <CardDescription>{t("viewGlobalAnalytics")}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">{t("comingSoon")}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>{t("welcomeSuperAdmin")}</CardTitle>
            <CardDescription>
              {t("fullAccessDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              User ID: {user?.id}
            </p>
            <p className="text-sm text-gray-600">
              Role: {user?.role}
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}







