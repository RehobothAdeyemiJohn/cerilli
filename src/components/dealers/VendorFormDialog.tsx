
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dealer, Vendor } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { addVendor, updateVendor } from '@/data/mockData';

const formSchema = z.object({
  name: z.string().min(1, 'Nome richiesto'),
  email: z.string().email('Email non valida'),
  password: z.string().min(6, 'La password deve essere di almeno 6 caratteri').optional().or(z.literal('')),
});

interface VendorFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dealer: Dealer | null;
  vendor?: Vendor | null;
  onSuccess?: () => void;
}

const VendorFormDialog = ({
  open,
  onOpenChange,
  dealer,
  vendor,
  onSuccess,
}: VendorFormDialogProps) => {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: vendor?.name || '',
      email: vendor?.email || '',
      password: '',
    },
  });

  // Reset form when vendor changes or dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        name: vendor?.name || '',
        email: vendor?.email || '',
        password: '',
      });
    }
  }, [vendor, open, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!dealer) return;

    try {
      if (vendor) {
        // Update existing vendor
        updateVendor({
          ...vendor,
          name: values.name,
          email: values.email,
          // Only update password if provided
          ...(values.password ? { password: values.password } : {}),
        });
        toast({
          title: "Venditore aggiornato con successo",
        });
      } else {
        // Create new vendor
        addVendor({
          dealerId: dealer.id,
          name: values.name,
          email: values.email,
          password: values.password || 'default123', // Fallback password
          role: 'vendor',
        });
        toast({
          title: "Venditore creato con successo",
        });
      }
      
      // Call onSuccess callback to refresh the list
      if (onSuccess) {
        onSuccess();
      }
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Errore durante il salvataggio",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>
            {vendor ? 'Modifica Venditore' : 'Nuovo Venditore'}
          </DialogTitle>
          <DialogDescription>
            Inserisci i dettagli del venditore.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
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
                  <FormLabel>
                    {vendor ? 'Nuova Password (opzionale)' : 'Password'}
                  </FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Annulla
              </Button>
              <Button type="submit">
                {vendor ? 'Aggiorna' : 'Crea'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default VendorFormDialog;
