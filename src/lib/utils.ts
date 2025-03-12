
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

export function calculateReservationExpiration(reservationTimestamp: string | undefined): { 
  expired: boolean; 
  timeRemaining: { hours: number; minutes: number; seconds: number } | null;
  percentRemaining: number;
} {
  // Set default duration (24 hours in milliseconds)
  const totalDurationMs = 24 * 60 * 60 * 1000;
  
  // If no reservation timestamp is provided, return default values
  if (!reservationTimestamp) {
    console.log('No reservation timestamp provided, setting default 24 hours');
    return { 
      expired: false, 
      timeRemaining: null,
      percentRemaining: 100 
    };
  }
  
  // Parse the reservation timestamp
  const reservationDate = new Date(reservationTimestamp);
  
  // Check if the date is valid
  if (isNaN(reservationDate.getTime())) {
    console.error('Invalid reservation date');
    return { 
      expired: false, 
      timeRemaining: null,
      percentRemaining: 100 
    };
  }
  
  // Get current time
  const now = new Date();
  
  // Calculate expiration date (24 hours after reservation)
  const expirationDate = new Date(reservationDate.getTime() + totalDurationMs);
  
  // Calculate time remaining in milliseconds
  const timeRemainingMs = expirationDate.getTime() - now.getTime();
  
  // Check if reservation is expired
  if (timeRemainingMs <= 0) {
    return { 
      expired: true, 
      timeRemaining: { hours: 0, minutes: 0, seconds: 0 },
      percentRemaining: 0 
    };
  }
  
  // Calculate percentage remaining (inverse of elapsed percentage)
  const percentRemaining = Math.max(0, Math.min(100, (timeRemainingMs / totalDurationMs) * 100));
  
  // Calculate hours, minutes, seconds
  const hours = Math.floor(timeRemainingMs / (1000 * 60 * 60));
  const minutes = Math.floor((timeRemainingMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeRemainingMs % (1000 * 60)) / 1000);
  
  return { 
    expired: false, 
    timeRemaining: { hours, minutes, seconds },
    percentRemaining
  };
}
