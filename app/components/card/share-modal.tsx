"use client";

import { QRCodeSVG } from "qrcode.react";
import Image from "next/image";
import { ChevronLeft, X, ExternalLink, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { EmployeeWithCard } from "@/lib/types";

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card: EmployeeWithCard;
}

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
 * This format ensures phones automatically prompt to save contact when QR is scanned
 */
function generateVCard(card: EmployeeWithCard): string {
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

  // Title and Organization
  if (card.title) {
    vcard += `TITLE:${escapeVCardValue(card.title)}\r\n`;
  }
  if (company?.name) {
    vcard += `ORG:${escapeVCardValue(company.name)}\r\n`;
  }

  // Phone - primary contact
  if (contactLinks.phone) {
    // Remove any non-digit characters except + for international format
    const cleanPhone = contactLinks.phone.replace(/[^\d+]/g, "");
    vcard += `TEL;TYPE=CELL,VOICE:${cleanPhone}\r\n`;
  }

  // WhatsApp if different from main phone
  if (contactLinks.whatsapp && contactLinks.whatsapp !== contactLinks.phone) {
    const cleanWhatsApp = contactLinks.whatsapp.replace(/[^\d+]/g, "");
    vcard += `TEL;TYPE=CELL,WA:${cleanWhatsApp}\r\n`;
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

  // Photo URL (if available)
  if (card.photo_url) {
    vcard += `PHOTO;VALUE=URI;TYPE=URL:${card.photo_url}\r\n`;
  }

  // Note/Description
  const notes = [];
  if (company?.description) {
    notes.push(company.description);
  }
  if (card.title && company?.name) {
    notes.push(`${card.title} at ${company.name}`);
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

export function ShareModal({ open, onOpenChange, card }: ShareModalProps) {
  const cardUrl = typeof window !== "undefined" ? window.location.href : "";
  // Always generate unique vCard data for this specific card
  const vCardData = generateVCard(card);
  const company = card.company;
  const contactLinks = card.contact_links;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(cardUrl);
    // You could add a toast notification here
  };

  const handleShareSocial = (platform: string) => {
    const shareText = `Check out ${card.name || "this"}'s business card`;
    const shareUrl = encodeURIComponent(cardUrl);

    let shareLink = "";
    switch (platform) {
      case "facebook":
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
        break;
      case "twitter":
        shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${shareUrl}`;
        break;
      case "linkedin":
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`;
        break;
      case "whatsapp":
        shareLink = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${cardUrl}`)}`;
        break;
    }

    if (shareLink) {
      window.open(shareLink, "_blank", "noopener,noreferrer");
    }
  };

  const handleDownloadVCard = () => {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 max-h-[90vh] overflow-y-auto [&>button]:hidden">
        {/* Header */}
        <div className="relative bg-white pt-6 pb-4">
          <div className="flex items-center justify-between px-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 p-0 rounded-full bg-green-600 hover:bg-green-700 text-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-semibold text-gray-900">Share This Card</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 p-0 hover:bg-gray-900 rounded-full"
            >
              <X className="h-4 w-4 text-black hover:text-white" />
            </Button>
          </div>
        </div>

        {/* Profile Picture */}
        <div className="flex justify-center -mt-2">
          {card.photo_url ? (
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-green-800 shadow-lg bg-white">
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

        {/* Main content with gray background */}
        <div className="bg-gray-100 px-6 pt-12 pb-6 -mt-16 space-y-6">

          {/* QR Code - Unique for each employee */}
          <div className="flex flex-col items-center space-y-3">
            <div className="p-6 bg-white rounded-xl shadow-sm">
              <QRCodeSVG
                value={cardUrl}
                size={220}
                level="H"
                includeMargin={false}
                fgColor="#1a5f3f"
                bgColor="#ffffff"
                imageSettings={
                  company?.logo_url
                    ? {
                        src: company.logo_url,
                        height: 60,
                        width: 60,
                        excavate: true,
                      }
                    : undefined
                }
              />
            </div>
            <p className="text-sm text-gray-600 text-center">
              Scan to view digital business card
            </p>
          </div>

          {/* Direct Link */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <input
                type="text"
                value={cardUrl}
                readOnly
                className="flex-1 text-sm text-gray-700 bg-transparent border-none outline-none text-center"
              />
              <button
                onClick={handleCopyLink}
                className="p-2 hover:bg-gray-200 rounded transition-colors"
                title="Copy link"
              >
                <ExternalLink className="h-4 w-4 text-gray-600" />
              </button>
            </div>
            <button
              onClick={handleDownloadVCard}
              className="w-full text-sm text-green-600 hover:text-green-700 underline"
            >
              Download vCard
            </button>
          </div>

          {/* Social Channels */}
          {(company?.facebook_url ||
            company?.linkedin_url ||
            company?.instagram_url ||
            contactLinks.phone) && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 text-center">
                Or check my social channels
              </p>
              <div className="flex justify-center gap-4">
                {company?.facebook_url && (
                  <button
                    onClick={() => handleShareSocial("facebook")}
                    className="w-12 h-12 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center hover:bg-green-800 hover:border-green-800 transition-all group"
                    title="Share on Facebook"
                  >
                    <Facebook className="h-6 w-6 text-gray-700 group-hover:text-white transition-colors" />
                  </button>
                )}
                {company?.instagram_url && (
                  <button
                    onClick={() => window.open(company.instagram_url, "_blank", "noopener,noreferrer")}
                    className="w-12 h-12 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center hover:bg-green-800 hover:border-green-800 transition-all group"
                    title="Visit Instagram"
                  >
                    <Instagram className="h-6 w-6 text-gray-700 group-hover:text-white transition-colors" />
                  </button>
                )}
                {company?.linkedin_url && (
                  <button
                    onClick={() => handleShareSocial("linkedin")}
                    className="w-12 h-12 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center hover:bg-green-800 hover:border-green-800 transition-all group"
                    title="Share on LinkedIn"
                  >
                    <Linkedin className="h-6 w-6 text-gray-700 group-hover:text-white transition-colors" />
                  </button>
                )}
                {contactLinks.phone && (
                  <button
                    onClick={() => handleShareSocial("whatsapp")}
                    className="w-12 h-12 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center hover:bg-green-800 hover:border-green-800 transition-all group"
                    title="Share on WhatsApp"
                  >
                    <FaWhatsapp className="h-6 w-6 text-gray-700 group-hover:text-white transition-colors" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
