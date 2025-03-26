
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/hooks/use-toast';
import { Form } from '@/components/ui/form';
import { Role, Permission, AdminUser, AdminUserFormData } from '@/types/admin';
import { adminUsersApi } from '@/api/supabase/adminUsersApi';
import { formSchema, FormValues } from '../schemas/userFormSchema';
import UserBasicInfo from './UserBasicInfo';
import UserRoleSection from './UserRoleSection';
import UserPermissions from './UserPermissions';
import FormActions from './FormActions';

interface UserFormProps {
  user: AdminUser | null;
  onClose: () => void;
  onSaved: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, onClose, onSaved }) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      password: user?.password || '',
      active: user?.active ?? true,
      role: user?.role || 'operator' as Role,
      permissions: user?.permissions || [] as Permission[],
    },
  });

  const handleRoleChange = (role: Role) => {
    let permissions: Permission[] = [];
    switch (role) {
      case 'superAdmin':
        permissions = ['dashboard', 'inventory', 'quotes', 'orders', 'dealers', 'credentials', 'settings'];
        break;
      case 'admin':
        permissions = ['dashboard', 'inventory', 'quotes', 'orders', 'dealers', 'settings'];
        break;
      case 'supervisor':
        permissions = ['dashboard', 'inventory', 'quotes', 'orders'];
        break;
      case 'operator':
        permissions = ['dashboard', 'inventory'];
        break;
    }
    form.setValue('permissions', permissions);
  };

  const onSubmit = async (values: FormValues) => {
    try {
      const userData: AdminUserFormData = {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        password: values.password,
        active: values.active,
        role: values.role,
        permissions: values.permissions,
      };
      console.log(userData)

      if (user) {
        await adminUsersApi.update(user.id, userData);
        toast({
          title: "Utente aggiornato",
          description: "Le informazioni dell'utente sono state aggiornate con successo.",
        });
      } else {
        await adminUsersApi.create(userData);
        toast({
          title: "Utente creato",
          description: "Il nuovo utente è stato creato con successo.",
        });
      }
      onSaved();
    } catch (error) {
      console.error('Errore durante il salvataggio:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il salvataggio dell'utente.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <UserBasicInfo control={form.control} />
        <UserRoleSection 
          control={form.control} 
          onRoleChange={handleRoleChange} 
        />
        <UserPermissions control={form.control} />
        <FormActions onClose={onClose} isEditing={!!user} />
      </form>
    </Form>
  );
};

export default UserForm;
