
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
  // If no reservation timestamp is provided, return default values with 24 hours remaining
  if (!reservationTimestamp) {
    console.log('No reservation timestamp provided, setting default 24 hours');
    return { 
      expired: false, 
      timeRemaining: { hours: 24, minutes: 0, seconds: 0 },
      percentRemaining: 100 
    };
  }
  
  console.log('Calculating expiration for timestamp:', reservationTimestamp);
  let reservationDate;
  
  try {
    reservationDate = new Date(reservationTimestamp);
    
    // Check if the date is valid
    if (isNaN(reservationDate.getTime())) {
      console.log('Invalid reservation date, using default 24 hours');
      return { 
        expired: false, 
        timeRemaining: { hours: 24, minutes: 0, seconds: 0 },
        percentRemaining: 100 
      };
    }
  } catch (error) {
    console.error('Error parsing reservation date:', error);
    return { 
      expired: false, 
      timeRemaining: { hours: 24, minutes: 0, seconds: 0 },
      percentRemaining: 100 
    };
  }
  
  const now = new Date();
  
  // For testing/debugging
  console.log('Reservation date:', reservationDate);
  console.log('Current date:', now);
  
  // Calculate expiration date (24 hours after reservation)
  const expirationDate = new Date(reservationDate);
  expirationDate.setHours(expirationDate.getHours() + 24);
  
  console.log('Expiration date:', expirationDate);
  
  // Check if reservation is expired
  if (now >= expirationDate) {
    console.log('Reservation is expired');
    return { 
      expired: true, 
      timeRemaining: { hours: 0, minutes: 0, seconds: 0 },
      percentRemaining: 0 
    };
  }
  
  // Calculate time remaining
  const timeRemainingMs = expirationDate.getTime() - now.getTime();
  const totalDurationMs = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  const elapsedMs = totalDurationMs - timeRemainingMs;
  const percentRemaining = 100 - (elapsedMs / totalDurationMs * 100);
  
  const hours = Math.floor(timeRemainingMs / (1000 * 60 * 60));
  const minutes = Math.floor((timeRemainingMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeRemainingMs % (1000 * 60)) / 1000);
  
  console.log('Time remaining:', { hours, minutes, seconds, percentRemaining });
  
  return { 
    expired: false, 
    timeRemaining: { hours, minutes, seconds },
    percentRemaining
  };
}
