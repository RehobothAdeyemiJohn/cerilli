
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, differenceInDays } from 'date-fns';

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

export function calculateDaysInStock(dateAdded: string | Date): number {
  if (!dateAdded) return 0;
  
  try {
    const startDate = typeof dateAdded === 'string' ? new Date(dateAdded) : dateAdded;
    const today = new Date();
    return differenceInDays(today, startDate);
  } catch (error) {
    console.error('Error calculating days in stock:', error);
    return 0;
  }
}

export function calculateEstimatedArrival(estimatedArrival: string | Date | null): string {
  if (!estimatedArrival) return 'Non disponibile';
  
  try {
    const arrivalDate = typeof estimatedArrival === 'string' 
      ? new Date(estimatedArrival) 
      : estimatedArrival;
    
    // If the date is invalid, return a fallback message
    if (isNaN(arrivalDate.getTime())) return 'Non disponibile';
    
    const today = new Date();
    const daysUntilArrival = differenceInDays(arrivalDate, today);
    
    if (daysUntilArrival < 0) {
      return 'In ritardo';
    } else if (daysUntilArrival === 0) {
      return 'Oggi';
    } else if (daysUntilArrival === 1) {
      return 'Domani';
    } else if (daysUntilArrival <= 7) {
      return `${daysUntilArrival} giorni`;
    } else {
      return formatDate(arrivalDate);
    }
  } catch (error) {
    console.error('Error calculating estimated arrival:', error);
    return 'Non disponibile';
  }
}
