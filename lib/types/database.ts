export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string;
          name: string;
          slug: string;
          subscription_plan: string;
          subscription_status: string;
          description: string | null;
          banner_url: string | null;
          logo_url: string | null;
          footer_text: string | null;
          website_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          subscription_plan: string;
          subscription_status?: string;
          description?: string | null;
          banner_url?: string | null;
          logo_url?: string | null;
          footer_text?: string | null;
          website_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          subscription_plan?: string;
          subscription_status?: string;
          description?: string | null;
          banner_url?: string | null;
          logo_url?: string | null;
          footer_text?: string | null;
          website_url?: string | null;
          created_at?: string;
        };
      };
      company_services: {
        Row: {
          id: string;
          company_id: string;
          title: string;
          description: string;
          icon_name: string | null;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          title: string;
          description: string;
          icon_name?: string | null;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          title?: string;
          description?: string;
          icon_name?: string | null;
          display_order?: number;
          created_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          company_id: string | null;
          email: string;
          password_hash: string | null;
          role: string;
          first_name: string | null;
          last_name: string | null;
          title: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id?: string | null;
          email: string;
          password_hash?: string | null;
          role: string;
          first_name?: string | null;
          last_name?: string | null;
          title?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string | null;
          email?: string;
          password_hash?: string | null;
          role?: string;
          first_name?: string | null;
          last_name?: string | null;
          title?: string | null;
          created_at?: string;
        };
      };
      employee_cards: {
        Row: {
          id: string;
          employee_id: string;
          public_slug: string;
          photo_url: string | null;
          contact_links: Json;
          social_links: Json;
          business_hours: Json | null;
          theme: Json;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          public_slug: string;
          photo_url?: string | null;
          contact_links?: Json;
          social_links?: Json;
          business_hours?: Json | null;
          theme?: Json;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          employee_id?: string;
          public_slug?: string;
          photo_url?: string | null;
          contact_links?: Json;
          social_links?: Json;
          business_hours?: Json | null;
          theme?: Json;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      nfc_tags: {
        Row: {
          id: string;
          employee_id: string;
          encoded_url: string;
          qr_image_url: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          encoded_url: string;
          qr_image_url: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          employee_id?: string;
          encoded_url?: string;
          qr_image_url?: string;
          created_at?: string;
        };
      };
      analytics_events: {
        Row: {
          id: string;
          card_id: string;
          event_type: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          card_id: string;
          event_type: string;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          card_id?: string;
          event_type?: string;
          metadata?: Json;
          created_at?: string;
        };
      };
    };
  };
}