import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface LoadingProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Loading({ className, size = "md" }: LoadingProps) {
  return (
    <Loader2
      className={cn(
        "animate-spin text-green-600",
        {
          "h-4 w-4": size === "sm",
          "h-6 w-6": size === "md",
          "h-8 w-8": size === "lg",
        },
        className
      )}
    />
  );
}

