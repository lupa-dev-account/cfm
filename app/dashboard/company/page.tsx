"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

export default function CompanyDashboard() {
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
        router.push("/login");
        return;
      }
      if (currentUser.role !== "company_admin") {
        router.push("/login");
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
      console.error("Failed to load employees:", error);
      alert(`Failed to load employees: ${error.message}`);
    } finally {
      setEmployeesLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
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
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Company Admin Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user?.email}</span>
              <Button onClick={handleLogout} variant="outline">
                Logout
              </Button>
            </div>
          </div>
        </nav>
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Company Not Assigned</CardTitle>
              <CardDescription>
                Your account is not associated with a company. Please contact support.
              </CardDescription>
            </CardHeader>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Company Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.push("/dashboard/company/settings")}
              variant="outline"
              size="sm"
            >
              <Settings className="h-4 w-4 mr-2" />
              Company Settings
            </Button>
            <span className="text-sm text-gray-600">{user?.email}</span>
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Users className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{employees.length}</div>
              <p className="text-xs text-gray-500">
                {employees.filter((e) => e.is_active).length} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Cards</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {employees.filter((e) => e.is_active).length}
              </div>
              <p className="text-xs text-gray-500">Currently active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive Cards</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {employees.filter((e) => !e.is_active).length}
              </div>
              <p className="text-xs text-gray-500">Currently disabled</p>
            </CardContent>
          </Card>
        </div>

        {/* Employee Management Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Employee Management</CardTitle>
                <CardDescription>
                  Manage your company employees and their digital business cards
                </CardDescription>
              </div>
              <Button onClick={handleAddEmployee} size="lg">
                <Plus className="h-4 w-4 mr-2" />
                Add Employee
              </Button>
            </div>
          </CardHeader>
          <CardContent>
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

