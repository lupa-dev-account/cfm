"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Loading } from "@/components/ui/loading";
import { ShareModal } from "@/app/components/card/share-modal";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import type { EmployeeWithCard } from "@/lib/types";
import type { Database } from "@/lib/types/database";
import { parsePhoneNumber, formatNumber } from "libphonenumber-js";
import { translateTitle } from "@/lib/utils/title-translator";

import {
  FaMeta,
  FaWhatsapp,
  FaLinkedin,
  FaInstagram
} from "react-icons/fa6";
import {
  MdEmail,
  MdPhone,
  MdShare,
  MdSave
} from "react-icons/md";
import {
  TbWorld,
  TbChevronLeft,
  TbChevronRight
} from "react-icons/tb";

// Format phone number for display using country-specific conventions
// Uses libphonenumber-js to format according to each country's standards
// Examples:
//   Mozambique: +258846017490 -> +258 84 6017 490
//   US: +14155552671 -> +1 415 555 2671
//   UK: +442071838750 -> +44 20 7183 8750
const formatPhoneNumber = (phone: string): string => {
  if (!phone) return phone;
  try {
    // Remove existing spaces first
    const cleaned = phone.replace(/\s/g, "");
    // Parse the phone number first
    const phoneNumber = parsePhoneNumber(cleaned);
    if (!phoneNumber) return cleaned;
    // Format as INTERNATIONAL which includes country code with proper spacing
    // This automatically uses the correct format for each country
    return phoneNumber.formatInternational();
  } catch (error) {
    // If parsing fails, return cleaned version (E.164 format)
    // This shouldn't happen if numbers are stored correctly, but fallback is safe
    return phone.replace(/\s/g, "");
  }
};

type ContactItemProps = {
  icon: React.ElementType;
  href: string;
  children: React.ReactNode;
  external?: boolean; // for links that should open in a new tab
};

const ContactItem: React.FC<ContactItemProps> = ({ icon: Icon, href, children, external }) => {
  return (
    <div className="flex items-center gap-3 p-4 bg-white border-2 border-green-700 rounded-xl">
      <Icon className="p-1.5 h-10 w-10 bg-green-700 text-white rounded-full flex-shrink-0" />
      <a
        href={href}
        className="text-black text-base font-medium hover:text-green-700 flex-1 break-all"
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
      </a>
    </div>
  );
};


type SectionTitleProps = {
  children: React.ReactNode;
};

const SectionTitle: React.FC<SectionTitleProps> = ({ children }) => {
  // Force re-render by using a key based on children content
  return (
    <h2 className="text-3xl font-bold text-center text-black mb-6 relative w-fit mx-auto" key={String(children)}>
      {children}
      <span className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-20 h-[4px] bg-green-700 rounded"></span>
    </h2>
  );
};


type CompanyService = Database["public"]["Tables"]["company_services"]["Row"];

type ServiceCardProps = {
  service: CompanyService;
  websiteUrl?: string | null;
};

