
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, differenceInDays } from 'date-fns';
import { Vehicle } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  if (!date) return '-';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'dd/MM/yyyy');
  } catch (error) {
    console.error('Error formatting date:', error);
    return '-';
  }
}

export function calculateDaysInStock(dateAdded: string | Date | Vehicle): number {
  if (!dateAdded) return 0;
  
  try {
    let startDate: Date;
    
    if (typeof dateAdded === 'object' && 'dateAdded' in dateAdded) {
      // It's a Vehicle object
      startDate = new Date(dateAdded.dateAdded);
    } else if (typeof dateAdded === 'string') {
      startDate = new Date(dateAdded);
    } else {
      startDate = dateAdded as Date;
    }
    
    const today = new Date();
    return differenceInDays(today, startDate);
  } catch (error) {
    console.error('Error calculating days in stock:', error);
    return 0;
  }
}

export function calculateEstimatedArrival(estimatedArrival: string | Date | null | Vehicle): { formattedRange: string; daysUntilArrival?: number } {
  if (!estimatedArrival) return { formattedRange: 'Non disponibile' };
  
  try {
    let arrivalDate: Date;
    let daysEstimate: number | undefined;
    
    if (typeof estimatedArrival === 'object' && 'estimatedArrivalDays' in estimatedArrival) {
      // It's a Vehicle object
      daysEstimate = estimatedArrival.estimatedArrivalDays;
      
      if (!daysEstimate) {
        return { formattedRange: 'Non disponibile' };
      }
      
      const today = new Date();
      arrivalDate = new Date(today);
      arrivalDate.setDate(today.getDate() + daysEstimate);
    } else if (typeof estimatedArrival === 'string') {
      arrivalDate = new Date(estimatedArrival);
    } else {
      arrivalDate = estimatedArrival as Date;
    }
    
    // If the date is invalid, return a fallback message
    if (arrivalDate && isNaN(arrivalDate.getTime())) {
      return { formattedRange: 'Non disponibile' };
    }
    
    const today = new Date();
    const daysUntilArrival = daysEstimate || differenceInDays(arrivalDate, today);
    
    if (daysUntilArrival < 0) {
      return { formattedRange: 'In ritardo', daysUntilArrival };
    } else if (daysUntilArrival === 0) {
      return { formattedRange: 'Oggi', daysUntilArrival };
    } else if (daysUntilArrival === 1) {
      return { formattedRange: 'Domani', daysUntilArrival };
    } else if (daysUntilArrival <= 7) {
      return { formattedRange: `${daysUntilArrival} giorni`, daysUntilArrival };
    } else {
      const formatted = formatDate(arrivalDate);
      return { formattedRange: formatted, daysUntilArrival };
    }
  } catch (error) {
    console.error('Error calculating estimated arrival:', error);
    return { formattedRange: 'Non disponibile' };
  }
}
