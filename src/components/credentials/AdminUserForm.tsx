
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { AdminUser, Role, Permission } from '@/types/admin';
import UserInfoFields from './UserInfoFields';
import StatusAndRoleFields from './StatusAndRoleFields';
import PermissionsCheckboxes from './PermissionsCheckboxes';

export const formSchema = z.object({
  firstName: z.string().min(2, 'Il nome deve contenere almeno 2 caratteri.'),
  lastName: z.string().min(2, 'Il cognome deve contenere almeno 2 caratteri.'),
  email: z.string().email('Inserire un indirizzo email valido.'),
  password: z.string().min(8, 'La password deve essere di almeno 8 caratteri.'),
  isActive: z.boolean(),
  role: z.enum(['superAdmin', 'admin', 'operator', 'supervisor'] as const),
  permissions: z.array(z.enum(['dashboard', 'inventory', 'quotes', 'orders', 'dealers', 'credentials', 'settings'] as const)),
});

export type FormValues = z.infer<typeof formSchema>;

export const permissionItems = [
  { id: 'dashboard' as Permission, label: 'Dashboard' },
  { id: 'inventory' as Permission, label: 'Inventario' },
  { id: 'quotes' as Permission, label: 'Preventivi' },
  { id: 'orders' as Permission, label: 'Ordini Auto' },
  { id: 'dealers' as Permission, label: 'Dealers' },
  { id: 'credentials' as Permission, label: 'Credenziali' },
  { id: 'settings' as Permission, label: 'Impostazioni' },
];

interface AdminUserFormProps {
  form: UseFormReturn<FormValues>;
  user: AdminUser | null;
  onClose: () => void;
  onSubmit: (values: FormValues) => Promise<void>;
  handleRoleChange: (role: Role) => void;
}

const AdminUserForm: React.FC<AdminUserFormProps> = ({
  form,
  user,
  onClose,
  onSubmit,
  handleRoleChange,
}) => {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <UserInfoFields 
          control={form.control} 
          showPassword={showPassword} 
          setShowPassword={setShowPassword}
        />
        
        <StatusAndRoleFields 
          control={form.control} 
          onRoleChange={handleRoleChange}
        />
        
        <PermissionsCheckboxes 
          control={form.control} 
          permissionItems={permissionItems}
        />
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Annulla
          </Button>
          <Button type="submit">
            {user ? "Salva modifiche" : "Crea utente"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default AdminUserForm;