const ServiceCard: React.FC<ServiceCardProps> = ({ service, websiteUrl }) => {
  const t = useTranslations('common');
  const params = useParams();
  // Get locale directly from URL params (route is [locale]/card/[slug])
  const currentLocale = (params?.locale as string) || useLocale() || 'en';

  // Get translated title and description
  // Check for title_translations and description_translations first (JSONB columns)
  const titleTranslations = (service as any).title_translations;
  const descTranslations = (service as any).description_translations;

  // Calculate translations - use currentLocale directly without useMemo to ensure reactivity
  let title = service.title;
  if (titleTranslations && typeof titleTranslations === 'object') {
    title = titleTranslations[currentLocale] || titleTranslations[currentLocale.toLowerCase()] || titleTranslations['en'] || service.title;
  }

  let description = service.description;
  if (descTranslations && typeof descTranslations === 'object') {
    description = descTranslations[currentLocale] || descTranslations[currentLocale.toLowerCase()] || descTranslations['en'] || service.description;
  }
  
  return (
    <div className="w-full h-full rounded-xl bg-gray-100 border border-gray-200 p-4 md:p-5 flex flex-col items-center text-center">
      {service.icon_name && (
        <>
          {service.icon_name.startsWith("http") ? (
            <div className="mb-4 flex justify-center">
              <div className="relative w-24 h-24 md:w-28 md:h-28">
                <Image
                  src={service.icon_name}
                  alt={title}
                  fill
                  sizes="(max-width: 768px) 96px, 112px"
                  className="object-contain"
                />
              </div>
            </div>
          ) : (
            <div className="text-5xl md:text-6xl mb-4">
              {service.icon_name}
            </div>
          )}
        </>
      )}

      <h3 className="font-semibold text-black mb-1 text-base md:text-lg" key={`title-${currentLocale}`}>
        {title}
      </h3>

      <p className="text-xs md:text-sm text-gray-600 mb-3 line-clamp-3" key={`desc-${currentLocale}`}>
        {description}
      </p>

      {websiteUrl && (
        <a
          href={websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto bg-green-800 text-white px-4 py-2 rounded text-xs md:text-sm hover:bg-green-700 inline-block"
        >
          {t('learnMore')}
        </a>
      )}
    </div>
  );
};



type SocialIconProps = {
  icon: React.ElementType;
  href: string;
};

const SocialIcon: React.FC<SocialIconProps> = ({ icon: Icon, href }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="w-12 h-12 rounded-full bg-green-800 text-white flex items-center justify-center hover:bg-green-700 transition-colors"
  >
    <Icon className="h-6 w-6" />
  </a>
);




// Shared class names for repeated styles
const carouselButtonBase =
  "absolute top-1/2 -translate-y-1/2 z-10 bg-white border border-green-800 rounded-full p-2 hover:bg-green-50";

const moreTileClass =
  "flex flex-col items-center gap-1.5 p-3 border border-green-800 rounded hover:bg-green-50 transition-colors";

const moreIconClass = "h-4 w-4 text-green-600";
const moreLabelClass = "text-xs text-black";


/**
 * Escape special characters in vCard values
 */
function escapeVCardValue(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;")
    .replace(/\n/g, "\\n");
}

/**
 * Generate vCard format for phonebook integration
 */
function generateVCard(card: EmployeeWithCard, photoBase64?: string, photoType?: string, locale?: string, t?: (key: string) => string): string {
  const contactLinks = card.contact_links;
  const company = card.company;

  let vcard = "BEGIN:VCARD\r\n";
  vcard += "VERSION:3.0\r\n";

  // Name - properly formatted for phonebook
  if (card.name) {
    const nameParts = card.name.trim().split(/\s+/);
    const lastName = nameParts.length > 1 ? nameParts.slice(-1)[0] : "";
    const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(" ") : nameParts[0] || "";

    vcard += `FN:${escapeVCardValue(card.name)}\r\n`;
    vcard += `N:${escapeVCardValue(lastName)};${escapeVCardValue(firstName)};;;\r\n`;
  }

  // Title and Organization - use translated title if available
  const theme = card.theme as any;
  const titleTranslations = theme?.title_translations;
  // Use translated title for current locale, fallback to original
  const vCardTitle = translateTitle(card.title, titleTranslations, locale, t);
  if (vCardTitle) {
    vcard += `TITLE:${escapeVCardValue(vCardTitle)}\r\n`;
  }
  if (company?.name) {
    vcard += `ORG:${escapeVCardValue(company.name)}\r\n`;
  }

  // Phone - primary contact (mandatory field)
  const cleanPhone = contactLinks.phone.replace(/[^\d+]/g, "");
  vcard += `TEL;TYPE=CELL,VOICE:${cleanPhone}\r\n`;

  // Phone2 - secondary contact
  if (contactLinks.phone2) {
    const cleanPhone2 = contactLinks.phone2.replace(/[^\d+]/g, "");
    vcard += `TEL;TYPE=CELL,VOICE:${cleanPhone2}\r\n`;
  }

  // WhatsApp - always include if provided
  if (contactLinks.whatsapp) {
    const cleanWhatsApp = contactLinks.whatsapp.replace(/[^\d+]/g, "");
    vcard += `TEL;TYPE=CELL,WA:${cleanWhatsApp}\r\n`;
  }

  // WhatsApp2 - always include if provided
  if (contactLinks.whatsapp2) {
    const cleanWhatsApp2 = contactLinks.whatsapp2.replace(/[^\d+]/g, "");
    vcard += `TEL;TYPE=CELL,WA:${cleanWhatsApp2}\r\n`;
  }

  // Email
  if (contactLinks.email) {
    vcard += `EMAIL;TYPE=INTERNET:${contactLinks.email}\r\n`;
  }

  // Website
  if (contactLinks.website) {
    vcard += `URL:${contactLinks.website}\r\n`;
  } else if (company?.website_url) {
    vcard += `URL:${company.website_url}\r\n`;
  }

  // Photo - embedded as base64 (most reliable for contact apps)
  if (photoBase64) {
    // Determine image type (default to JPEG if not specified)
    const imageType = photoType || "JPEG";
    // vCard 3.0 format: PHOTO;ENCODING=b;TYPE=JPEG:base64data
    // Note: Some apps require the base64 to be on a single line, others allow line breaks
    // We'll keep it on one line for maximum compatibility
    vcard += `PHOTO;ENCODING=b;TYPE=${imageType}:${photoBase64}\r\n`;
  } else if (card.photo_url) {
    // Fallback to URL if base64 not available (less reliable but better than nothing)
    vcard += `PHOTO;VALUE=URI;TYPE=URL:${card.photo_url}\r\n`;
  }

  // Note/Description
  const notes = [];
  if (company?.description) {
    notes.push(company.description);
  }
  // Use translated title for notes if available
  const displayTitleForVCard = translateTitle(card.title, titleTranslations, locale, t);
  if (displayTitleForVCard && company?.name) {
    notes.push(`${displayTitleForVCard} at ${company.name}`);
  }
  if (notes.length > 0) {
    vcard += `NOTE:${escapeVCardValue(notes.join("\\n"))}\r\n`;
  }

  // Social links as custom fields
  if (company?.linkedin_url) {
    vcard += `X-SOCIALPROFILE;TYPE=linkedin:${company.linkedin_url}\r\n`;
  }
  if (company?.facebook_url) {
    vcard += `X-SOCIALPROFILE;TYPE=facebook:${company.facebook_url}\r\n`;
  }
  if (company?.instagram_url) {
    vcard += `X-SOCIALPROFILE;TYPE=instagram:${company.instagram_url}\r\n`;
  }

  // Card URL for reference
  if (typeof window !== "undefined") {
    vcard += `URL;TYPE=OTHER:${window.location.href}\r\n`;
  }

  vcard += "END:VCARD\r\n";
  return vcard;
}



export default function EmployeeCardPage() {
  const params = useParams();
  const slug = params.slug as string;
  // Use useLocale() hook for reactivity - it will trigger re-renders when locale changes
  const locale = useLocale();
  // Use translations - this will automatically update when locale changes
  const t = useTranslations('common');
  const [card, setCard] = useState<EmployeeWithCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [serviceIndex, setServiceIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const supabase = createClient();
  
  // Check if current locale is RTL
  const isRTL = ['ar', 'he', 'fa', 'ur'].includes(locale);

  useEffect(() => {
    const checkIsMobile = () => {
      if (typeof window !== "undefined") {
        setIsMobile(window.innerWidth < 768);
      }
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);
  
  useEffect(() => {
    async function loadCard() {
      if (!slug) {
        setError(t('invalidCardLink'));
        setLoading(false);
        return;
      }

      try {
        // Fetch employee card
        const { data, error: fetchError } = await supabase
          .from("employee_cards")
          .select("*")
          .eq("public_slug", slug)
          .eq("is_active", true)
          .single();

        if (fetchError) {
          setError(t('cardNotFoundOrInactive'));
          setLoading(false);
          return;
        }

        if (!data) {
          setError(t('cardNotFound'));
          setLoading(false);
          return;
        }

        // Extract theme data
        const theme = (data as any).theme;

        // Try to fetch user/employee data (optional - may not be linked properly)
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", (data as any).employee_id)
          .maybeSingle(); // Use maybeSingle() instead of single() to avoid error when no user exists

        if (userError) {
          if (process.env.NODE_ENV === 'development') {
            console.warn("Could not fetch user data (may not be linked):", userError);
          }
        }

        // Determine company_id from user relationship or fallback to theme
        const companyId = (userData as any)?.company_id || theme?.company_id;

        // Fetch company data and services
        let companyData = null;
        let servicesData = null;

        if (companyId) {
          const [companyResult, servicesResult] = await Promise.all([
            supabase
              .from("companies")
              .select("id, name, slug, subscription_plan, subscription_status, description, description_translations, banner_url, logo_url, footer_text, website_url, linkedin_url, facebook_url, instagram_url, business_hours, created_at")
              .eq("id", companyId)
              .single(),
            supabase
              .from("company_services")
              .select("id, company_id, title, description, title_translations, description_translations, icon_name, display_order, created_at")
              .eq("company_id", companyId)
              .order("display_order", { ascending: true }),
          ]);

          companyData = companyResult.data;
          servicesData = servicesResult.data || [];

          if (companyResult.error) {
            if (process.env.NODE_ENV === 'development') {
              console.error("Failed to fetch company data:", companyResult.error);
            }
          }
          if (servicesResult.error) {
            if (process.env.NODE_ENV === 'development') {
              console.error("Failed to fetch services data:", servicesResult.error);
            }
          }
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.warn("No company_id found in user or theme data");
          }
        }

        // Create card with metadata - prefer theme data, fallback to user data
        const cardWithMetadata: EmployeeWithCard = {
          ...(data as any),
          name: theme?.name || (userData ? `${(userData as any).first_name || ''} ${(userData as any).last_name || ''}`.trim() : null) || t('employee'),
          title: theme?.title || (userData as any)?.title || "",
          title_translations: theme?.title_translations || undefined,
          company: companyData,
          services: servicesData,
        };

        setCard(cardWithMetadata);
      } catch (err: any) {
        if (process.env.NODE_ENV === 'development') {
          console.error("Error loading card:", err);
        }
        setError(err.message || "Failed to load card");
      } finally {
        setLoading(false);
      }
    }

    loadCard();
  }, [slug, supabase, t, locale]); // Include locale to reload when language changes

  // Force re-render when locale changes to update translations
  useEffect(() => {
    // This effect ensures the component re-renders when locale changes
  }, [locale]);

  // Auto-rotate services carousel
  useEffect(() => {
    if (!card?.services) return;

    const services = card.services;
    const itemsPerSlide = isMobile ? 1 : 2;
    const slideCount = Math.ceil(services.length / itemsPerSlide);

    if (slideCount <= 1) return;

    const id = setInterval(() => {
      setServiceIndex((prev) => (prev + 1) % slideCount);
    }, 5000);

    return () => clearInterval(id);
  }, [card?.services, isMobile]);

  // Reset slide index if it's out of range when services/screen size changes
  useEffect(() => {
    if (!card?.services) return;
    const itemsPerSlide = isMobile ? 1 : 2;
    const slideCount = Math.ceil(card.services.length / itemsPerSlide);
    if (serviceIndex >= slideCount) {
      setServiceIndex(0);
    }
  }, [card?.services, isMobile, serviceIndex]);

  const handleDownloadVCard = async () => {
    if (!card) return;

    let photoBase64: string | undefined;
    let photoType: string | undefined;

    // Try to fetch and convert photo to base64
    if (card.photo_url) {
      try {
        const response = await fetch(card.photo_url);
        if (response.ok) {
          const blob = await response.blob();
          
          // Convert blob to base64
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
              const base64String = (reader.result as string).split(',')[1];
              resolve(base64String);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });

          photoBase64 = base64;
          
          // Determine image type from blob
          const mimeType = blob.type;
          if (mimeType.includes('jpeg') || mimeType.includes('jpg')) {
            photoType = 'JPEG';
          } else if (mimeType.includes('png')) {
            photoType = 'PNG';
          } else if (mimeType.includes('gif')) {
            photoType = 'GIF';
          } else if (mimeType.includes('webp')) {
            photoType = 'WEBP';
          } else {
            photoType = 'JPEG'; // Default fallback
          }
        }
      } catch (error) {
        // If image fetch fails, we'll fall back to URL method in generateVCard
        if (process.env.NODE_ENV === 'development') {
          console.warn('Failed to fetch photo for vCard, falling back to URL:', error);
        }
      }
    }

    const vCardData = generateVCard(card, photoBase64, photoType, locale, t);
    const blob = new Blob([vCardData], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${card.name?.replace(/\s+/g, "-") || "contact"}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading size="lg" />
      </div>
    );
  }

  if (error || !card) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-black mb-2">{t('cardNotFound')}</h1>
          <p className="text-gray-600">{error || t('cardNotFoundDesc')}</p>
        </div>
      </div>
    );
  }

  const theme = card.theme as any;
  const contactLinks = card.contact_links;
  const socialLinks = card.social_links;
  const company = card.company;
  // Use company business hours (all employees share same hours)
  const businessHours = company?.business_hours || card.business_hours;
  const services = card.services || [];

  // Build slides based on screen size
  const itemsPerSlide = isMobile ? 1 : 2;
  const slides: CompanyService[][] = [];
  for (let i = 0; i < services.length; i += itemsPerSlide) {
    slides.push(services.slice(i, i + itemsPerSlide));
  }

  const nextService = () => {
    setServiceIndex((prev) => (prev + 1) % slides.length);
  };

  const prevService = () => {
    setServiceIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };
  
  // For RTL, reverse the transform direction
  const getTransform = () => {
    const translateValue = serviceIndex * 100;
    return isRTL ? `translateX(${translateValue}%)` : `translateX(-${translateValue}%)`;
  };
  

  

  return (
    <div className="min-h-screen bg-gray-100" key={`card-${locale}`}>
      {/* Centered container with max-width */}
      <div className="max-w-md mx-auto bg-white shadow-xl min-h-screen rounded-lg overflow-hidden">
        {/* Header Section with Company Banner */}
        <header className="relative h-[240px] border-b-2 border-green-800 overflow-hidden">
          {company?.banner_url && (
            <Image
              src={company.banner_url}
              alt={company.name || t('companyBanner')}
              fill
              sizes="(max-width: 768px) 100vw, 448px"
              className="object-cover"
              loading="eager"
              priority
            />
          )}

          {/* Simple gray overlay on top of the image */}
          <div className="absolute inset-0 bg-[rgba(17,17,17,0.12)] pointer-events-none" />

          {/* Language Switcher - Top Right */}
          <div className="absolute top-3 right-3 z-50">
            <LanguageSwitcher variant="inline" />
          </div>
        </header>

        {/* Profile Picture - Overlapping the green line */}
        <div className="relative flex justify-center mb-6 z-20 mt-[-68px]">
          {card.photo_url ? (
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-green-800 shadow-lg bg-white">
              <Image
                src={card.photo_url}
                alt={card.name || t('profile')}
                fill
                sizes="128px"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-200 border-4 border-green-800 shadow-lg flex items-center justify-center">
              <span className="text-gray-400 text-3xl">
                {card.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase() || "?"}
              </span>
            </div>
          )}
        </div>

        {/* Profile Section */}
        <div className="bg-white px-4 pb-3">

          {/* Name */}
          <h1 className="text-3xl font-bold text-black text-center mb-1">
            {card.name || t('unnamedEmployee')}
          </h1>

          {/* Title */}
          {(() => {
            // Get translated title from theme (if available)
            const theme = card.theme as any;
            const titleTranslations = theme?.title_translations;
            const displayTitle = translateTitle(card.title, titleTranslations, locale, t);

            return displayTitle ? (
              <p className="text-lg text-green-600 text-center font-normal mb-2">
                {displayTitle}
              </p>
            ) : null;
          })()}

          {/* Company Description */}
          {(() => {
            // Get translated company description
            const companyDescTranslations = (company as any)?.description_translations;

            const companyDescription = companyDescTranslations && typeof companyDescTranslations === 'object'
              ? (companyDescTranslations[locale] || companyDescTranslations[locale.toLowerCase()] || companyDescTranslations['en'] || company?.description)
              : (company?.description || '');

            return companyDescription ? (
              <div className="mb-3">
                <p className="text-gray-700 text-sm leading-relaxed text-center opacity-80">
                  {companyDescription}
                </p>
              </div>
            ) : null;
          })()}
        </div>

        <main className="px-4 py-4">

          {/* Contact Section */}
          <section className="mb-8" key={`contact-${locale}`}>
          <SectionTitle key={`contact-title-${locale}`}>{t('contact')}</SectionTitle>


  <div className="space-y-3">
    {/* WhatsApp - always show if provided */}
    {contactLinks.whatsapp && (
      <ContactItem icon={FaWhatsapp} href={`https://wa.me/${contactLinks.whatsapp.replace(/[^\d]/g, "")}`}>
        {formatPhoneNumber(contactLinks.whatsapp)}
      </ContactItem>
    )}

    {/* Second WhatsApp - always show if provided */}
    {contactLinks.whatsapp2 && (
      <ContactItem icon={FaWhatsapp} href={`https://wa.me/${contactLinks.whatsapp2.replace(/[^\d]/g, "")}`}>
        {formatPhoneNumber(contactLinks.whatsapp2)}
      </ContactItem>
    )}

    {/* Primary Phone - mandatory field */}
    <ContactItem icon={MdPhone} href={`tel:${contactLinks.phone.replace(/\s/g, "")}`}>
      {formatPhoneNumber(contactLinks.phone)}
    </ContactItem>

    {/* Secondary Phone - always show if provided */}
    {contactLinks.phone2 && (
      <ContactItem icon={MdPhone} href={`tel:${contactLinks.phone2.replace(/\s/g, "")}`}>
        {formatPhoneNumber(contactLinks.phone2)}
      </ContactItem>
    )}

    {contactLinks.email && (
      <ContactItem icon={MdEmail} href={`mailto:${contactLinks.email}`}>
        {contactLinks.email}
      </ContactItem>
    )}

    {company?.website_url && (
      <ContactItem icon={TbWorld} href={company.website_url} external>
        {company.website_url}
      </ContactItem>
    )}
  </div>
</section>


          {/* Services Section with Carousel */}
          {slides.length > 0 && (
  <section className="mb-8" key={`services-${locale}`}>
    <SectionTitle key={`services-title-${locale}`}>{t('services')}</SectionTitle>

    <div className="relative">
      {slides.length > 1 && (
        <button
          onClick={isRTL ? nextService : prevService}
          className={`${carouselButtonBase} -left-3`}
          aria-label={isRTL ? t('nextService') : t('previousService')}
        >
          <TbChevronLeft className="h-5 w-5 text-green-600" />
        </button>
      )}

      {/* Slider viewport */}
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: getTransform() }}
        >
          {slides.map((slide, idx) => (
            <div key={idx} className="min-w-full px-1">
            <div
              className={
                slide.length === 1 && !isMobile
                  ? "grid grid-cols-1 place-items-center gap-3 items-stretch"
                  : "grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch"
              }
            >
              {slide.map((service) => (
                <ServiceCard
                  key={`service-${service.id}-${locale}`}
                  service={service}
                  websiteUrl={company?.website_url}
                />
              ))}
            </div>
          </div>

          ))}
        </div>
      </div>

      {slides.length > 1 && (
        <button
          onClick={isRTL ? prevService : nextService}
          className={`${carouselButtonBase} -right-3`}
          aria-label={isRTL ? t('previousService') : t('nextService')}
        >
          <TbChevronRight className="h-5 w-5 text-green-600" />
        </button>
      )}
    </div>
  </section>
)}




          {/* Business Hours - Always Show */}
  <section className="mb-6">
    <div className="bg-gray-100 rounded-xl px-4 py-6">
      <SectionTitle>{t('businessHours')}</SectionTitle>

      <div className="mt-4 mx-auto w-[260px] md:w-[280px] divide-y divide-gray-500">

  {[
    { day: t('monday'), key: "monday" },
    { day: t('tuesday'), key: "tuesday" },
    { day: t('wednesday'), key: "wednesday" },
    { day: t('thursday'), key: "thursday" },
    { day: t('friday'), key: "friday" },
    { day: t('saturday'), key: "saturday" },
    { day: t('sunday'), key: "sunday" },
  ].map(({ day, key }) => {
    const hours = businessHours?.[key as keyof typeof businessHours];
    const isClosed = !businessHours || hours?.closed || !hours?.open || !hours?.close;
    const label = isClosed ? t('closed') : `${hours.open} - ${hours.close}`;

    return (
      <div
        key={key}
        className="flex justify-center py-2"
      >
        {/* Column container */}
        <div className="flex w-[260px] md:w-[280px] justify-between">
          <span className="text-green-700 font-semibold text-sm md:text-base">
            {day}
          </span>

          <span className="text-black text-sm md:text-base text-right">
            {label}
          </span>
        </div>
      </div>
    );
  })}
