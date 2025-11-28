"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { getCurrentUser } from "@/lib/auth/helpers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";

export default function EmployeeDashboard() {
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
      if (currentUser.role !== "employee") {
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
          <h1 className="text-2xl font-bold text-black">{t("myCard")}</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.email}</span>
            <Button onClick={handleLogout} variant="outline" className="bg-green-600 hover:bg-green-700 text-white border-green-600">
              {t("logout")}
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("myDigitalCard")}</CardTitle>
              <CardDescription>{t("managePublicCard")}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">{t("comingSoon")}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("analytics")}</CardTitle>
              <CardDescription>{t("viewCardAnalytics")}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">{t("comingSoon")}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>{t("welcome")}</CardTitle>
            <CardDescription>
              {t("manageDigitalCard")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              {t("userId")}: {user?.id}
            </p>
            <p className="text-sm text-gray-600">
              {t("role")}: {user?.role}
            </p>
            <p className="text-sm text-gray-600">
              {t("companyId")}: {user?.company_id || t("notAssigned")}
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}







