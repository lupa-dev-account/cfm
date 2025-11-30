'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
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
  socialLinks?: SocialLinks;
  businessHours?: BusinessHours;
  isActive: boolean;
  titleTranslations?: Record<string, string>;
}

export interface EmployeeWithCard extends EmployeeCard {
  name?: string;
  title?: string;
  title_translations?: Record<string, string>;
}

/**
 * Allowed MIME types for image uploads
 */
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
];

/**
 * Maximum file size: 5MB
 */
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

/**
 * Default profile picture URL when no photo is provided
 */
const DEFAULT_PROFILE_PICTURE_URL = 'https://niivkjrhszjuyboqrirj.supabase.co/storage/v1/object/public/company-logos/thumb_for_the_home_screen.jpg';

/**
 * Magic bytes (file signatures) for image validation
 */
const IMAGE_SIGNATURES: Record<string, number[][]> = {
  'image/jpeg': [[0xFF, 0xD8, 0xFF]],
  'image/png': [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]],
  'image/gif': [[0x47, 0x49, 0x46, 0x38, 0x37, 0x61], [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]],
  'image/webp': [[0x52, 0x49, 0x46, 0x46]],
};

/**
 * Validates file content by checking magic bytes
 */
async function validateFileContent(file: File, expectedMimeType: string): Promise<boolean> {
  const signatures = IMAGE_SIGNATURES[expectedMimeType];
  if (!signatures) {
    return false;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const arrayBuffer = reader.result as ArrayBuffer;
      const bytes = new Uint8Array(arrayBuffer);
      
      for (const signature of signatures) {
        let matches = true;
        for (let i = 0; i < signature.length; i++) {
          if (bytes[i] !== signature[i]) {
            matches = false;
            break;
          }
        }
        if (matches) {
          resolve(true);
          return;
        }
      }
      
      resolve(false);
    };
    reader.onerror = () => resolve(false);
    reader.readAsArrayBuffer(file.slice(0, 8));
  });
}

/**
 * Upload employee photo to Supabase Storage (server-side)
 */