</div>

    </div>
  </section>


          {/* Social Media Links - Company social media */}
{(company?.facebook_url || company?.linkedin_url || company?.instagram_url) && (
  <section className="mb-6">
    <div className="flex justify-center gap-4">
      {company.facebook_url && (
        <SocialIcon icon={FaMeta} href={company.facebook_url} />
      )}

      {company.linkedin_url && (
        <SocialIcon icon={FaLinkedin} href={company.linkedin_url} />
      )}

      {company.instagram_url && (
        <SocialIcon icon={FaInstagram} href={company.instagram_url!} />
      )}
    </div>
  </section>
)}


          {/* More Section */}
<section className="mb-4">
  <SectionTitle>{t('more')}</SectionTitle>

  <div className="grid grid-cols-3 gap-2">
    <button onClick={handleDownloadVCard} className={moreTileClass}>
      <MdSave className={moreIconClass} />
      <span className={moreLabelClass}>{t('save')}</span>
    </button>

    <button
      onClick={() => setShareModalOpen(true)}
      className={moreTileClass}
    >
      <MdShare className={moreIconClass} />
      <span className={moreLabelClass}>{t('share')}</span>
    </button>

    <a
      href={`tel:${contactLinks.phone.replace(/\s/g, "")}`}
      className={moreTileClass}
    >
      <MdPhone className={moreIconClass} />
      <span className={moreLabelClass}>{t('contact')}</span>
    </a>
  </div>
</section>

        </main>

        {/* Footer */}
        <footer className="bg-green-800 text-white py-4 rounded-t-lg">
          <div className="px-4 text-center text-xs">
            © {new Date().getFullYear()} {company?.name || t('company')}
            {company?.footer_text && ` - ${company.footer_text}`}. {t('allRightsReserved')}.
          </div>
        </footer>
      </div>

      {/* Share Modal */}
      {card && (
        <ShareModal
          open={shareModalOpen}
          onOpenChange={setShareModalOpen}
          card={card}
        />
      )}
    </div>
  );
}