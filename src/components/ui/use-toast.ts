

"use client"
import { toast as sonnerToast } from 'sonner';

// Re-export `toast` from sonner directly
export const toast = sonnerToast;

// The old `useToast` hook is deprecated, but we keep the file for imports.
// New components should import `toast` from here and use it directly.
// e.g. toast('My message'), toast.success('It worked'), toast.error('It failed')

// This function is kept for backward compatibility if needed, but not actively used.
export const useToast = () => {
    return {
        toast: sonnerToast,
        // The dismiss function from sonner is just toast.dismiss()
        dismiss: (toastId?: string | number) => sonnerToast.dismiss(toastId),
    };
};
