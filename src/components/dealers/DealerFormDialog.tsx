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
import { dealersApi } from '@/api/supabase/dealersApi';
import { Image } from 'lucide-react';

const formSchema = z.object({
  companyName: z.string().min(1, 'Nome azienda richiesto'),
  address: z.string().min(1, 'Indirizzo richiesto'),
  city: z.string().min(1, 'Città richiesta'),
  province: z.string().length(2, 'Inserire la sigla della provincia'),
  zipCode: z.string().length(5, 'CAP non valido'),
  isActive: z.boolean().default(true),
  contactName: z.string().min(1, 'Nome contatto richiesto'),
  email: z.string().email('Email non valida'),
  password: z.string().min(6, 'Password deve essere di almeno 6 caratteri'),
  logo: z.any().optional(),
});

type FormValues = z.infer<typeof formSchema>;

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
  const [logoPreview, setLogoPreview] = React.useState<string | null>(dealer?.logo || null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: dealer?.companyName || '',
      address: dealer?.address || '',
      city: dealer?.city || '',
      province: dealer?.province || '',
      zipCode: dealer?.zipCode || '',
      isActive: dealer?.isActive !== undefined ? dealer.isActive : true,
      contactName: dealer?.contactName || '',
      email: dealer?.email || '',
      password: dealer?.password || '',
      logo: undefined,
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({
        companyName: dealer?.companyName || '',
        address: dealer?.address || '',
        city: dealer?.city || '',
        province: dealer?.province || '',
        zipCode: dealer?.zipCode || '',
        isActive: dealer?.isActive !== undefined ? dealer.isActive : true,
        contactName: dealer?.contactName || '',
        email: dealer?.email || '',
        password: dealer?.password || '',
        logo: undefined,
      });
      setLogoPreview(dealer?.logo || null);
    }
  }, [dealer, open, form]);

  const handleLogoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      form.setValue('logo', file);
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      let logoUrl = dealer?.logo;
      
      if (values.logo instanceof File) {
        try {
          logoUrl = await dealersApi.uploadLogo(values.logo, dealer?.id || 'temp');
        } catch (error) {
          console.error('Error uploading logo:', error);
          toast({
            title: "Errore nel caricamento del logo",
            description: "Controlla il file e riprova",
            variant: "destructive",
          });
          return;
        }
      }

      if (dealer) {
        await dealersApi.update({
          ...dealer,
          ...values,
          logo: logoUrl,
        });
        toast({
          title: "Dealer aggiornato con successo",
        });
      } else {
        await dealersApi.create({
          ...values,
          logo: logoUrl,
        });
        toast({
          title: "Dealer creato con successo",
        });
      }
      
      onOpenChange(false);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Errore durante il salvataggio:', error);
      toast({
        title: "Errore durante il salvataggio",
        description: "Controlla i dati inseriti e riprova",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
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
            <div className="flex items-center gap-4">
              {logoPreview ? (
                <img 
                  src={logoPreview} 
                  alt="Logo preview" 
                  className="w-24 h-24 object-contain border rounded-lg"
                />
              ) : (
                <div className="w-24 h-24 border rounded-lg flex items-center justify-center bg-gray-50">
                  <Image className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {logoPreview ? 'Cambia Logo' : 'Carica Logo'}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoChange}
                />
              </div>
            </div>

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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Contatto</FormLabel>
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
            </div>

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
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

            <div className="grid grid-cols-2 gap-4">
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
