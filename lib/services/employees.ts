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
  titleTranslations?: Record<string, string>; // Optional translations for the title in different locales
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
 * Magic bytes (file signatures) for image validation
 * This validates the actual file content, not just the extension/MIME type
 */
const IMAGE_SIGNATURES: Record<string, number[][]> = {
  'image/jpeg': [[0xFF, 0xD8, 0xFF]],
  'image/png': [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]],
  'image/gif': [[0x47, 0x49, 0x46, 0x38, 0x37, 0x61], [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]], // GIF87a or GIF89a
  'image/webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF header (WebP starts with RIFF)
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
      
      // Check if file starts with any of the expected signatures
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
    // Read first 8 bytes (enough for all image signatures)
    reader.readAsArrayBuffer(file.slice(0, 8));
  });
}

/**
 * Upload employee photo to Supabase Storage
 * Includes comprehensive security validation
 */
export async function uploadEmployeePhoto(
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

  // Validate file content (magic bytes) to prevent file type spoofing
  const isValidContent = await validateFileContent(file, file.type);
  if (!isValidContent) {
    throw new Error(
      'Invalid file content. File does not match its declared type. Only image files are allowed.'
    );
  }

  const supabase = createClient();
  
  // Use MIME type to determine extension (more secure than trusting file.name)
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

  // Store name, title, title_translations, and company_id in theme JSON
  const theme = {
    name: fullName,
    title: employeeData.title,
    company_id: companyId,
    ...(employeeData.titleTranslations && Object.keys(employeeData.titleTranslations).length > 0
      ? { title_translations: employeeData.titleTranslations }
      : {}),
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

  // Update theme with name/title/title_translations if provided, preserve company_id
  const theme = (existingCard as any).theme || {};
  if (employeeData.firstName && employeeData.lastName) {
    theme.name = `${employeeData.firstName} ${employeeData.lastName}`;
  }
  if (employeeData.title) {
    theme.title = employeeData.title;
  }
  // Update title_translations if provided
  if (employeeData.titleTranslations !== undefined) {
    if (employeeData.titleTranslations && Object.keys(employeeData.titleTranslations).length > 0) {
      theme.title_translations = employeeData.titleTranslations;
    } else {
      // Remove title_translations if empty object provided
      delete theme.title_translations;
    }
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

  // Filter by company_id stored in theme and map to include name, title, and title_translations
  const cards = (data || []) as any[];
  return cards
    .filter((card) => {
      const theme = card.theme as any;
      return theme?.company_id === companyId;
    })
    .map((card) => {
      const theme = card.theme as any;
      return {
        ...card,
        name: theme?.name,
        title: theme?.title,
        title_translations: theme?.title_translations,
      };
    }) as EmployeeWithCard[];
}

