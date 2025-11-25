"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Loading } from "@/components/ui/loading";
import type { EmployeeWithCard } from "@/lib/types";
import {
  Phone,
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
  const supabase = createClient();

  useEffect(() => {
    async function loadCard() {
      if (!slug) {
        setError("Invalid card link");
        setLoading(false);
        return;
      }

      try {
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

        // Extract name and title from theme
        const theme = data.theme as any;
        const cardWithMetadata: EmployeeWithCard = {
          ...data,
          name: theme?.name,
          title: theme?.title,
        };

        setCard(cardWithMetadata);
      } catch (err: any) {
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

  const services = [
    {
      icon: "🏗️",
      title: "Handling Of Cargo",
      description: "Work with a view to improving our infrastructure.",
    },
    {
      icon: "🚂",
      title: "Transport Of Passengers",
      description: "Daily trains on the Goba, Ressano Garcia and Limpopo lines.",
    },
  ];

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
        {/* Header with Company Logo */}
        <header className="bg-white py-6 px-4">
          <div className="flex items-center justify-center gap-4 mb-2">
            {/* Company Logo - Left side illustration */}
            <div className="hidden md:block text-gray-400">
              <svg
                width="60"
                height="60"
                viewBox="0 0 60 60"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Simple ship and train illustration */}
                <rect x="5" y="35" width="20" height="15" fill="currentColor" opacity="0.3" />
                <rect x="8" y="38" width="14" height="8" fill="currentColor" />
                <rect x="30" y="40" width="25" height="10" fill="currentColor" opacity="0.3" />
                <circle cx="35" cy="50" r="3" fill="currentColor" />
                <circle cx="45" cy="50" r="3" fill="currentColor" />
              </svg>
            </div>
            {/* CFM Logo */}
            <div className="text-4xl font-bold text-green-600">CFM</div>
          </div>
          <p className="text-green-600 font-semibold text-center text-sm mb-1">
            MOÇAMBIQUE PORTS AND RAILWAYS
          </p>
          <p className="text-green-500 text-center text-xs">
            PORTOS E CAMINHOS DE FERRO DE MOÇAMBIQUE, E.P.
          </p>
        </header>

        <main className="px-4 py-6">
          {/* Profile Section */}
          <div className="flex items-start gap-6 mb-6">
            {card.photo_url ? (
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-green-600 flex-shrink-0">
                <Image
                  src={card.photo_url}
                  alt={card.name || "Profile"}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 border-2 border-green-600 flex items-center justify-center flex-shrink-0">
                <span className="text-gray-400 text-xl">
                  {card.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase() || "?"}
                </span>
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {card.name || "Unnamed Employee"}
              </h1>
              <p className="text-base text-gray-600">{card.title || ""}</p>
            </div>
          </div>

          {/* Company Description */}
          <div className="mb-6">
            <p className="text-gray-700 text-sm leading-relaxed">
              Mozambican public company responsible for managing and operating the
              country&apos;s ports and railways. Its mission is to provide integrated
              and efficient logistical solutions for goods and passengers,
              contributing to the economic development of Mozambique and the wider
              region.
            </p>
          </div>

          {/* Contact Section */}
          <section className="mb-6">
            <h2 className="text-lg font-semibold text-green-600 text-center mb-4 underline">
              Contact
            </h2>
            <div className="space-y-3">
              {contactLinks.phone && (
                <div className="flex items-center gap-3 p-4 bg-white border border-green-600 rounded">
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
                <div className="flex items-center gap-3 p-4 bg-white border border-green-600 rounded">
                  <Mail className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <a
                    href={`mailto:${contactLinks.email}`}
                    className="text-gray-900 hover:text-green-600 flex-1 break-all"
                  >
                    {contactLinks.email}
                  </a>
                </div>
              )}
              {contactLinks.website && (
                <div className="flex items-center gap-3 p-4 bg-white border border-green-600 rounded">
                  <Globe className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <a
                    href={contactLinks.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-900 hover:text-green-600 flex-1 break-all"
                  >
                    {contactLinks.website}
                  </a>
                </div>
              )}
            </div>
          </section>

          {/* Services Section with Carousel */}
          <section className="mb-6">
            <h2 className="text-lg font-semibold text-green-600 text-center mb-4 underline">
              Services
            </h2>
            <div className="relative">
              <button
                onClick={prevService}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-green-600 rounded-full p-2 hover:bg-green-50"
                aria-label="Previous service"
              >
                <ChevronLeft className="h-5 w-5 text-green-600" />
              </button>
              <div className="px-12">
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-6 border border-green-600 rounded text-center">
                    <div className="text-5xl mb-4">{services[serviceIndex].icon}</div>
                    <h3 className="font-semibold text-gray-900 mb-2 text-base">
                      {services[serviceIndex].title}
                    </h3>
                    <p className="text-xs text-gray-600 mb-4">
                      {services[serviceIndex].description}
                    </p>
                    <button className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700">
                      Learn More
                    </button>
                  </div>
                </div>
              </div>
              <button
                onClick={nextService}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-green-600 rounded-full p-2 hover:bg-green-50"
                aria-label="Next service"
              >
                <ChevronRight className="h-5 w-5 text-green-600" />
              </button>
            </div>
          </section>

          {/* Business Hours */}
          {businessHours && (
            <section className="mb-6">
              <h2 className="text-lg font-semibold text-green-600 text-center mb-4 underline">
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

          {/* Social Media Links */}
          <section className="mb-6">
            <div className="flex justify-center gap-4">
              {socialLinks.facebook && (
                <a
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center hover:bg-green-700 transition-colors"
                >
                  <Facebook className="h-6 w-6" />
                </a>
              )}
              {socialLinks.linkedin && (
                <a
                  href={socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center hover:bg-green-700 transition-colors"
                >
                  <Linkedin className="h-6 w-6" />
                </a>
              )}
              {socialLinks.instagram && (
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center hover:bg-green-700 transition-colors"
                >
                  <Instagram className="h-6 w-6" />
                </a>
              )}
            </div>
          </section>

          {/* More Section */}
          <section className="mb-6">
            <h2 className="text-lg font-semibold text-green-600 text-center mb-4 underline">
              More
            </h2>
            <div className="grid grid-cols-3 gap-3">
              <button className="flex flex-col items-center gap-2 p-4 border border-green-600 rounded hover:bg-green-50 transition-colors">
                <Save className="h-5 w-5 text-green-600" />
                <span className="text-xs text-gray-900">Save</span>
              </button>
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: card.name || "Business Card",
                      text: `Check out ${card.name}'s business card`,
                      url: window.location.href,
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Link copied to clipboard!");
                  }
                }}
                className="flex flex-col items-center gap-2 p-4 border border-green-600 rounded hover:bg-green-50 transition-colors"
              >
                <Share2 className="h-5 w-5 text-green-600" />
                <span className="text-xs text-gray-900">Share</span>
              </button>
              <a
                href={`tel:${contactLinks.phone}`}
                className="flex flex-col items-center gap-2 p-4 border border-green-600 rounded hover:bg-green-50 transition-colors"
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
            © {new Date().getFullYear()} CFM - Portos E Caminhos De Ferro De
            Moçambique. Todos Direitos Reservados.
          </div>
        </footer>
      </div>
    </div>
  );
}