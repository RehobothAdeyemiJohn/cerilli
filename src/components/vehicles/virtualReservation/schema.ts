
import { z } from 'zod';

// Base form schema for all users
const baseSchema = z.object({
  trim: z.string().optional(),
  accessories: z.array(z.string()).optional(),
  fuelType: z.string().optional(),
  exteriorColor: z.string().optional(),
  transmission: z.string().optional(),
  reservationDestination: z.enum(['Conto Esposizione', 'Stock', 'Contratto Abbinato']).optional(),
});

// Admin schema with dealerId field
const adminSchema = baseSchema.extend({
  dealerId: z.string().optional(),
});

// Create the appropriate schema based on user type
export const createVirtualReservationSchema = (isAdmin: boolean) => {
  return isAdmin ? adminSchema : baseSchema;
};

// Export a default schema for basic validation
export const virtualReservationSchema = baseSchema;

// Export the form values type
export type VirtualReservationFormValues = z.infer<typeof adminSchema>;
