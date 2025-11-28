"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loading } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";
import {
  createEmployee,
  updateEmployee,
  type EmployeeFormData as ServiceEmployeeFormData,
} from "@/lib/services/employees";
import type { EmployeeCard, BusinessHours } from "@/lib/types";
import { Upload, X } from "lucide-react";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import { parsePhoneNumber } from "libphonenumber-js";
import "react-phone-number-input/style.css";

// Helper function to normalize phone number to E.164 format
// E.164 format: +[country code][number] with no spaces or formatting
// Example: "+258 84 6017 490" -> "+258846017490"
const normalizePhoneNumber = (phone: string | undefined | null): string | undefined => {
  if (!phone || phone.trim() === "") return undefined;
  // Remove all spaces and formatting characters, keep only + and digits
  return phone.replace(/[^\d+]/g, "");
};

// Function to create validation schema with translations
const createEmployeeSchema = (t: (key: string) => string) => {
  // Custom validation for CFM email domains
  const cfmEmailValidation = z.string().email(t("invalidEmailAddress")).refine(
    (email) => {
      const domain = email.split("@")[1]?.toLowerCase();
      return domain === "cfm.com" || domain === "cfm.co.mz";
    },
    { message: t("emailMustEndWith") }
  );

  // Custom validation for phone numbers with country-specific length limits
  const phoneValidation = z.string().refine(
  (phone) => {
    if (!phone) return false;
    
    // First check if it's a valid phone number format
    if (!isValidPhoneNumber(phone)) {
      return false;
    }
    
    // Parse to get country code and check length
    try {
      const parsed = parsePhoneNumber(phone);
      if (!parsed || !parsed.isValid()) return false;
      
      // Get the national number (without country code)
      const nationalNumber = parsed.nationalNumber;
      const countryCode = parsed.country;
      
      // Country-specific maximum lengths (in digits, excluding country code)
      // These are approximate maximums for mobile numbers in each country
      const maxLengths: Record<string, number> = {
        'MZ': 9,  // Mozambique: 84 601 7490 (9 digits)
        'PT': 9,  // Portugal: 912 345 678 (9 digits)
        'US': 10, // USA: (415) 555-2671 (10 digits)
        'GB': 10, // UK: 20 7183 8750 (10 digits)
        'FR': 9,  // France: 1 23 45 67 89 (9 digits)
        'ES': 9,  // Spain: 612 345 678 (9 digits)
        'DE': 11, // Germany: 151 2345 6789 (11 digits)
        'IT': 10, // Italy: 312 345 6789 (10 digits)
        'ZA': 9,  // South Africa: 82 123 4567 (9 digits)
        'BR': 11, // Brazil: 11 91234 5678 (11 digits)
      };
      
      // If country is in our list, check length
      if (countryCode && maxLengths[countryCode]) {
        const maxLength = maxLengths[countryCode];
        if (nationalNumber.length > maxLength) {
          return false;
        }
      }
      
      // General check: international phone numbers should be between 7-15 digits total
      // (E.164 standard allows up to 15 digits including country code)
      const totalDigits = phone.replace(/\D/g, '').length;
      if (totalDigits < 7 || totalDigits > 15) {
        return false;
      }
      
      return true;
    } catch {
      // If parsing fails, fall back to basic validation
      return isValidPhoneNumber(phone);
    }
  },
  { message: t("invalidPhoneNumberOrExceeds") }
  );

  // Validation for text-only fields (names)
  // Allows: letters, accents, spaces, periods, hyphens, apostrophes
  const textOnlyValidation = (fieldNameKey: string, requiredKey: string, minLettersKey: string) =>
    z
      .string()
      .trim()
      .min(1, t(requiredKey))
      .refine(
        (value) => {
          const normalized = value.normalize("NFC");
          const letterCount = Array.from(normalized).filter((char) =>
            /\p{L}/u.test(char)
          ).length;
          // Allow letters, marks (accents), spaces, periods, hyphens, apostrophes
          return /^[\p{L}\p{M}\s.\-']+$/u.test(normalized) && letterCount >= 3;
        },
        { message: t(minLettersKey) }
      );

  return z.object({
    firstName: textOnlyValidation("firstName", "firstNameRequired", "firstNameMinLetters"),
    lastName: textOnlyValidation("lastName", "lastNameRequired", "lastNameMinLetters"),
    title: z.string().min(1, t("titleRequired")),
    photoUrl: z.string().url(t("invalidUrl")).optional().or(z.literal("")),
    contactLinks: z.object({
      email: cfmEmailValidation,
      phone: phoneValidation,
    phone2: z.string().optional().or(z.literal("")).refine(
      (phone) => {
        if (!phone || phone === "") return true; // Optional field
        
        // Use the same validation as primary phone
        if (!isValidPhoneNumber(phone)) {
          return false;
        }
        
        // Check country-specific length limits
        try {
          const parsed = parsePhoneNumber(phone);
          if (!parsed || !parsed.isValid()) return false;
          
          const nationalNumber = parsed.nationalNumber;
          const countryCode = parsed.country;
          
          const maxLengths: Record<string, number> = {
            'MZ': 9, 'PT': 9, 'US': 10, 'GB': 10, 'FR': 9, 'ES': 9,
            'DE': 11, 'IT': 10, 'ZA': 9, 'BR': 11,
          };
          
          if (countryCode && maxLengths[countryCode]) {
            if (nationalNumber.length > maxLengths[countryCode]) {
              return false;
            }
          }
          
          const totalDigits = phone.replace(/\D/g, '').length;
          if (totalDigits < 7 || totalDigits > 15) {
            return false;
          }
          
          return true;
        } catch {
          return isValidPhoneNumber(phone);
        }
      },
      { message: t("invalidPhoneNumberOrExceeds") }
    ),
    whatsapp: z.string().optional().or(z.literal("")),
  }),
  businessHours: z
    .object({
      monday: z
        .object({
          open: z.string(),
          close: z.string(),
          closed: z.boolean(),
        })
        .optional(),
      tuesday: z
        .object({
          open: z.string(),
          close: z.string(),
          closed: z.boolean(),
        })
        .optional(),
      wednesday: z
        .object({
          open: z.string(),
          close: z.string(),
          closed: z.boolean(),
        })
        .optional(),
      thursday: z
        .object({
          open: z.string(),
          close: z.string(),
          closed: z.boolean(),
        })
        .optional(),
      friday: z
        .object({
          open: z.string(),
          close: z.string(),
          closed: z.boolean(),
        })
        .optional(),
      saturday: z
        .object({
          open: z.string().optional(),
          close: z.string().optional(),
          closed: z.boolean(),
        })
        .optional(),
      sunday: z
        .object({
          open: z.string().optional(),
          close: z.string().optional(),
          closed: z.boolean(),
        })
        .optional(),
    })
    .optional(),
  isActive: z.boolean(),
  });
};

type EmployeeFormData = z.infer<ReturnType<typeof createEmployeeSchema>>;

interface EmployeeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  employee?: EmployeeCard;
  onSuccess: () => void;
}

