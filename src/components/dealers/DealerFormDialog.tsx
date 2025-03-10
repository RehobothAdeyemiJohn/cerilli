
import React from 'react';
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
import { Dealer } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { addDealer, updateDealer } from '@/data/mockData';

const formSchema = z.object({
  companyName: z.string().min(1, 'Nome azienda richiesto'),
  address: z.string().min(1, 'Indirizzo richiesto'),
  city: z.string().min(1, 'Città richiesta'),
  province: z.string().length(2, 'Inserire la sigla della provincia'),
  zipCode: z.string().length(5, 'CAP non valido'),
  isActive: z.boolean().default(true),
});

interface DealerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dealer?: Dealer | null;
  onSuccess?: () => void;
}

const DealerFormDialog = ({
  open,
  onOpenChange,
  dealer,
  onSuccess,
}: DealerFormDialogProps) => {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: dealer?.companyName || '',
      address: dealer?.address || '',
      city: dealer?.city || '',
      province: dealer?.province || '',
      zipCode: dealer?.zipCode || '',
      isActive: dealer?.isActive !== undefined ? dealer.isActive : true,
    },
  });

  // Reset form when dealer changes or dialog opens
  React.useEffect(() => {
    if (open) {
      form.reset({
        companyName: dealer?.companyName || '',
        address: dealer?.address || '',
        city: dealer?.city || '',
        province: dealer?.province || '',
        zipCode: dealer?.zipCode || '',
        isActive: dealer?.isActive !== undefined ? dealer.isActive : true,
      });
    }
  }, [dealer, open, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (dealer) {
        // Update existing dealer
        updateDealer({
          ...dealer,
          ...values,
        });
        toast({
          title: "Dealer aggiornato con successo",
        });
      } else {
        // Create new dealer - ensure all required fields are present
        addDealer({
          companyName: values.companyName,
          address: values.address,
          city: values.city,
          province: values.province,
          zipCode: values.zipCode,
          isActive: values.isActive,
        });
        toast({
          title: "Dealer creato con successo",
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {dealer ? 'Modifica Dealer' : 'Nuovo Dealer'}
          </DialogTitle>
          <DialogDescription>
            Inserisci i dettagli del dealer.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Azienda</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Indirizzo</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Città</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="province"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Provincia</FormLabel>
                    <FormControl>
                      <Input {...field} maxLength={2} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="zipCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CAP</FormLabel>
                    <FormControl>
                      <Input {...field} maxLength={5} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Annulla
              </Button>
              <Button type="submit">
                {dealer ? 'Aggiorna' : 'Crea'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default DealerFormDialog;
