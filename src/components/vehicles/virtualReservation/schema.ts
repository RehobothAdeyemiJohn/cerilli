
import { z } from 'zod';

// Create a strict enum for original stock options
const originalStockEnum = z.enum(['Cina', 'Germania']);

export const virtualReservationSchema = z.object({
  // Dealer selection (only for admin)
  dealerId: z.string().optional(),
  
  // Reservation destination
  reservationDestination: z.string().min(1, "La destinazione è obbligatoria"),
  
  // Vehicle configuration
  trim: z.string().min(1, "L'allestimento è obbligatorio"),
  fuelType: z.string().min(1, "Il tipo di carburante è obbligatorio"),
  exteriorColor: z.string().min(1, "Il colore esterno è obbligatorio"),
  transmission: z.string().min(1, "La trasmissione è obbligatoria"),
  
  // Optional accessories
  accessories: z.array(z.string()).default([]),
  
  // Original stock - use the enum for validation
  originalStock: originalStockEnum.optional()
});

// Helper function to create a schema variant based on user role
export const createVirtualReservationSchema = (isAdmin: boolean) => {
  // For admins, dealerId is required
  if (isAdmin) {
    return virtualReservationSchema.refine(
      (data) => !!data.dealerId,
      {
        message: "Il concessionario è obbligatorio",
        path: ["dealerId"]
      }
    );
  }
  
  // For dealers, use the base schema
  return virtualReservationSchema;
};

export type VirtualReservationFormValues = z.infer<typeof virtualReservationSchema>;
