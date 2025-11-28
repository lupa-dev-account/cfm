import { createClient } from "@/lib/supabase/client";
import { generateSlug, generateUniqueSlug } from "@/lib/utils/slug-generator";
import type {
  EmployeeCard,
  ContactLinks,
  SocialLinks,
  BusinessHours,
} from "@/lib/types";

export interface EmployeeFormData {
  firstName: string;
  lastName: string;
  title: string;
  photoUrl?: string;
  photoFile?: File;
  contactLinks: ContactLinks;
  socialLinks?: SocialLinks; // Optional - company social links are now in companies table
  businessHours?: BusinessHours;
  isActive: boolean;
}

export interface EmployeeWithCard extends EmployeeCard {
  name?: string;
  title?: string;
}

/**
 * Upload employee photo to Supabase Storage
 */
export async function uploadEmployeePhoto(
  file: File,
  employeeId: string
): Promise<string> {
  const supabase = createClient();
  const fileExt = file.name.split(".").pop();
  const fileName = `${employeeId}/${Date.now()}.${fileExt}`;
  const bucketName = "employee-photos";
  const filePath = fileName;

  const { error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    if (uploadError.message.includes("Bucket not found")) {
      throw new Error(
        `Storage bucket "${bucketName}" not found. Please create it in Supabase Storage settings.`
      );
    }
    throw new Error(`Failed to upload photo: ${uploadError.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucketName).getPublicUrl(filePath);

  return publicUrl;
}

/**
 * Check if a public_slug already exists
 */
async function checkSlugExists(slug: string): Promise<boolean> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("employee_cards")
    .select("id")
    .eq("public_slug", slug)
    .single();

  return !error && data !== null;
}

/**
 * Generate a UUID
 */
function generateUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Create a new employee card
 */
export async function createEmployee(
  companyId: string,
  employeeData: EmployeeFormData
): Promise<EmployeeCard> {
  const supabase = createClient();

  // Generate unique employee_id (UUID)
  const employeeId = generateUUID();

  // Generate unique public_slug
  const fullName = `${employeeData.firstName} ${employeeData.lastName}`;
  const baseSlug = generateSlug(fullName);
  const publicSlug = await generateUniqueSlug(baseSlug, checkSlugExists);

  // Handle photo upload if file provided
  let photoUrl = employeeData.photoUrl || null;
  if (employeeData.photoFile) {
    photoUrl = await uploadEmployeePhoto(employeeData.photoFile, employeeId);
  }

  // Store name, title, and company_id in theme JSON
  const theme = {
    name: fullName,
    title: employeeData.title,
    company_id: companyId,
  };

  // Default empty social links (since these are now in companies table)
  const socialLinks = employeeData.socialLinks || { linkedin: "" };

  const { data, error } = await (supabase as any)
    .from("employee_cards")
    .insert({
      employee_id: employeeId,
      public_slug: publicSlug,
      photo_url: photoUrl,
      contact_links: employeeData.contactLinks,
      social_links: socialLinks,
      business_hours: employeeData.businessHours || null,
      theme: theme,
      is_active: employeeData.isActive,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create employee: ${error.message}`);
  }

  return data;
}

/**
 * Update an existing employee card
 */
export async function updateEmployee(
  employeeId: string,
  employeeData: Partial<EmployeeFormData>
): Promise<EmployeeCard> {
  const supabase = createClient();

  // Get existing card to preserve theme
  const { data: existingCard, error: fetchError } = await supabase
    .from("employee_cards")
    .select("*")
    .eq("employee_id", employeeId)
    .single();

  if (fetchError || !existingCard) {
    throw new Error(`Employee not found: ${employeeId}`);
  }

  // Handle photo upload if new file provided
  let photoUrl = employeeData.photoUrl ?? (existingCard as any).photo_url;
  if (employeeData.photoFile) {
    photoUrl = await uploadEmployeePhoto(employeeData.photoFile, employeeId);
  }

  // Update theme with name/title if provided, preserve company_id
  const theme = (existingCard as any).theme || {};
  if (employeeData.firstName && employeeData.lastName) {
    theme.name = `${employeeData.firstName} ${employeeData.lastName}`;
  }
  if (employeeData.title) {
    theme.title = employeeData.title;
  }
  // Preserve company_id if it exists
  if (theme.company_id) {
    theme.company_id = theme.company_id;
  }

  const updateData: any = {
    updated_at: new Date().toISOString(),
  };

  if (photoUrl !== undefined) {
    updateData.photo_url = photoUrl;
  }
  if (employeeData.contactLinks) {
    updateData.contact_links = employeeData.contactLinks;
  }
  if (employeeData.socialLinks) {
    updateData.social_links = employeeData.socialLinks;
  }
  if (employeeData.businessHours !== undefined) {
    updateData.business_hours = employeeData.businessHours;
  }
  if (employeeData.isActive !== undefined) {
    updateData.is_active = employeeData.isActive;
  }
  updateData.theme = theme;

  const { data, error } = await (supabase as any)
    .from("employee_cards")
    .update(updateData)
    .eq("employee_id", employeeId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update employee: ${error.message}`);
  }

  return data;
}

/**
 * Delete an employee card
 */
export async function deleteEmployee(employeeId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("employee_cards")
    .delete()
    .eq("employee_id", employeeId);

  if (error) {
    throw new Error(`Failed to delete employee: ${error.message}`);
  }
}

/**
 * Toggle employee active status
 */
export async function toggleEmployeeStatus(
  employeeId: string,
  isActive: boolean
): Promise<EmployeeCard> {
  const supabase = createClient();

  const { data, error } = await (supabase as any)
    .from("employee_cards")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("employee_id", employeeId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update employee status: ${error.message}`);
  }

  return data;
}

/**
 * Get all employees for a company
 * Filters by company_id stored in theme JSON
 */
export async function getEmployeesByCompany(
  companyId: string
): Promise<EmployeeWithCard[]> {
  const supabase = createClient();

  // Fetch all cards and filter by company_id in theme
  // Note: This is not optimal but works until we add company_id column
  const { data, error } = await supabase
    .from("employee_cards")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch employees: ${error.message}`);
  }

  // Filter by company_id stored in theme and map to include name and title
  const cards = (data || []) as any[];
  return cards
    .filter((card) => {
      const theme = card.theme as any;
      return theme?.company_id === companyId;
    })
    .map((card) => ({
      ...card,
      name: (card.theme as any)?.name,
      title: (card.theme as any)?.title,
    })) as EmployeeWithCard[];
}

