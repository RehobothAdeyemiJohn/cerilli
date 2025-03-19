
import { Vehicle } from './index';

declare module '@/lib/utils' {
  function calculateDaysInStock(dateAdded: string | Date | Vehicle): number;
  function calculateEstimatedArrival(estimatedArrival: string | Date | null | Vehicle): { 
    formattedRange: string;
    daysUntilArrival?: number; 
  };
}
