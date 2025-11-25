export type UserRole = "super_admin" | "company_admin" | "employee";

export interface User {
  id: string;
  company_id: string | null;
  email: string;
  role: UserRole;
  first_name: string | null;
  last_name: string | null;
  title: string | null;
  created_at: string;
}

export interface Company {
  id: string;
  name: string;
  slug: string;
  subscription_plan: string;
  subscription_status: "active" | "expired" | "pending" | "cancelled";
  description: string | null;
  banner_url: string | null;
  logo_url: string | null;
  footer_text: string | null;
  website_url: string | null;
  created_at: string;
}

export interface CompanyService {
  id: string;
  company_id: string;
  title: string;
  description: string;
  icon_name: string | null;
  display_order: number;
  created_at: string;
}

export interface ContactLinks {
  phone: string; // REQUIRED
  whatsapp?: string; // OPTIONAL
  email: string; // REQUIRED
  website?: string; // OPTIONAL (company website)
}

export interface SocialLinks {
  facebook?: string; // OPTIONAL
  linkedin: string; // REQUIRED
  instagram?: string; // OPTIONAL
}

export interface BusinessHours {
  monday?: { open: string; close: string; closed: boolean };
  tuesday?: { open: string; close: string; closed: boolean };
  wednesday?: { open: string; close: string; closed: boolean };
  thursday?: { open: string; close: string; closed: boolean };
  friday?: { open: string; close: string; closed: boolean };
  saturday?: { open?: string; close?: string; closed: boolean };
  sunday?: { open?: string; close?: string; closed: boolean };
}

export interface EmployeeCard {
  id: string;
  employee_id: string;
  public_slug: string;
  photo_url: string | null;
  contact_links: ContactLinks;
  social_links: SocialLinks;
  business_hours: BusinessHours | null;
  theme: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface NFCTag {
  id: string;
  employee_id: string;
  encoded_url: string;
  qr_image_url: string;
  created_at: string;
}

export interface AnalyticsEvent {
  id: string;
  card_id: string;
  event_type: "scan" | "visit" | "click";
  metadata: Record<string, any>;
  created_at: string;
}

export interface EmployeeWithCard extends EmployeeCard {
  name?: string;
  title?: string;
}