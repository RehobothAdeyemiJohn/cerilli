
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { AdminUser, Role, Permission, AdminUserFormData } from '@/types/admin';
import { adminUsersApi } from '@/api/localStorage';

interface AdminUserFormDialogProps {
  isOpen: boolean;
  user: AdminUser | null;
  onClose: () => void;
  onSaved: () => void;
}

const formSchema = z.object({
  firstName: z.string().min(2, 'Il nome deve contenere almeno 2 caratteri.'),
  lastName: z.string().min(2, 'Il cognome deve contenere almeno 2 caratteri.'),
  email: z.string().email('Inserire un indirizzo email valido.'),
  password: z.string().min(8, 'La password deve essere di almeno 8 caratteri.'),
  isActive: z.boolean(),
  role: z.enum(['superAdmin', 'admin', 'operator', 'supervisor'] as const),
  permissions: z.array(z.enum(['dashboard', 'inventory', 'quotes', 'orders', 'dealers', 'credentials', 'settings'] as const)),
});

type FormValues = z.infer<typeof formSchema>;

const permissionItems = [
  { id: 'dashboard' as Permission, label: 'Dashboard' },
  { id: 'inventory' as Permission, label: 'Inventario' },
  { id: 'quotes' as Permission, label: 'Preventivi' },
  { id: 'orders' as Permission, label: 'Ordini Auto' },
  { id: 'dealers' as Permission, label: 'Dealers' },
  { id: 'credentials' as Permission, label: 'Credenziali' },
  { id: 'settings' as Permission, label: 'Impostazioni' },
];

const AdminUserFormDialog: React.FC<AdminUserFormDialogProps> = ({
  isOpen,
  user,
  onClose,
  onSaved,
}) => {
  const [showPassword, setShowPassword] = React.useState(false);
  
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
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cognome</FormLabel>
                    <FormControl>
                      <Input placeholder="Cognome" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="email@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Password" 
                        {...field} 
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center px-3"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormDescription>
                    La password deve contenere almeno 8 caratteri.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
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
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ruolo</FormLabel>
                    <Select 
                      value={field.value} 
                      onValueChange={(value: Role) => {
                        field.onChange(value);
                        handleRoleChange(value);
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
            
            <FormField
              control={form.control}
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
                        control={form.control}
                        name="permissions"
                        render={({ field }) => {
                          return (
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
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
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
      </DialogContent>
    </Dialog>
  );
};

export default AdminUserFormDialog;
