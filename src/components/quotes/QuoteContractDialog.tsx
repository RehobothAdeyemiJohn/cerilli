
import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Quote, Vehicle } from '@/types';
import { Loader2 } from 'lucide-react';

const contractSchema = z.object({
  contractorType: z.enum(['personaFisica', 'personaGiuridica']),
  
  firstName: z.string().min(1, "Il nome è obbligatorio"),
  lastName: z.string().min(1, "Il cognome è obbligatorio"),
  fiscalCode: z.string().min(1, "Il codice fiscale è obbligatorio"),
  address: z.string().min(1, "L'indirizzo è obbligatorio"),
  city: z.string().min(1, "Il comune è obbligatorio"),
  province: z.string().min(1, "La provincia è obbligatoria"),
  zipCode: z.string().min(1, "Il CAP è obbligatorio"),
  phone: z.string().min(1, "Il telefono è obbligatorio"),
  email: z.string().email("Inserire un indirizzo email valido"),
  
  birthDate: z.string().optional(),
  birthPlace: z.string().optional(),
  birthProvince: z.string().optional(),
  
  companyName: z.string().optional(),
  vatNumber: z.string().optional(),
  
  legalRepFirstName: z.string().optional(),
  legalRepLastName: z.string().optional(),
  legalRepFiscalCode: z.string().optional(),
  legalRepBirthDate: z.string().optional(),
  legalRepBirthPlace: z.string().optional(),
  legalRepBirthProvince: z.string().optional(),
  
  terminiPagamento: z.string().min(1, "I termini di pagamento sono obbligatori"),
  clausoleSpeciali: z.string().optional(),
  tempiConsegna: z.string().min(1, "I tempi di consegna sono obbligatori"),
  garanzia: z.string().min(1, "La garanzia è obbligatoria")
}).refine((data) => {
  if (data.contractorType === 'personaFisica') {
    return !!data.birthDate && !!data.birthPlace && !!data.birthProvince;
  }
  if (data.contractorType === 'personaGiuridica') {
    return !!data.companyName && !!data.vatNumber &&
           !!data.legalRepFirstName && !!data.legalRepLastName &&
           !!data.legalRepFiscalCode && !!data.legalRepBirthDate &&
           !!data.legalRepBirthPlace && !!data.legalRepBirthProvince;
  }
  return false;
}, {
  message: "Compilare tutti i campi obbligatori per il tipo di contraente selezionato",
});

type ContractFormValues = z.infer<typeof contractSchema>;

interface QuoteContractDialogProps {
  quote: Quote | null;
  vehicle: Vehicle | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (quoteId: string, contractData: ContractFormValues) => Promise<void>;
  isSubmitting: boolean;
}

