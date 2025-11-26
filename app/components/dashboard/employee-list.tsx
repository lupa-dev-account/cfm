"use client";

import { useState } from "react";
import Image from "next/image";
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
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const handleToggleStatus = async (employee: EmployeeWithCard) => {
    setProcessingIds((prev) => new Set(prev).add(employee.id));
    try {
      await toggleEmployeeStatus(employee.employee_id, !employee.is_active);
      onRefresh();
    } catch (error: any) {
      alert(`Failed to update status: ${error.message}`);
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(employee.id);
        return next;
      });
    }
  };

  const handleDelete = async (employee: EmployeeWithCard) => {
    if (
      !confirm(
        `Are you sure you want to delete ${employee.name || "this employee"}? This action cannot be undone.`
      )
    ) {
      return;
    }

    setProcessingIds((prev) => new Set(prev).add(employee.id));
    try {
      await deleteEmployee(employee.employee_id);
      onRefresh();
    } catch (error: any) {
      alert(`Failed to delete employee: ${error.message}`);
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(employee.id);
        return next;
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loading size="lg" />
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No employees found. Add your first employee to get started.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Photo</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => {
            const isProcessing = processingIds.has(employee.id);
            return (
              <TableRow key={employee.id}>
                <TableCell>
                  {employee.photo_url ? (
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200">
                      <Image
                        src={employee.photo_url}
                        alt={employee.name || "Employee"}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-xs">
                        {employee.name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase() || "?"}
                      </span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">
                  {employee.name || "Unnamed Employee"}
                </TableCell>
                <TableCell>{employee.title || "-"}</TableCell>
                <TableCell>{employee.contact_links.email}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={employee.is_active}
                      onCheckedChange={() => handleToggleStatus(employee)}
                      disabled={isProcessing}
                    />
                    <span
                      className={`text-sm ${
                        employee.is_active
                          ? "text-green-600"
                          : "text-gray-400"
                      }`}
                    >
                      {employee.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(employee)}
                      disabled={isProcessing}
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
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
                          ? "View Card"
                          : "Card is inactive"
                      }
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(employee)}
                      disabled={isProcessing}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

