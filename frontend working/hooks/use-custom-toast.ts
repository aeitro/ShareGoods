import { useToast } from "@/hooks/use-toast"

export const useCustomToast = () => {
  const { toast, dismiss } = useToast()

  const showSuccess = (message: string, description?: string) => {
    toast({
      title: message,
      description: description,
      variant: "default",
    })
  }

  const showError = (message: string, description?: string) => {
    toast({
      title: message,
      description: description,
      variant: "destructive",
    })
  }

  return {
    toast,
    dismiss,
    showSuccess,
    showError,
  }
}