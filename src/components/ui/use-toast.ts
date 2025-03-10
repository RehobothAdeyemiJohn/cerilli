
// Instead of importing from hooks/use-toast which creates a cycle,
// import directly from the shadcn toast component
import { useToast as useToastShadcn, toast as toastShadcn } from "@/components/ui/toast"

export const useToast = useToastShadcn;
export const toast = toastShadcn;
