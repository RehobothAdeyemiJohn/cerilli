
import { ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { formatDistanceToNow, format, addDays, formatDistance, isValid, isAfter, parseISO, addWeeks } from "date-fns";
import { it } from "date-fns/locale";
import { extractDateFromVehicle } from "@/utils/fixes";

// Combine class names with Tailwind
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generate UUID for application use
export function generateUUID(): string {
  return crypto.randomUUID();
}

// Format currency values
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

// Format dates in a standard way
export function formatDate(date: Date | string): string {
  if (!date) return 'Data non disponibile';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (!isValid(d)) return 'Data non valida';
  
  return format(d, 'dd/MM/yyyy', { locale: it });
}

// Calculate days in stock
export function calculateDaysInStock(dateAdded: string | Date | any): number {
  if (!dateAdded) return 0;
  
  // Extract date from Vehicle object if needed
  const parsedDate = extractDateFromVehicle(dateAdded);
  if (!parsedDate) return 0;
  
  const date = typeof parsedDate === 'string' ? new Date(parsedDate) : parsedDate;
  
  if (!isValid(date)) return 0;
  
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

// Calculate estimated arrival with proper formatting
export function calculateEstimatedArrival(estimatedArrival: string | Date | null | any): { 
  formattedRange: string;
  daysUntilArrival?: number; 
} {
  if (!estimatedArrival) {
    return {
      formattedRange: 'Non disponibile'
    };
  }
  
  // Extract date from Vehicle object if needed
  const parsedDate = extractDateFromVehicle(estimatedArrival);
  if (!parsedDate) {
    return {
      formattedRange: 'Non disponibile'
    };
  }
  
  const date = typeof parsedDate === 'string' ? new Date(parsedDate) : parsedDate;
  
  if (!isValid(date)) {
    return {
      formattedRange: 'Data non valida'
    };
  }
  
  const today = new Date();
  
  // If the estimated arrival date is in the past
  if (date < today) {
    return {
      formattedRange: 'In ritardo',
      daysUntilArrival: -calculateDaysInStock(date)
    };
  }
  
  // Calculate days until arrival
  const diffTime = Math.abs(date.getTime() - today.getTime());
  const daysUntilArrival = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Create a range with the estimated date and a week after
  const rangeEnd = addWeeks(date, 1);
  const formattedDate = format(date, 'dd/MM/yyyy', { locale: it });
  const formattedRangeEnd = format(rangeEnd, 'dd/MM/yyyy', { locale: it });
  
  return {
    formattedRange: `${formattedDate} - ${formattedRangeEnd}`,
    daysUntilArrival
  };
}
