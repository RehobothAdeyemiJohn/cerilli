
import { z } from 'zod';

// Schema for virtual reservation
export const createVirtualReservationSchema = (isAdmin: boolean) => {
  const baseSchema = {
    trim: z.string().min(1, { message: "È necessario selezionare un allestimento" }),
    fuelType: z.string().min(1, { message: "È necessario selezionare un'alimentazione" }),
    exteriorColor: z.string().min(1, { message: "È necessario selezionare un colore" }),
    transmission: z.string().min(1, { message: "È necessario selezionare un cambio" }),
    accessories: z.array(z.string()).default([]),
    reservationDestination: z.string().min(1, { message: "È necessario selezionare una destinazione" }),
  };
  
  // Only admins need to select the dealer
  if (isAdmin) {
    return z.object({
      ...baseSchema,
      dealerId: z.string().min(1, { message: "È necessario selezionare un concessionario" }),
    });
  }
  
  return z.object(baseSchema);
};

// This type definition explicitly allows for both base fields and optional dealerId
export type VirtualReservationFormValues = z.infer<ReturnType<typeof createVirtualReservationSchema>> & {
  dealerId?: string;
};
