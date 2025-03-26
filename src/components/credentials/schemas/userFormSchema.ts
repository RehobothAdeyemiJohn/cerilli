
import { z } from 'zod';
import { Role, Permission } from '@/types/admin';

export const formSchema = z.object({
  first_name: z.string().min(2, 'Il nome deve contenere almeno 2 caratteri.'),
  last_name: z.string().min(2, 'Il cognome deve contenere almeno 2 caratteri.'),
  email: z.string().email('Inserire un indirizzo email valido.'),
  password: z.string().min(8, 'La password deve essere di almeno 8 caratteri.'),
  active: z.boolean(),
  role: z.enum(['superAdmin', 'admin', 'operator', 'supervisor'] as const),
  permissions: z.array(z.enum(['dashboard', 'inventory', 'quotes', 'orders', 'dealers', 'credentials', 'settings'] as const)),
});

export type FormValues = z.infer<typeof formSchema>;
