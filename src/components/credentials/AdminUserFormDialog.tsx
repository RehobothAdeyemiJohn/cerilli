
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { AdminUser, Role, Permission, AdminUserFormData } from '@/types/admin';
import { adminUsersApi } from '@/api/localStorage';
import AdminUserForm, { FormValues, formSchema } from './AdminUserForm';

interface AdminUserFormDialogProps {
  isOpen: boolean;
  user: AdminUser | null;
  onClose: () => void;
  onSaved: () => void;
}

const AdminUserFormDialog: React.FC<AdminUserFormDialogProps> = ({
  isOpen,
  user,
  onClose,
  onSaved,
}) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      isActive: true,
      role: 'operator' as Role,
      permissions: [] as Permission[],
    },
  });
  
  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: user.password,
        isActive: user.isActive,
        role: user.role,
        permissions: user.permissions,
      });
    } else {
      form.reset({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        isActive: true,
        role: 'operator' as Role,
        permissions: [] as Permission[],
      });
    }
  }, [user, form]);
  
  const onSubmit = async (values: FormValues) => {
    try {
      // Create a properly typed AdminUserFormData object
      const userData: AdminUserFormData = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        isActive: values.isActive,
        role: values.role,
        permissions: values.permissions,
      };
      
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
  
  // Funzione per impostare i permessi in base al ruolo selezionato
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
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {user ? "Modifica utente" : "Crea nuovo utente"}
          </DialogTitle>
        </DialogHeader>
        
        <AdminUserForm 
          form={form} 
          user={user} 
          onClose={onClose} 
          onSubmit={onSubmit}
          handleRoleChange={handleRoleChange}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AdminUserFormDialog;
