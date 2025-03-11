
import React from 'react';
import { Control } from 'react-hook-form';
import { Permission } from '@/types/admin';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { FormValues } from '../schemas/userFormSchema';

interface PermissionItem {
  id: Permission;
  label: string;
}

const permissionItems: PermissionItem[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'inventory', label: 'Inventario' },
  { id: 'quotes', label: 'Preventivi' },
  { id: 'orders', label: 'Ordini Auto' },
  { id: 'dealers', label: 'Dealers' },
  { id: 'credentials', label: 'Credenziali' },
  { id: 'settings', label: 'Impostazioni' },
];

interface UserPermissionsProps {
  control: Control<FormValues>;
}

const UserPermissions: React.FC<UserPermissionsProps> = ({ control }) => {
  return (
    <FormField
      control={control}
      name="permissions"
      render={() => (
        <FormItem>
          <div className="mb-4">
            <FormLabel className="text-base">Permessi</FormLabel>
            <FormDescription>
              Seleziona le sezioni a cui l'utente avrà accesso.
            </FormDescription>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {permissionItems.map((item) => (
              <FormField
                key={item.id}
                control={control}
                name="permissions"
                render={({ field }) => (
                  <FormItem
                    key={item.id}
                    className="flex flex-row items-start space-x-3 space-y-0"
                  >
                    <FormControl>
                      <Checkbox
                        checked={field.value?.includes(item.id)}
                        onCheckedChange={(checked) => {
                          return checked
                            ? field.onChange([...field.value, item.id])
                            : field.onChange(
                                field.value?.filter(
                                  (value) => value !== item.id
                                )
                              );
                        }}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">
                      {item.label}
                    </FormLabel>
                  </FormItem>
                )}
              />
            ))}
          </div>
        </FormItem>
      )}
    />
  );
};

export default UserPermissions;
