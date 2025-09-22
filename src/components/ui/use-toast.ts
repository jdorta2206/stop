"use client";
import { toast } from 'sonner';
import { useToast as useOriginalToast } from "@/hooks/use-toast";

// Export `toast` from sonner directly
export { toast };

// You can keep the original `useToast` if it's used for the old system,
// or deprecate it if you are fully migrating to sonner.
export const useToast = () => {
  const originalToast = useOriginalToast();
  // Return a combined or consistent API if needed
  return {
      ...originalToast,
      toast: toast, // Expose sonner's toast function
  };
};
