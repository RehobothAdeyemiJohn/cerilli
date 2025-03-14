
import { z } from 'zod';

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
  
  // Original stock
  originalStock: z.string().optional()
});

export type VirtualReservationFormValues = z.infer<typeof virtualReservationSchema>;
