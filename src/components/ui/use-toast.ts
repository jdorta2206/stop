
"use client";
import { toast } from 'sonner';

// Re-export `toast` from sonner directly
export { toast };

// The old `useToast` hook is deprecated, but we keep the file for imports.
// New components should import `toast` from here and use it directly.
// e.g. toast('My message'), toast.success('It worked'), toast.error('It failed')

// This function is kept for backward compatibility if needed, but not actively used.
export const useToast = () => {
    return {
        toast: toast,
        // The dismiss function from sonner is just toast.dismiss()
        dismiss: (toastId?: string | number) => toast.dismiss(toastId),
    };
};
