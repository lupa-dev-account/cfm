"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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

const employeeSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  title: z.string().min(1, "Title is required"),
  photoUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  contactLinks: z.object({
    email: z.string().email("Invalid email address"),
    phone: z.string().min(1, "Phone number is required"),
    whatsapp: z.string().optional(),
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

type EmployeeFormData = z.infer<typeof employeeSchema>;

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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [usePhotoUrl, setUsePhotoUrl] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
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
          phone: employee.contact_links.phone,
          whatsapp: employee.contact_links.whatsapp,
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
        setError("Please select an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
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
      const formData: ServiceEmployeeFormData = {
        firstName: data.firstName,
        lastName: data.lastName,
        title: data.title,
        photoUrl: usePhotoUrl && data.photoUrl ? data.photoUrl : undefined,
        photoFile: !usePhotoUrl && photoFile ? photoFile : undefined,
        contactLinks: data.contactLinks,
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
      setError(err.message || "Failed to save employee");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {employee ? "Edit Employee" : "Add New Employee"}
          </DialogTitle>
          <DialogDescription>
            {employee
              ? "Update employee information and card details"
              : "Create a new employee digital business card"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Photo Upload Section */}
          <div className="space-y-2">
            <Label>Profile Picture</Label>
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
                    placeholder="https://example.com/photo.jpg"
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
                    alt="Preview"
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
                First Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="firstName"
                {...register("firstName")}
                disabled={isLoading}
              />
              {errors.firstName && (
                <p className="text-sm text-red-600">{errors.firstName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">
                Last Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lastName"
                {...register("lastName")}
                disabled={isLoading}
              />
              {errors.lastName && (
                <p className="text-sm text-red-600">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Company Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g., CTO, CFO, IT Manager"
              {...register("title")}
              disabled={isLoading}
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Contact Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Contact Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register("contactLinks.email")}
                  disabled={isLoading}
                />
                {errors.contactLinks?.email && (
                  <p className="text-sm text-red-600">
                    {errors.contactLinks.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">
                  Phone <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  {...register("contactLinks.phone")}
                  disabled={isLoading}
                />
                {errors.contactLinks?.phone && (
                  <p className="text-sm text-red-600">
                    {errors.contactLinks.phone.message}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp (Optional)</Label>
              <Input
                id="whatsapp"
                type="tel"
                placeholder="+258 XX XXX XXXX"
                {...register("contactLinks.whatsapp")}
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500">
                Employee&apos;s personal WhatsApp number
              </p>
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm text-gray-600 mb-2">
              <strong>Note:</strong> Company-wide information (logo, description, website, social media links)
              are managed in the Company Settings page and will be displayed on all employee cards.
            </p>
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between">
            <div>
              <Label>Active Status</Label>
              <p className="text-sm text-gray-500">
                Enable or disable this employee card
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






