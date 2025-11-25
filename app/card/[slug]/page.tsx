"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Loading } from "@/components/ui/loading";
import { ShareModal } from "@/app/components/card/share-modal";
import type { EmployeeWithCard } from "@/lib/types";
import {
  Mail,
  Globe,
  Facebook,
  Linkedin,
  Instagram,
  Save,
  Share2,
  PhoneCall,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
} from "lucide-react";

export default function EmployeeCardPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [card, setCard] = useState<EmployeeWithCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [serviceIndex, setServiceIndex] = useState(0);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function loadCard() {
      if (!slug) {
        setError("Invalid card link");
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
          setError("Card not found or inactive");
          setLoading(false);
          return;
        }

        if (!data) {
          setError("Card not found");
          setLoading(false);
          return;
        }

        // Extract theme data
        const theme = data.theme as any;

        // Try to fetch user/employee data (optional - may not be linked properly)
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", data.employee_id)
          .single();

        if (userError) {
          console.warn("Could not fetch user data (may not be linked):", userError);
        }

        // Determine company_id from user relationship or fallback to theme
        const companyId = userData?.company_id || theme?.company_id;

        // Fetch company data and services
        let companyData = null;
        let servicesData = null;

        if (companyId) {
          const [companyResult, servicesResult] = await Promise.all([
            supabase
              .from("companies")
              .select("*")
              .eq("id", companyId)
              .single(),
            supabase
              .from("company_services")
              .select("*")
              .eq("company_id", companyId)
              .order("display_order", { ascending: true }),
          ]);

          companyData = companyResult.data;
          servicesData = servicesResult.data || [];

          if (companyResult.error) {
            console.error("Failed to fetch company data:", companyResult.error);
          }
          if (servicesResult.error) {
            console.error("Failed to fetch services data:", servicesResult.error);
          }
        } else {
          console.warn("No company_id found in user or theme data");
        }

        // Create card with metadata - prefer theme data, fallback to user data
        const cardWithMetadata: EmployeeWithCard = {
          ...data,
          name: theme?.name || (userData ? `${userData.first_name || ''} ${userData.last_name || ''}`.trim() : null) || "Employee",
          title: theme?.title || userData?.title || "",
          company: companyData,
          services: servicesData,
        };

        setCard(cardWithMetadata);
      } catch (err: any) {
        console.error("Error loading card:", err);
        setError(err.message || "Failed to load card");
      } finally {
        setLoading(false);
      }
    }

    loadCard();
  }, [slug, supabase]);

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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Card Not Found</h1>
          <p className="text-gray-600">{error || "This card does not exist or is inactive."}</p>
        </div>
      </div>
    );
  }

  const theme = card.theme as any;
  const contactLinks = card.contact_links;
  const socialLinks = card.social_links;
  const businessHours = card.business_hours;
  const company = card.company;
  const services = card.services || [];

  const nextService = () => {
    setServiceIndex((prev) => (prev + 1) % services.length);
  };

  const prevService = () => {
    setServiceIndex((prev) => (prev - 1 + services.length) % services.length);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Centered container with max-width */}
      <div className="max-w-md mx-auto bg-white shadow-xl min-h-screen">
        {/* Header Section with Company Banner */}
        <header className="relative h-[240px] border-b-2 border-green-800 overflow-hidden">
          {company?.banner_url && (
            <Image
              src={company.banner_url}
              alt={company.name || "Company Banner"}
              fill
              className="object-cover"
            />
          )}

          {/* Simple gray overlay on top of the image */}
          <div className="absolute inset-0 bg-[rgba(17,17,17,0.12)] pointer-events-none" />
        </header>

        {/* Profile Picture - Overlapping the green line */}
        <div className="relative flex justify-center mb-6 z-20 mt-[-68px]">
          {card.photo_url ? (
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-green-800 shadow-lg bg-white">
              <Image
                src={card.photo_url}
                alt={card.name || "Profile"}
                fill
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
        <div className="bg-white px-4 pb-6">

          {/* Name */}
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
            {card.name || "Unnamed Employee"}
          </h1>

          {/* Title */}
          {card.title && (
            <p className="text-lg text-green-600 text-center font-semibold mb-4">
              {card.title}
            </p>
          )}

          {/* Company Description */}
          {company?.description && (
            <div className="mb-6">
              <p className="text-gray-700 text-sm leading-relaxed text-center">
                {company.description}
              </p>
            </div>
          )}
        </div>

        <main className="px-4 py-6">

          {/* Contact Section */}
          <section className="mb-6">
            <h2 className="text-lg font-semibold text-black text-center mb-4 underline">
              Contact
            </h2>
            <div className="space-y-3">
              {contactLinks.phone && (
                <div className="flex items-center gap-3 p-4 bg-white border border-green-800 rounded">
                  <MessageCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <a
                    href={`tel:${contactLinks.phone}`}
                    className="text-gray-900 hover:text-green-600 flex-1 break-all"
                  >
                    {contactLinks.phone}
                  </a>
                </div>
              )}
              {contactLinks.email && (
                <div className="flex items-center gap-3 p-4 bg-white border border-green-800 rounded">
                  <Mail className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <a
                    href={`mailto:${contactLinks.email}`}
                    className="text-gray-900 hover:text-green-600 flex-1 break-all"
                  >
                    {contactLinks.email}
                  </a>
                </div>
              )}
              {company?.website_url && (
                <div className="flex items-center gap-3 p-4 bg-white border border-green-800 rounded">
                  <Globe className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <a
                    href={company.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-900 hover:text-green-600 flex-1 break-all"
                  >
                    {company.website_url}
                  </a>
                </div>
              )}
            </div>
          </section>

          {/* Services Section with Carousel */}
          {services.length > 0 && (
            <section className="mb-6">
              <h2 className="text-lg font-semibold text-black text-center mb-4 underline">
                Services
              </h2>
              <div className="relative">
                {services.length > 1 && (
                  <button
                    onClick={prevService}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-green-800 rounded-full p-2 hover:bg-green-50"
                    aria-label="Previous service"
                  >
                    <ChevronLeft className="h-5 w-5 text-green-600" />
                  </button>
                )}
                <div className={services.length > 1 ? "px-12" : ""}>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="p-6 border border-green-800 rounded text-center">
                      {services[serviceIndex].icon_name && (
                        <>
                          {services[serviceIndex].icon_name.startsWith('http') ? (
                            <div className="mb-4 flex justify-center">
                              <div className="relative w-24 h-24">
                                <Image
                                  src={services[serviceIndex].icon_name}
                                  alt={services[serviceIndex].title}
                                  fill
                                  className="object-contain"
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="text-5xl mb-4">{services[serviceIndex].icon_name}</div>
                          )}
                        </>
                      )}
                      <h3 className="font-semibold text-gray-900 mb-2 text-base">
                        {services[serviceIndex].title}
                      </h3>
                      <p className="text-xs text-gray-600 mb-4">
                        {services[serviceIndex].description}
                      </p>
                      {company?.website_url && (
                        <a
                          href={company.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 inline-block"
                        >
                          Learn More
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                {services.length > 1 && (
                  <button
                    onClick={nextService}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-green-800 rounded-full p-2 hover:bg-green-50"
                    aria-label="Next service"
                  >
                    <ChevronRight className="h-5 w-5 text-green-600" />
                  </button>
                )}
              </div>
            </section>
          )}

          {/* Business Hours */}
          {businessHours && (
            <section className="mb-6">
              <h2 className="text-lg font-semibold text-black text-center mb-4 underline">
                Business Hours
              </h2>
              <div className="space-y-0">
                {[
                  { day: "Monday", key: "monday" },
                  { day: "Tuesday", key: "tuesday" },
                  { day: "Wednesday", key: "wednesday" },
                  { day: "Thursday", key: "thursday" },
                  { day: "Friday", key: "friday" },
                  { day: "Saturday", key: "saturday" },
                  { day: "Sunday", key: "sunday" },
                ].map(({ day, key }, index) => {
                  const hours = businessHours[key as keyof typeof businessHours];
                  return (
                    <div
                      key={key}
                      className={`flex justify-between items-center py-2 ${
                        index < 6 ? "border-b border-gray-200" : ""
                      }`}
                    >
                      <span className="text-gray-900 text-sm">{day}</span>
                      <span className="text-gray-600 text-sm">
                        {hours?.closed
                          ? "Closed"
                          : hours?.open && hours?.close
                          ? `${hours.open} - ${hours.close}`
                          : "Closed"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Social Media Links - Company social media */}
          {(company?.facebook_url || company?.linkedin_url || company?.instagram_url) && (
            <section className="mb-6">
              <div className="flex justify-center gap-4">
                {company.facebook_url && (
                  <a
                    href={company.facebook_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center hover:bg-green-700 transition-colors"
                  >
                    <Facebook className="h-6 w-6" />
                  </a>
                )}
                {company.linkedin_url && (
                  <a
                    href={company.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center hover:bg-green-700 transition-colors"
                  >
                    <Linkedin className="h-6 w-6" />
                  </a>
                )}
                {company.instagram_url && (
                  <a
                    href={company.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center hover:bg-green-700 transition-colors"
                  >
                    <Instagram className="h-6 w-6" />
                  </a>
                )}
              </div>
            </section>
          )}

          {/* More Section */}
          <section className="mb-6">
            <h2 className="text-lg font-semibold text-black text-center mb-4 underline">
              More
            </h2>
            <div className="grid grid-cols-3 gap-3">
              <button className="flex flex-col items-center gap-2 p-4 border border-green-800 rounded hover:bg-green-50 transition-colors">
                <Save className="h-5 w-5 text-green-600" />
                <span className="text-xs text-gray-900">Save</span>
              </button>
              <button
                onClick={() => setShareModalOpen(true)}
                className="flex flex-col items-center gap-2 p-4 border border-green-800 rounded hover:bg-green-50 transition-colors"
              >
                <Share2 className="h-5 w-5 text-green-600" />
                <span className="text-xs text-gray-900">Share</span>
              </button>
              <a
                href={`tel:${contactLinks.phone}`}
                className="flex flex-col items-center gap-2 p-4 border border-green-800 rounded hover:bg-green-50 transition-colors"
              >
                <PhoneCall className="h-5 w-5 text-green-600" />
                <span className="text-xs text-gray-900">Contact</span>
              </a>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-green-600 text-white py-4">
          <div className="px-4 text-center text-xs">
            © {new Date().getFullYear()} {company?.name || "Company"}
            {company?.footer_text && ` - ${company.footer_text}`}. All Rights Reserved.
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