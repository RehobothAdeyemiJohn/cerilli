
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function calculateDaysInStock(dateAdded: string): number {
  const addedDate = new Date(dateAdded);
  const today = new Date();
  
  // Reset time component to get precise day difference
  addedDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  // Calculate difference in milliseconds and convert to days
  const differenceInTime = today.getTime() - addedDate.getTime();
  return Math.floor(differenceInTime / (1000 * 3600 * 24));
}