async function uploadEmployeePhoto(
  file: File,
  employeeId: string
): Promise<string> {
  // Validate file type by MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error(
      `Invalid file type. Only images (JPEG, PNG, WebP, GIF) are allowed. Received: ${file.type}`
    );
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB. Received: ${(file.size / (1024 * 1024)).toFixed(2)}MB`
    );
  }

  // Validate file content (magic bytes)
  const isValidContent = await validateFileContent(file, file.type);
  if (!isValidContent) {
    throw new Error(
      'Invalid file content. File does not match its declared type. Only image files are allowed.'
    );
  }

  const supabase = await createClient();
  
  // Use MIME type to determine extension
  const mimeToExt: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
  };
  const fileExt = mimeToExt[file.type] || 'jpg';
  const fileName = `${employeeId}/${Date.now()}.${fileExt}`;
  const bucketName = "employee-photos";
  const filePath = fileName;

  // Convert File to ArrayBuffer for server-side upload
  const arrayBuffer = await file.arrayBuffer();
  const { error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(filePath, arrayBuffer, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
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
  const supabase = await createClient();
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
  // Fallback for older environments
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Get current user's company ID
 */
async function getCurrentUserCompanyId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("company_id")
    .eq("id", user.id)
    .single();

  if (userError || !userData) {
    return null;
  }

  return (userData as { company_id: string | null }).company_id || null;
}

/**
 * Create a new employee card (Server Action)
 */
export async function createEmployeeAction(
  companyId: string,
  employeeData: EmployeeFormData
): Promise<{ success: boolean; data?: EmployeeCard; error?: string }> {
  try {
    const supabase = await createClient();
    
    // Verify user has access to this company
    const userCompanyId = await getCurrentUserCompanyId();
    if (userCompanyId !== companyId) {
      return {
        success: false,
        error: "Unauthorized: You don't have access to this company",
      };
    }

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
    
    // Use default profile picture if no photo provided
    if (!photoUrl) {
      photoUrl = DEFAULT_PROFILE_PICTURE_URL;
    }

    // Store name, title, title_translations, and company_id in theme JSON
    const theme = {
      name: fullName,
      title: employeeData.title,
      company_id: companyId,
      ...(employeeData.titleTranslations && Object.keys(employeeData.titleTranslations).length > 0
        ? { title_translations: employeeData.titleTranslations }
        : {}),
    };

    // Default empty social links
    const socialLinks = employeeData.socialLinks || { linkedin: "" };

    const { data, error } = await supabase
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
        // Add company_id column if it exists (after migration)
        company_id: companyId,
      } as any)
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: `Failed to create employee: ${error.message}`,
      };
    }

    revalidatePath('/dashboard/company');
    return {
      success: true,
      data: data as EmployeeCard,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to create employee",
    };
  }
}

/**
 * Update an existing employee card (Server Action)
 */
export async function updateEmployeeAction(
  employeeId: string,
  employeeData: Partial<EmployeeFormData>
): Promise<{ success: boolean; data?: EmployeeCard; error?: string }> {
  try {
    const supabase = await createClient();

    // Get existing card to preserve theme and verify access
    const { data: existingCard, error: fetchError } = await supabase
      .from("employee_cards")
      .select("*")
      .eq("employee_id", employeeId)
      .single();

    if (fetchError || !existingCard) {
      return {
        success: false,
        error: `Employee not found: ${employeeId}`,
      };
    }

    // Verify user has access to this employee's company
    const theme = (existingCard as any).theme || {};
    const cardCompanyId = (existingCard as any).company_id || theme?.company_id;
    const userCompanyId = await getCurrentUserCompanyId();
    
    if (userCompanyId !== cardCompanyId) {
      return {
        success: false,
        error: "Unauthorized: You don't have access to this employee",
      };
    }

    // Handle photo upload if new file provided
    let photoUrl = employeeData.photoUrl ?? (existingCard as any).photo_url;
    if (employeeData.photoFile) {
      photoUrl = await uploadEmployeePhoto(employeeData.photoFile, employeeId);
    }
    
    // Use default profile picture if no photo provided (for new employees or when photo is removed)
    if (!photoUrl) {
      photoUrl = DEFAULT_PROFILE_PICTURE_URL;
    }

    // Update theme with name/title/title_translations if provided
    const updatedTheme = { ...theme };
    if (employeeData.firstName && employeeData.lastName) {
      updatedTheme.name = `${employeeData.firstName} ${employeeData.lastName}`;
    }
    if (employeeData.title) {
      updatedTheme.title = employeeData.title;
    }
    if (employeeData.titleTranslations !== undefined) {
      if (employeeData.titleTranslations && Object.keys(employeeData.titleTranslations).length > 0) {
        updatedTheme.title_translations = employeeData.titleTranslations;
      } else {
        delete updatedTheme.title_translations;
      }
    }
    // Preserve company_id
    if (updatedTheme.company_id) {
      updatedTheme.company_id = updatedTheme.company_id;
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
    updateData.theme = updatedTheme;

    // @ts-expect-error - Supabase type inference issue with dynamic update objects
    const { data, error } = await supabase
      .from("employee_cards")
      .update(updateData)
      .eq("employee_id", employeeId)
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: `Failed to update employee: ${error.message}`,
      };
    }

    revalidatePath('/dashboard/company');
    return {
      success: true,
      data: data as EmployeeCard,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to update employee",
    };
  }
}

/**
 * Delete an employee card (Server Action)
 */
export async function deleteEmployeeAction(
  employeeId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // Verify user has access to this employee
    const { data: existingCard } = await supabase
      .from("employee_cards")
      .select("company_id, theme")
      .eq("employee_id", employeeId)
      .single();

    if (existingCard) {
      const cardCompanyId = (existingCard as any).company_id || (existingCard as any).theme?.company_id;
      const userCompanyId = await getCurrentUserCompanyId();
      
      if (userCompanyId !== cardCompanyId) {
        return {
          success: false,
          error: "Unauthorized: You don't have access to this employee",
        };
      }
    }

    const { error } = await supabase
      .from("employee_cards")
      .delete()
      .eq("employee_id", employeeId);

    if (error) {
      return {
        success: false,
        error: `Failed to delete employee: ${error.message}`,
      };
    }

    revalidatePath('/dashboard/company');
    return {
      success: true,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to delete employee",
    };
  }
}

/**
 * Toggle employee active status (Server Action)
 */
export async function toggleEmployeeStatusAction(
  employeeId: string,
  isActive: boolean
): Promise<{ success: boolean; data?: EmployeeCard; error?: string }> {
  try {
    const supabase = await createClient();

    // Verify user has access to this employee
    const { data: existingCard } = await supabase
      .from("employee_cards")
      .select("company_id, theme")
      .eq("employee_id", employeeId)
      .single();

    if (existingCard) {
      const cardCompanyId = (existingCard as any).company_id || (existingCard as any).theme?.company_id;
      const userCompanyId = await getCurrentUserCompanyId();
      
      if (userCompanyId !== cardCompanyId) {
        return {
          success: false,
          error: "Unauthorized: You don't have access to this employee",
        };
      }
    }

    const { data, error } = await supabase
      .from("employee_cards")
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq("employee_id", employeeId)
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: `Failed to update employee status: ${error.message}`,
      };
    }

    revalidatePath('/dashboard/company');
    return {
      success: true,
      data: data as EmployeeCard,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to update employee status",
    };
  }
}

/**
 * Get all employees for a company (Server Action)
 * Uses company_id column for efficient server-side filtering
 */
export async function getEmployeesByCompanyAction(
  companyId: string
): Promise<{ success: boolean; data?: EmployeeWithCard[]; error?: string }> {
  try {
    const supabase = await createClient();

    // Verify user has access to this company
    const userCompanyId = await getCurrentUserCompanyId();
    if (userCompanyId !== companyId) {
      return {
        success: false,
        error: "Unauthorized: You don't have access to this company",
      };
    }

    // Try to use company_id column first (after migration)
    // Fallback to theme JSON filtering if column doesn't exist yet
    let query = supabase
      .from("employee_cards")
      .select("*")
      .order("created_at", { ascending: false });

    // Try to filter by company_id column (if migration has been run)
    // If column doesn't exist, Supabase will return an error
    const { data, error } = await query.eq("company_id", companyId);

    if (error) {
      // If error suggests column doesn't exist, try fetching all and filtering client-side
      if (error.message && (
        error.message.includes("column") || 
        error.message.includes("does not exist") ||
        error.code === "PGRST116" // PostgREST error for missing column
      )) {
        // Column doesn't exist yet, fetch all and filter by theme JSON (backward compatibility)
        const { data: allData, error: allError } = await supabase
          .from("employee_cards")
          .select("*")
          .order("created_at", { ascending: false });

        if (allError) {
          return {
            success: false,
            error: `Failed to fetch employees: ${allError.message}`,
          };
        }

        // Filter by company_id in theme JSON
        const cards = (allData || []) as any[];
        const filteredCards = cards.filter((card) => {
          const theme = card.theme as any;
          return theme?.company_id === companyId;
        });

        // Map to include name, title, and title_translations
        const mappedCards = filteredCards.map((card) => {
          const theme = card.theme as any;
          return {
            ...card,
            name: theme?.name,
            title: theme?.title,
            title_translations: theme?.title_translations,
          };
        }) as EmployeeWithCard[];

        return {
          success: true,
          data: mappedCards,
        };
      }

      // Other error - return it
      return {
        success: false,
        error: `Failed to fetch employees: ${error.message}`,
      };
    }

    // Query succeeded with company_id column - data is already filtered
    const cards = (data || []) as any[];

    // Map to include name, title, and title_translations
    const mappedCards = cards.map((card) => {
      const theme = card.theme as any;
      return {
        ...card,
        name: theme?.name,
        title: theme?.title,
        title_translations: theme?.title_translations,
      };
    }) as EmployeeWithCard[];

    return {
      success: true,
      data: mappedCards,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to fetch employees",
    };
  }
}