const QuoteContractDialog = ({ 
  quote, 
  vehicle,
  open, 
  onClose, 
  onSubmit,
  isSubmitting 
}: QuoteContractDialogProps) => {
  const form = useForm<z.infer<typeof contractSchema>>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      contractorType: 'personaFisica',
      firstName: '',
      lastName: '',
      fiscalCode: '',
      address: '',
      city: '',
      province: '',
      zipCode: '',
      phone: '',
      email: '',
      birthDate: '',
      birthPlace: '',
      birthProvince: '',
      companyName: '',
      vatNumber: '',
      legalRepFirstName: '',
      legalRepLastName: '',
      legalRepFiscalCode: '',
      legalRepBirthDate: '',
      legalRepBirthPlace: '',
      legalRepBirthProvince: '',
      terminiPagamento: 'Bonifico Bancario',
      clausoleSpeciali: '',
      tempiConsegna: '30',
      garanzia: '24 mesi'
    }
  });

  useEffect(() => {
    if (quote && open) {
      const nameParts = quote.customerName.split(' ');
      const lastName = nameParts.length > 1 ? nameParts[0] : '';
      const firstName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : nameParts[0];
      
      form.reset({
        ...form.getValues(),
        firstName,
        lastName,
        email: quote.customerEmail || '',
        phone: quote.customerPhone || ''
      });
    }
  }, [quote, open, form]);

  const contractorType = form.watch('contractorType');
  const isCompany = contractorType === 'personaGiuridica';

  const handleSubmit = async (data: z.infer<typeof contractSchema>) => {
    console.log('Form submitted with data:', data);
    if (quote) {
      try {
        await onSubmit(quote.id, data);
      } catch (error) {
        console.error('Error submitting form:', error);
      }
    }
  };

  if (!quote || !vehicle) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[1200px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Converti Preventivo in Contratto</DialogTitle>
          <DialogDescription>
            Inserisci i dati del contraente per creare un nuovo contratto
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-md font-semibold mb-4">Tipo Contraente</h3>
                  <FormField
                    control={form.control}
                    name="contractorType"
                    render={({ field }) => (
                      <FormItem>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleziona tipologia" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="personaFisica">Persona Fisica</SelectItem>
                            <SelectItem value="personaGiuridica">Persona Giuridica</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {isCompany && (
                  <div className="bg-gray-50 p-4 rounded-md space-y-4">
                    <h3 className="text-md font-semibold">Dati Azienda</h3>
                    <FormField
                      control={form.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ragione Sociale</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Inserisci ragione sociale" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="vatNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Partita IVA</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Inserisci partita IVA" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <div className="bg-gray-50 p-4 rounded-md space-y-4">
                  <h3 className="text-md font-semibold">
                    {isCompany ? 'Dati Rappresentante Legale' : 'Dati Personali'}
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={isCompany ? "legalRepFirstName" : "firstName"}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Inserisci nome" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={isCompany ? "legalRepLastName" : "lastName"}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cognome</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Inserisci cognome" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name={isCompany ? "legalRepFiscalCode" : "fiscalCode"}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Codice Fiscale</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Inserisci codice fiscale" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name={isCompany ? "legalRepBirthDate" : "birthDate"}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data di Nascita</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={isCompany ? "legalRepBirthPlace" : "birthPlace"}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Comune di Nascita</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Inserisci comune" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={isCompany ? "legalRepBirthProvince" : "birthProvince"}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Provincia di Nascita</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Provincia" maxLength={2} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-md space-y-4">
                  <h3 className="text-md font-semibold">Dati di Contatto</h3>
                  
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Indirizzo</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Inserisci indirizzo" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Comune</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Inserisci comune" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="province"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Provincia</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Provincia" maxLength={2} />
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
                            <Input {...field} placeholder="Inserisci CAP" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefono</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Inserisci telefono" />
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
                            <Input {...field} placeholder="Inserisci email" type="email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-md font-semibold mb-2">Informazioni Veicolo</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Modello</Label>
                      <div className="font-medium">{vehicle?.model} {vehicle?.trim || ''}</div>
                    </div>
                    <div>
                      <Label>Telaio</Label>
                      <div className="font-medium">{vehicle?.telaio || 'N/A'}</div>
                    </div>
                    <div>
                      <Label>Colore</Label>
                      <div className="font-medium">{vehicle?.exteriorColor || 'N/A'}</div>
                    </div>
                    <div>
                      <Label>Prezzo Base</Label>
                      <div className="font-medium">€{vehicle?.price?.toLocaleString() || 'N/A'}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-md space-y-4">
                  <h3 className="text-md font-semibold">Condizioni di Contratto</h3>
                  
                  <FormField
                    control={form.control}
                    name="terminiPagamento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Termini di Pagamento</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Es. Bonifico Bancario" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="tempiConsegna"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tempi di Consegna (giorni)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" min="1" placeholder="30" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="garanzia"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Garanzia</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Es. 24 mesi" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="clausoleSpeciali"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Clausole Speciali</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Eventuali clausole speciali" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Annulla
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creazione in corso...
                  </>
                ) : (
                  'Crea Contratto'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default QuoteContractDialog;
