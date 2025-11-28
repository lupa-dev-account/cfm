"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { getCurrentUser } from "@/lib/auth/helpers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { EmployeeForm } from "@/app/components/dashboard/employee-form";
import { EmployeeList } from "@/app/components/dashboard/employee-list";
import { getEmployeesByCompany } from "@/lib/services/employees";
import type { EmployeeWithCard, EmployeeCard } from "@/lib/types";
import { Plus, Users, Settings } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function CompanyDashboard() {
  const t = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<EmployeeWithCard[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeCard | undefined>();
  const supabase = createClient();

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
      setLoading(false);
    }
    checkAuth();
  }, [router]);

  useEffect(() => {
    if (user?.company_id) {
      loadEmployees();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.company_id]);

  const loadEmployees = async () => {
    if (!user?.company_id) return;
    setEmployeesLoading(true);
    try {
      const data = await getEmployeesByCompany(user.company_id);
      setEmployees(data);
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Failed to load employees:", error);
      }
      alert(`${t('failedToLoadEmployees')}: ${error.message}`);
    } finally {
      setEmployeesLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push(`/${locale}/home`);
  };

  const handleAddEmployee = () => {
    setEditingEmployee(undefined);
    setFormOpen(true);
  };

  const handleEditEmployee = (employee: EmployeeWithCard) => {
    setEditingEmployee(employee);
    setFormOpen(true);
  };

  const handleFormSuccess = () => {
    loadEmployees();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (!user?.company_id) {
    return (
      <div className="min-h-screen bg-gray-50 overflow-x-hidden">
        <nav className="bg-white shadow-sm border-b overflow-x-hidden">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center overflow-x-hidden">
            <h1 className="text-xl md:text-2xl font-bold text-black truncate">{t('companyDashboard')}</h1>
            <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
              <span className="text-xs md:text-sm text-gray-600 hidden sm:inline truncate max-w-[120px]">{user?.email}</span>
              <Button onClick={handleLogout} variant="outline" size="sm" className="bg-green-600 hover:bg-green-700 text-white border-green-600 text-xs md:text-sm whitespace-nowrap">
                {t('logout')}
              </Button>
              <LanguageSwitcher variant="inline" className="" />
            </div>
          </div>
        </nav>
        <main className="container mx-auto px-4 py-8 overflow-x-hidden max-w-full">
          <Card>
            <CardHeader>
              <CardTitle>{t('companyNotAssigned')}</CardTitle>
              <CardDescription>
                {t('companyNotAssignedDesc')}
              </CardDescription>
            </CardHeader>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <nav className="bg-white shadow-sm border-b overflow-x-hidden">
        <div className="container mx-auto px-3 md:px-4 py-2 md:py-4 flex justify-between items-center overflow-x-hidden">
          <h1 className="text-lg md:text-2xl font-bold text-black truncate">{t('companyDashboard')}</h1>
          <div className="flex items-center gap-1.5 md:gap-3 flex-shrink-0">
            <Button
              onClick={() => router.push("/dashboard/company/settings")}
              variant="default"
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white text-[10px] md:text-sm whitespace-nowrap px-2 md:px-3 py-1 md:py-2 h-7 md:h-9"
            >
              <Settings className="h-3 w-3 md:h-4 md:w-4 mr-0.5 md:mr-2" />
              <span className="hidden sm:inline">{t('companySettings')}</span>
              <span className="sm:hidden">{t('settings')}</span>
            </Button>
            <span className="text-[10px] md:text-sm text-gray-600 hidden lg:inline truncate max-w-[120px]">{user?.email}</span>
            <Button onClick={handleLogout} variant="outline" size="sm" className="bg-green-600 hover:bg-green-700 text-white border-green-600 text-[10px] md:text-sm whitespace-nowrap px-2 md:px-3 py-1 md:py-2 h-7 md:h-9">
              {t('logout')}
            </Button>
            <LanguageSwitcher variant="inline" className="" />
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-3 md:px-4 py-4 md:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 mb-4 md:mb-8">
          <Card className="p-3 md:p-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2 px-0 pt-0">
              <CardTitle className="text-xs md:text-sm font-medium text-black">{t('totalEmployees')}</CardTitle>
              <Users className="h-3 w-3 md:h-4 md:w-4 text-gray-500" />
            </CardHeader>
            <CardContent className="px-0 pt-2 md:pt-4">
              <div className="text-xl md:text-2xl font-bold text-green-600">{employees.length}</div>
              <p className="text-[10px] md:text-xs text-gray-500 mt-0.5 md:mt-1">
                {employees.filter((e) => e.is_active).length} {t('active')}
              </p>
            </CardContent>
          </Card>

          <Card className="p-3 md:p-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2 px-0 pt-0">
              <CardTitle className="text-xs md:text-sm font-medium text-black">{t('activeCards')}</CardTitle>
            </CardHeader>
            <CardContent className="px-0 pt-2 md:pt-4">
              <div className="text-xl md:text-2xl font-bold text-green-600">
                {employees.filter((e) => e.is_active).length}
              </div>
              <p className="text-[10px] md:text-xs text-gray-500 mt-0.5 md:mt-1">{t('currentlyActive')}</p>
            </CardContent>
          </Card>

          <Card className="p-3 md:p-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2 px-0 pt-0">
              <CardTitle className="text-xs md:text-sm font-medium text-black">{t('inactiveCards')}</CardTitle>
            </CardHeader>
            <CardContent className="px-0 pt-2 md:pt-4">
              <div className="text-xl md:text-2xl font-bold text-green-600">
                {employees.filter((e) => !e.is_active).length}
              </div>
              <p className="text-[10px] md:text-xs text-gray-500 mt-0.5 md:mt-1">{t('currentlyDisabled')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Employee Management Section */}
        <Card className="p-3 md:p-6">
          <CardHeader className="px-0 pt-0 pb-3 md:pb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="text-base md:text-xl text-black">{t('employeeManagement')}</CardTitle>
                <CardDescription className="text-xs md:text-sm mt-1">
                  {t('employeeManagementDesc')}
                </CardDescription>
              </div>
              <Button onClick={handleAddEmployee} size="sm" className="w-full sm:w-auto text-xs md:text-sm h-8 md:h-10">
                <Plus className="h-3 w-3 md:h-4 md:w-4 mr-1.5 md:mr-2" />
                {t('addEmployee')}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-0 pt-0">
            <EmployeeList
              employees={employees}
              onEdit={handleEditEmployee}
              onRefresh={loadEmployees}
              isLoading={employeesLoading}
            />
          </CardContent>
        </Card>

        {/* Employee Form Dialog */}
        <EmployeeForm
          open={formOpen}
          onOpenChange={setFormOpen}
          companyId={user.company_id}
          employee={editingEmployee}
          onSuccess={handleFormSuccess}
        />
      </main>
    </div>
  );
}

