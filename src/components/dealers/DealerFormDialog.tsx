
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
import { Image, Euro } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

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
  creditLimit: z.preprocess(
    (val) => (val === '' ? 0 : Number(val)),
    z.number().min(0, 'Il plafond non può essere negativo')
  ),
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
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { user } = useAuth();
  const isAdmin = user?.type === 'admin';

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
      creditLimit: dealer?.creditLimit || 0,
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
        creditLimit: dealer?.creditLimit || 0,
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

  // Since uploadLogo doesn't exist on the dealersApi, we'll use a simplified approach
  const uploadLogo = async (file: File, dealerId: string): Promise<string | null> => {
    // In a real implementation, this would upload to storage
    // For now, we'll just return the file as a data URL
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  };

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      let logoUrl = dealer?.logo;
      
      if (values.logo instanceof File) {
        try {
          logoUrl = await uploadLogo(values.logo, dealer?.id || 'temp');
          console.log('Logo uploaded successfully:', logoUrl);
        } catch (error) {
          console.error('Error uploading logo:', error);
          toast({
            title: "Errore nel caricamento del logo",
            description: "Controlla il file e riprova",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
      }

      const dealerData: Omit<Dealer, 'id' | 'createdAt'> = {
        companyName: values.companyName,
        address: values.address,
        city: values.city,
        province: values.province,
        zipCode: values.zipCode,
        isActive: values.isActive,
        contactName: values.contactName,
        email: values.email,
        password: values.password,
        logo: logoUrl,
        creditLimit: values.creditLimit,
      };

      console.log('Submitting dealer data:', dealerData);

      if (dealer) {
        console.log('Updating dealer with ID:', dealer.id);
        await dealersApi.update(dealer.id, dealerData);
        toast({
          title: "Dealer aggiornato con successo",
        });
      } else {
        console.log('Creating new dealer');
        await dealersApi.create(dealerData);
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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-screen py-[40px] overflow-y-scroll">
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

            {isAdmin && (
              <FormField
                control={form.control}
                name="creditLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plafond (€)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))} 
                          value={field.value}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <Euro className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Annulla
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Salvataggio...' : dealer ? 'Aggiorna' : 'Crea'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default DealerFormDialog;
