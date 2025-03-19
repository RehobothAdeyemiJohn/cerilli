
import { z } from 'zod';

export const formSchema = z.object({
  trim: z.string().optional(),
  dealerId: z.string().optional(),
  accessories: z.array(z.string()).optional(),
  fuelType: z.string().optional(),
  exteriorColor: z.string().optional(),
  transmission: z.string().optional(),
  reservationDestination: z.enum(['Conto Esposizione', 'Stock', 'Contratto Abbinato']).optional(),
});

export type FormValues = z.infer<typeof formSchema>;
