
import React from 'react';
import { Control } from 'react-hook-form';
import { Role } from '@/types/admin';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface StatusAndRoleFieldsProps {
  control: Control<any>;
  onRoleChange: (role: Role) => void;
}

const StatusAndRoleFields: React.FC<StatusAndRoleFieldsProps> = ({
  control,
  onRoleChange,
}) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={control}
        name="isActive"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Stato Utente</FormLabel>
              <FormDescription>
                Attiva o disattiva l'accesso dell'utente al sistema.
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />
      
      <FormField
        control={control}
        name="role"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Ruolo</FormLabel>
            <Select 
              value={field.value} 
              onValueChange={(value: Role) => {
                field.onChange(value);
                onRoleChange(value);
              }}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona un ruolo" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="superAdmin">Super Amministratore</SelectItem>
                <SelectItem value="admin">Amministratore</SelectItem>
                <SelectItem value="supervisor">Supervisore</SelectItem>
                <SelectItem value="operator">Operatore</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              Il ruolo determina i permessi di default dell'utente.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default StatusAndRoleFields;
