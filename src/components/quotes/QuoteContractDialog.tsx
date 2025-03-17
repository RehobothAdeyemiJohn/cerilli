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
  // Contractor type
  contractorType: z.enum(['personaFisica', 'personaGiuridica']),
  
  // Common fields for both types
  firstName: z.string().min(1, "Il nome è obbligatorio"),
  lastName: z.string().min(1, "Il cognome è obbligatorio"),
  fiscalCode: z.string().min(1, "Il codice fiscale è obbligatorio"),
  address: z.string().min(1, "L'indirizzo è obbligatorio"),
  city: z.string().min(1, "Il comune è obbligatorio"),
  province: z.string().min(1, "La provincia è obbligatoria"),
  zipCode: z.string().min(1, "Il CAP è obbligatorio"),
  phone: z.string().min(1, "Il telefono è obbligatorio"),
  email: z.string().email("Inserire un indirizzo email valido"),
  
  // Fields for natural person
  birthDate: z.string().optional(),
  birthPlace: z.string().optional(),
  birthProvince: z.string().optional(),
  
  // Fields for juridical person
  companyName: z.string().optional(),
  vatNumber: z.string().optional(),
  
  // Legal representative fields
  legalRepFirstName: z.string().optional(),
  legalRepLastName: z.string().optional(),
  legalRepFiscalCode: z.string().optional(),
  legalRepBirthDate: z.string().optional(),
  legalRepBirthPlace: z.string().optional(),
  legalRepBirthProvince: z.string().optional(),

  // Vehicle discount fields
  discount: z.number().default(0),
  finalPrice: z.number().default(0),
  
  // Trade-in info
  hasTradeIn: z.boolean().default(false),
  tradeInMake: z.string().optional(),
  tradeInModel: z.string().optional(),
  tradeInYear: z.string().optional(),
  tradeInValue: z.number().optional(),
}).refine((data) => {
  // If contractor type is company, specific fields are required
  if (data.contractorType === 'personaGiuridica') {
    return !!data.companyName && !!data.vatNumber && 
           !!data.legalRepFirstName && !!data.legalRepLastName && 
           !!data.legalRepFiscalCode && !!data.legalRepBirthDate && 
           !!data.legalRepBirthPlace && !!data.legalRepBirthProvince;
  }
  
  // If natural person, these fields are required
  if (data.contractorType === 'personaFisica') {
    return !!data.birthDate && !!data.birthPlace && !!data.birthProvince;
  }
  
  return true;
}, {
  message: "Campi obbligatori mancanti",
  path: ["contractorType"]
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
  const form = useForm<ContractFormValues>({
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
      discount: 0,
      finalPrice: 0,
      hasTradeIn: false,
      tradeInMake: '',
      tradeInModel: '',
      tradeInYear: '',
      tradeInValue: 0
    }
  });

  // Prepopulate form with quote data when opened
  useEffect(() => {
    if (quote && open) {
      // Split customer name into first and last name if possible
      const nameParts = quote.customerName.split(' ');
      const lastName = nameParts.length > 1 ? nameParts[0] : '';
      const firstName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : nameParts[0];
      
      // Reset form with initial values from quote
      form.reset({
        ...form.getValues(),
        firstName,
        lastName,
        email: quote.customerEmail || '',
        phone: quote.customerPhone || '',
        discount: quote.discount || 0,
        finalPrice: quote.finalPrice || 0,
        hasTradeIn: quote.hasTradeIn || false,
        tradeInMake: quote.tradeInBrand || '', // Use tradeInBrand instead of tradeInMake
        tradeInModel: quote.tradeInModel || '',
        tradeInYear: quote.tradeInYear || '',
        tradeInValue: quote.tradeInValue || 0
      });
    }
  }, [quote, open, form]);

  const contractorType = form.watch('contractorType');
  const isCompany = contractorType === 'personaGiuridica';
  const hasTradeIn = form.watch('hasTradeIn');

  const handleSubmit = async (data: ContractFormValues) => {
    if (quote) {
      await onSubmit(quote.id, data);
    }
  };

  if (!quote || !vehicle) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Converti Preventivo in Contratto</DialogTitle>
          <DialogDescription>
            Inserisci i dati del contraente per creare un nuovo contratto
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Vehicle Information Section */}
            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <h3 className="text-md font-semibold mb-2">Informazioni Veicolo</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Modello</Label>
                  <div className="font-medium">{vehicle.model} {vehicle.trim || ''}</div>
                </div>
                <div>
                  <Label>Telaio</Label>
                  <div className="font-medium">{vehicle.telaio || 'N/A'}</div>
                </div>
                <div>
                  <Label>Colore</Label>
                  <div className="font-medium">{vehicle.exteriorColor || 'N/A'}</div>
                </div>
                <div>
                  <Label>Prezzo Base</Label>
                  <div className="font-medium">€{vehicle.price?.toLocaleString() || 'N/A'}</div>
                </div>
              </div>
              
              {/* Price Adjustment Fields */}
              <div className="grid grid-cols-3 gap-4 mt-4">
                <FormField
                  control={form.control}
                  name="discount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sconto</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => {
                            const value = parseFloat(e.target.value) || 0;
                            field.onChange(value);
                            // Update final price
                            const basePrice = vehicle.price || 0;
                            form.setValue('finalPrice', basePrice - value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="finalPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prezzo Finale</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} readOnly />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <FormField
              control={form.control}
              name="contractorType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipologia</FormLabel>
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
            
            {/* Company Information (Only for Persona Giuridica) */}
            {isCompany && (
              <div className="space-y-4">
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

            {/* Personal Information Section */}
            <div className="space-y-4">
              <h3 className="text-md font-semibold">{isCompany ? 'Dati Rappresentante Legale' : 'Dati Personali'}</h3>
              
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
              
              {/* Birth Information (for both person and legal representative) */}
              <div className="grid grid-cols-1 gap-4">
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
            </div>
            
            {/* Contact Information Section */}
            <div className="space-y-4">
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
            
            {/* Trade-in Section */}
            <div className="space-y-4">
              <div className="flex items-center">
                <FormField
                  control={form.control}
                  name="hasTradeIn"
                  render={({ field }) => (
                    <FormItem className="flex gap-2 items-center space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          className="checkbox"
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-medium">Permuta</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
              
              {hasTradeIn && (
                <div className="bg-gray-50 p-4 rounded-md space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="tradeInMake"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Marca</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Marca veicolo permuta" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="tradeInModel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Modello</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Modello veicolo permuta" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="tradeInYear"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Anno</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Anno veicolo permuta" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="tradeInValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valore Permuta</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} placeholder="Valore permuta" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}
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
