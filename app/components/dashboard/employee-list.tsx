"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { translateTitle } from "@/lib/utils/title-translator";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Loading } from "@/components/ui/loading";
import {
  deleteEmployee,
  toggleEmployeeStatus,
} from "@/lib/services/employees";
import type { EmployeeWithCard } from "@/lib/types";
import { Edit, Trash2, Eye } from "lucide-react";
import { DeleteConfirmationModal } from "./delete-confirmation-modal";

interface EmployeeListProps {
  employees: EmployeeWithCard[];
  onEdit: (employee: EmployeeWithCard) => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

export function EmployeeList({
  employees,
  onEdit,
  onRefresh,
  isLoading,
}: EmployeeListProps) {
  const t = useTranslations('common');
  const locale = useLocale();
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<EmployeeWithCard | null>(null);

  const handleToggleStatus = async (employee: EmployeeWithCard) => {
    setProcessingIds((prev) => new Set(prev).add(employee.id));
    try {
      await toggleEmployeeStatus(employee.employee_id, !employee.is_active);
      onRefresh();
    } catch (error: any) {
      alert(`${t('failedToUpdateStatus')}: ${error.message}`);
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(employee.id);
        return next;
      });
    }
  };

  const handleDeleteClick = (employee: EmployeeWithCard) => {
    setEmployeeToDelete(employee);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!employeeToDelete) return;

    setProcessingIds((prev) => new Set(prev).add(employeeToDelete.id));
    try {
      await deleteEmployee(employeeToDelete.employee_id);
      onRefresh();
      setEmployeeToDelete(null);
    } catch (error: any) {
      alert(`${t('failedToDeleteEmployee')}: ${error.message}`);
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(employeeToDelete.id);
        return next;
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6 md:py-12">
        <Loading size="lg" />
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="text-center py-6 md:py-12">
        <p className="text-xs md:text-sm text-black">{t('noEmployeesFound')}</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="w-[50px] md:w-[80px] text-[10px] md:text-sm py-2 md:py-3 px-2 md:px-4 text-black">{t('photo')}</TableHead>
            <TableHead className="text-[10px] md:text-sm py-2 md:py-3 px-2 md:px-4 text-black">{t('name')}</TableHead>
            <TableHead className="hidden sm:table-cell text-[10px] md:text-sm py-2 md:py-3 px-2 md:px-4 text-black">{t('title')}</TableHead>
            <TableHead className="hidden md:table-cell text-[10px] md:text-sm py-2 md:py-3 px-2 md:px-4 text-black">{t('email')}</TableHead>
            <TableHead className="text-[10px] md:text-sm py-2 md:py-3 px-2 md:px-4 text-black">{t('status')}</TableHead>
            <TableHead className="text-right text-[10px] md:text-sm py-2 md:py-3 px-2 md:px-4 text-black">{t('actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody key={locale}>
          {employees.map((employee) => {
            const isProcessing = processingIds.has(employee.id);
            return (
              <TableRow key={employee.id} className="hover:bg-gray-50">
                <TableCell className="py-2 md:py-3 px-2 md:px-4">
                  {employee.photo_url ? (
                    <div className="relative w-8 h-8 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-gray-200">
                      <Image
                        src={employee.photo_url}
                        alt={employee.name || t('employee')}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-[10px] md:text-xs">
                        {employee.name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase() || "?"}
                      </span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium text-xs md:text-sm py-2 md:py-3 px-2 md:px-4 text-black">
                  <div className="flex flex-col">
                    <span className="text-black">{employee.name || t('unnamedEmployee')}</span>
                    <span className="text-[10px] text-black sm:hidden">{translateTitle(employee.title, employee.title_translations, locale, t) || "-"}</span>
                    <span className="text-[10px] text-black md:hidden truncate max-w-[150px]">{employee.contact_links.email}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-xs md:text-sm py-2 md:py-3 px-2 md:px-4 text-black">{translateTitle(employee.title, employee.title_translations, locale, t) || "-"}</TableCell>
                <TableCell className="hidden md:table-cell text-xs md:text-sm py-2 md:py-3 px-2 md:px-4 truncate max-w-[200px] text-black">{employee.contact_links.email}</TableCell>
                <TableCell className="py-2 md:py-3 px-2 md:px-4">
                  <div className="flex items-center gap-1 md:gap-2">
                    <Switch
                      checked={employee.is_active}
                      onCheckedChange={() => handleToggleStatus(employee)}
                      disabled={isProcessing}
                      className="scale-75 md:scale-100"
                    />
                    <span
                      className={`text-[10px] md:text-sm ${
                        employee.is_active
                          ? "text-green-600"
                          : "text-gray-400"
                      }`}
                    >
                      {employee.is_active ? t('active') : t('inactive')}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right py-2 md:py-3 px-2 md:px-4">
                  <div className="flex items-center justify-end gap-1 md:gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(employee)}
                      disabled={isProcessing}
                      title={t('edit')}
                      className="h-7 w-7 md:h-9 md:w-9 p-0 text-black hover:text-black"
                    >
                      <Edit className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        window.open(`/card/${employee.public_slug}`, "_blank");
                      }}
                      disabled={isProcessing || !employee.is_active}
                      title={
                        employee.is_active
                          ? t('viewCard')
                          : t('cardIsInactive')
                      }
                      className="h-7 w-7 md:h-9 md:w-9 p-0 text-black hover:text-black"
                    >
                      <Eye className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(employee)}
                      disabled={isProcessing}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 w-7 md:h-9 md:w-9 p-0"
                      title={t('delete')}
                    >
                      <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      
      {employeeToDelete && (
        <DeleteConfirmationModal
          open={deleteModalOpen}
          onOpenChange={setDeleteModalOpen}
          employeeName={employeeToDelete.name || undefined}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
}

