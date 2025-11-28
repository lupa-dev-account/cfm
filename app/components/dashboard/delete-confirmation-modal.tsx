"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { verifyPassword } from "@/app/actions/auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Loading } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";
import { AlertTriangle } from "lucide-react";

// Rate limiting configuration
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 7 * 60 * 1000; // 7 minutes in milliseconds

interface DeleteConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeName?: string;
  onConfirm: () => Promise<void>;
}

export function DeleteConfirmationModal({
  open,
  onOpenChange,
  employeeName,
  onConfirm,
}: DeleteConfirmationModalProps) {
  const t = useTranslations("common");
  const [password, setPassword] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Rate limiting state
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<Date | null>(null);
  const attemptsRef = useRef<number[]>([]); // Track attempt timestamps
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setPassword("");
      setError(null);
      setIsVerifying(false);
      setIsDeleting(false);
      // Don't reset attempts/lockout when modal closes - keep rate limiting across sessions
    }
  }, [open]);

  // Check if currently locked out
  const isLockedOut = lockedUntil && new Date() < lockedUntil;
  
  // Check if we should be locked out based on attempts
  useEffect(() => {
    if (!open) return;
    
    const now = Date.now();
    // Remove attempts older than lockout duration
    attemptsRef.current = attemptsRef.current.filter(
      (timestamp) => now - timestamp < LOCKOUT_DURATION
    );
    
    // Check if we've exceeded max attempts
    if (attemptsRef.current.length >= MAX_ATTEMPTS) {
      const lockoutTime = new Date(now + LOCKOUT_DURATION);
      setLockedUntil(lockoutTime);
    } else if (lockedUntil && new Date() >= lockedUntil) {
      // Lockout expired
      setLockedUntil(null);
      attemptsRef.current = [];
      setAttempts(0);
    }
  }, [open, lockedUntil]);

  const handleCancel = () => {
    // Only allow cancel if not verifying or deleting
    if (isVerifying || isDeleting) return;
    
    setPassword("");
    setError(null);
    onOpenChange(false);
  };

  const handleConfirm = async () => {
    if (!isMountedRef.current) return;

    // Check if locked out
    if (isLockedOut && lockedUntil) {
      const minutesLeft = Math.ceil((lockedUntil.getTime() - Date.now()) / 60000);
      setError(t("tooManyAttemptsTryLater", { minutes: minutesLeft }) || `Too many attempts. Please try again in ${minutesLeft} minute(s).`);
      return;
    }

    if (!password.trim()) {
      setError(t("passwordRequired"));
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      // Verify password using server action
      const result = await verifyPassword(password);

      if (!result.success) {
        // Add failed attempt
        attemptsRef.current.push(Date.now());
        const newAttempts = attemptsRef.current.length;
        setAttempts(newAttempts);

        // Check if we should lock out
        if (newAttempts >= MAX_ATTEMPTS) {
          const lockoutTime = new Date(Date.now() + LOCKOUT_DURATION);
          setLockedUntil(lockoutTime);
          const minutesLeft = Math.ceil(LOCKOUT_DURATION / 60000);
          setError(t("tooManyAttemptsTryLater", { minutes: minutesLeft }) || `Too many attempts. Please try again in ${minutesLeft} minute(s).`);
        } else {
          const remaining = MAX_ATTEMPTS - newAttempts;
          setError(result.error || t("incorrectPassword"));
        }
        
        if (!isMountedRef.current) return;
        setIsVerifying(false);
        return;
      }

      // Password is correct, reset attempts and proceed with deletion
      attemptsRef.current = [];
      setAttempts(0);
      setLockedUntil(null);
      
      if (!isMountedRef.current) return;
      setIsVerifying(false);
      setIsDeleting(true);

      // Proceed with deletion
      await onConfirm();
      
      if (!isMountedRef.current) return;
      
      // Reset state and close modal
      setPassword("");
      setError(null);
      setIsDeleting(false);
      onOpenChange(false);
    } catch (err: any) {
      if (!isMountedRef.current) return;
      setError(err.message || t("passwordVerificationFailed"));
      setIsVerifying(false);
      setIsDeleting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isVerifying && !isDeleting && !isLockedOut && password.trim()) {
      handleConfirm();
    }
  };

  // Prevent modal from closing during verification or deletion
  const handleOpenChange = (newOpen: boolean) => {
    if (isVerifying || isDeleting) {
      return; // Don't allow closing during operation
    }
    onOpenChange(newOpen);
  };

  const isProcessing = isVerifying || isDeleting;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <DialogTitle className="text-xl font-semibold text-black">
              {t("confirmDelete")}
            </DialogTitle>
          </div>
          <DialogDescription className="text-gray-600 pt-2">
            {employeeName
              ? t("confirmDeleteEmployeeMessage", { name: employeeName })
              : t("confirmDeleteEmployeeMessageDefault")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800 font-medium">
              {t("deleteWarning")}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t("enterPasswordToConfirm")}</Label>
            <PasswordInput
              id="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              onKeyDown={handleKeyDown}
              placeholder={t("passwordPlaceholderDelete")}
              disabled={isProcessing || !!isLockedOut}
              autoFocus
              className="w-full"
              autoComplete="current-password"
            />
            {isLockedOut && lockedUntil && (
              <p className="text-sm text-red-600 mt-1">
                {t("accountLocked", { 
                  minutes: Math.ceil((lockedUntil.getTime() - Date.now()) / 60000)
                }) || `Account locked. Please try again in ${Math.ceil((lockedUntil.getTime() - Date.now()) / 60000)} minute(s).`}
              </p>
            )}
            {error && <ErrorMessage message={error} />}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="default"
            onClick={handleCancel}
            disabled={isProcessing}
            className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
          >
            {t("cancel")}
          </Button>
          <Button
            type="button"
            variant="default"
            onClick={handleConfirm}
            disabled={isProcessing || !password.trim() || !!isLockedOut}
            className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
          >
            {isVerifying ? (
              <>
                <Loading size="sm" className="mr-2" />
                {t("verifying")}
              </>
            ) : isDeleting ? (
              <>
                <Loading size="sm" className="mr-2" />
                {t("deleting") || "Deleting..."}
              </>
            ) : (
              t("yesDelete")
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

