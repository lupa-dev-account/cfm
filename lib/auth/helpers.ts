import { UserRole } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

export async function getRedirectPath(role: UserRole): Promise<string> {
  switch (role) {
    case "super_admin":
      return "/dashboard/admin";
    case "company_admin":
      return "/dashboard/company";
    case "employee":
      return "/dashboard/employee";
    default:
      return "/dashboard/employee";
  }
}

export async function getCurrentUser() {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  // Fetch user role from database
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("role, company_id")
    .eq("id", user.id)
    .single();

  if (userError || !userData) {
    return null;
  }

  return {
    id: user.id,
    email: user.email!,
    role: (userData as any).role as UserRole,
    company_id: (userData as any).company_id,
  };
}

