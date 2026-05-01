import { toast } from "@/hooks/use-toast";

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
  title?: string;
  description: string;
  duration?: number;
}

/**
 * Show a toast notification
 * @param type - The type of toast (success, error, warning, info)
 * @param options - Toast options (title, description, duration)
 */
export const showToast = (type: ToastType, options: ToastOptions) => {
  const { title, description, duration = 5000 } = options;
  
  // Default titles based on type if not provided
  const defaultTitles = {
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Information'
  };
  
  // Toast variant based on type
  const variant = type === 'success' ? 'default' : 
                 type === 'error' ? 'destructive' : 
                 'default';
  
  toast({
    title: title || defaultTitles[type],
    description,
    variant,
    duration
  });
};

/**
 * Show a success toast notification
 */
export const showSuccessToast = (options: Omit<ToastOptions, 'title'> & { title?: string }) => {
  showToast('success', {
    title: options.title || 'Success',
    description: options.description,
    duration: options.duration
  });
};

/**
 * Show an error toast notification
 */
export const showErrorToast = (options: Omit<ToastOptions, 'title'> & { title?: string }) => {
  showToast('error', {
    title: options.title || 'Error',
    description: options.description,
    duration: options.duration
  });
};