export function EmployeeForm({
  open,
  onOpenChange,
  companyId,
  employee,
  onSuccess,
}: EmployeeFormProps) {
  const t = useTranslations("common");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [usePhotoUrl, setUsePhotoUrl] = useState(false);

  const employeeSchema = createEmployeeSchema(t);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    control,
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      title: "",
      photoUrl: "",
      contactLinks: {
        email: "",
        phone: "",
        phone2: "",
        whatsapp: "",
      },
      isActive: true,
    },
  });

  const photoUrlValue = watch("photoUrl");

  useEffect(() => {
    if (employee) {
      const theme = employee.theme as any;
      const nameParts = (theme?.name || "").split(" ") || ["", ""];
      reset({
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        title: theme?.title || "",
        photoUrl: employee.photo_url || "",
        contactLinks: {
          email: employee.contact_links.email,
          phone: normalizePhoneNumber(employee.contact_links.phone) || "",
          phone2: normalizePhoneNumber(employee.contact_links.phone2) || "",
          whatsapp: normalizePhoneNumber(employee.contact_links.whatsapp) || "",
        },
        businessHours: employee.business_hours || undefined,
        isActive: employee.is_active,
      });
      setPhotoPreview(employee.photo_url);
      setUsePhotoUrl(!!employee.photo_url);
    } else {
      reset();
      setPhotoFile(null);
      setPhotoPreview(null);
      setUsePhotoUrl(false);
    }
  }, [employee, open, reset]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError(t("pleaseSelectImageFile"));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError(t("imageSizeMustBeLess"));
        return;
      }
      setPhotoFile(file);
      setUsePhotoUrl(false);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const onSubmit = async (data: EmployeeFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const formData: any = {
        firstName: data.firstName,
        lastName: data.lastName,
        title: data.title,
        photoUrl: usePhotoUrl && data.photoUrl ? data.photoUrl : undefined,
        photoFile: !usePhotoUrl && photoFile ? photoFile : undefined,
        contactLinks: {
          phone: data.contactLinks.phone!,
          email: data.contactLinks.email!,
          phone2: data.contactLinks.phone2 || undefined,
          whatsapp: data.contactLinks.whatsapp || undefined,
          website: undefined,
        },
        businessHours: data.businessHours,
        isActive: data.isActive,
      };

      if (employee) {
        await updateEmployee(employee.employee_id, formData);
      } else {
        await createEmployee(companyId, formData);
      }

      onSuccess();
      onOpenChange(false);
      reset();
      setPhotoFile(null);
      setPhotoPreview(null);
    } catch (err: any) {
      setError(err.message || t("failedToSaveEmployee"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {employee ? t("editEmployee") : t("addNewEmployee")}
          </DialogTitle>
          <DialogDescription>
            {employee
              ? t("updateEmployeeInformation")
              : t("createNewEmployeeCard")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Photo Upload Section */}
          <div className="space-y-2">
            <Label>{t("photoUrl")}</Label>
            <div className="flex gap-4 items-start">
              <div className="flex-1">
                <div className="flex gap-2 mb-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setUsePhotoUrl(false)}
                    className={!usePhotoUrl ? "bg-green-50" : ""}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload File
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setUsePhotoUrl(true)}
                    className={usePhotoUrl ? "bg-green-50" : ""}
                  >
                    Use URL
                  </Button>
                </div>
                {!usePhotoUrl ? (
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isLoading}
                  />
                ) : (
                  <Input
                    type="url"
                    placeholder={t("photoUrlPlaceholder")}
                    {...register("photoUrl")}
                    disabled={isLoading}
                  />
                )}
              </div>
              {photoPreview && (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoPreview}
                    alt={t("preview")}
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoPreview(null);
                      setPhotoFile(null);
                      setValue("photoUrl", "");
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">
                {t("firstName")} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="firstName"
                {...register("firstName")}
                disabled={isLoading}
                onKeyPress={(e) => {
                  // Allow Unicode letters, marks (accents), spaces, periods, hyphens, apostrophes
                  if (!/[\p{L}\p{M}\s.\-']/u.test(e.key)) {
                    e.preventDefault();
                  }
                }}
              />
              {errors.firstName && (
                <p className="text-sm text-red-600">{errors.firstName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">
                {t("lastName")} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lastName"
                {...register("lastName")}
                disabled={isLoading}
                onKeyPress={(e) => {
                  // Allow Unicode letters, marks (accents), spaces, periods, hyphens, apostrophes
                  if (!/[\p{L}\p{M}\s.\-']/u.test(e.key)) {
                    e.preventDefault();
                  }
                }}
              />
              {errors.lastName && (
                <p className="text-sm text-red-600">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              {t("companyTitle")} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder={t("titlePlaceholder")}
              {...register("title")}
              disabled={isLoading}
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Contact Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">{t("contactDetails")}</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">
                  {t("email")} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("emailPlaceholderForm")}
                  {...register("contactLinks.email")}
                  disabled={isLoading}
                />
                {errors.contactLinks?.email && (
                  <p className="text-sm text-red-600">
                    {errors.contactLinks.email.message}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  {t("mustEndWithCfm")}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">
                  {t("phoneNumber")} <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="contactLinks.phone"
                  control={control}
                  render={({ field }) => (
                    <PhoneInput
                      international
                      defaultCountry="MZ"
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isLoading}
                      placeholder={t("enterPhoneNumber")}
                      className="phone-input-custom"
                      numberInputProps={{
                        className: "w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600",
                      }}
                      countries={[
                        "MZ", "PT", "US", "ZA", "BR", "GB", "FR", "ES",
                        "DE", "IT", "CN", "IN", "JP", "AU", "CA", "MX",
                        "AR", "CL", "CO", "PE", "AE", "SA", "EG", "KE",
                        "NG", "GH", "TZ", "UG", "RW", "AO"
                      ]}
                    />
                  )}
                />
                {errors.contactLinks?.phone && (
                  <p className="text-sm text-red-600">
                    {errors.contactLinks.phone.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone2">{t("secondaryPhoneOptional")}</Label>
                <Controller
                  name="contactLinks.phone2"
                  control={control}
                  render={({ field }) => (
                    <PhoneInput
                      international
                      defaultCountry="MZ"
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isLoading}
                      placeholder={t("enterSecondaryPhone")}
                      className="phone-input-custom"
                      numberInputProps={{
                        className: "w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600",
                      }}
                      countries={[
                        "MZ", "PT", "US", "ZA", "BR", "GB", "FR", "ES",
                        "DE", "IT", "CN", "IN", "JP", "AU", "CA", "MX",
                        "AR", "CL", "CO", "PE", "AE", "SA", "EG", "KE",
                        "NG", "GH", "TZ", "UG", "RW", "AO"
                      ]}
                    />
                  )}
                />
                {errors.contactLinks?.phone2 && (
                  <p className="text-sm text-red-600">
                    {errors.contactLinks.phone2.message}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  {t("secondaryPhoneOptionalDesc")}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">{t("whatsappOptional")}</Label>
                <Controller
                  name="contactLinks.whatsapp"
                  control={control}
                  render={({ field }) => (
                    <PhoneInput
                      international
                      defaultCountry="MZ"
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isLoading}
                      placeholder={t("whatsappPlaceholder")}
                      className="phone-input-custom"
                      numberInputProps={{
                        className: "w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600",
                      }}
                      countries={[
                        "MZ", "PT", "US", "ZA", "BR", "GB", "FR", "ES",
                        "DE", "IT", "CN", "IN", "JP", "AU", "CA", "MX",
                        "AR", "CL", "CO", "PE", "AE", "SA", "EG", "KE",
                        "NG", "GH", "TZ", "UG", "RW", "AO"
                      ]}
                    />
                  )}
                />
                <p className="text-xs text-gray-500">
                  {t("whatsappDesc")}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm text-gray-600 mb-2">
              <strong>{t("note")}:</strong> {t("companyWideInfoNote")}
            </p>
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between">
            <div>
              <Label>{t("activeStatus")}</Label>
              <p className="text-sm text-gray-500">
                {t("enableDisableCard")}
              </p>
            </div>
            <Switch
              checked={watch("isActive")}
              onCheckedChange={(checked) => setValue("isActive", checked)}
              disabled={isLoading}
            />
          </div>

          {error && <ErrorMessage message={error} />}

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loading size="sm" className="mr-2" />
                  Saving...
                </>
              ) : employee ? (
                "Update Employee"
              ) : (
                "Create Employee"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}






