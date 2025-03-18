
import React, { useEffect, useState } from 'react';
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
import { Switch } from '@/components/ui/switch';
import { formatCurrency } from '@/lib/utils';

const contractSchema = z.object({
  contractorType: z.enum(['personaFisica', 'personaGiuridica']),
  
  // Personal data - persona fisica
  firstName: z.string().min(1, "Il nome è obbligatorio"),
  lastName: z.string().min(1, "Il cognome è obbligatorio"),
  fiscalCode: z.string().min(1, "Il codice fiscale è obbligatorio"),
  birthDate: z.string().min(1, "La data di nascita è obbligatoria"),
  birthPlace: z.string().min(1, "Il luogo di nascita è obbligatorio"),
  birthProvince: z.string().min(1, "La provincia di nascita è obbligatoria"),
  
  // Company data - persona giuridica
  companyName: z.string().optional(),
  vatNumber: z.string().optional(),
  
  // Legal representative - persona giuridica
  legalRepFirstName: z.string().optional(),
  legalRepLastName: z.string().optional(),
  legalRepFiscalCode: z.string().optional(),
  legalRepBirthDate: z.string().optional(),
  legalRepBirthPlace: z.string().optional(),
  legalRepBirthProvince: z.string().optional(),
  
  // Contact data
  address: z.string().min(1, "L'indirizzo è obbligatorio"),
  city: z.string().min(1, "Il comune è obbligatorio"),
  province: z.string().min(1, "La provincia è obbligatoria"),
  zipCode: z.string().min(1, "Il CAP è obbligatorio"),
  phone: z.string().min(1, "Il telefono è obbligatorio"),
  email: z.string().email("Inserire un indirizzo email valido"),
  
  // Contract conditions
  terminiPagamento: z.string().min(1, "I termini di pagamento sono obbligatori"),
  clausoleSpeciali: z.string().optional(),
  tempiConsegna: z.string().min(1, "I tempi di consegna sono obbligatori"),
  garanzia: z.string().min(1, "La garanzia è obbligatoria"),
  
  // Price configuration
  hasTradein: z.boolean().default(false),
  hasReducedVAT: z.boolean().default(false),
  discountAmount: z.number().default(0),
  plateBonus: z.number().default(0),
  tradeinBonus: z.number().default(0),
  safetyKitAmount: z.number().default(0),
  roadTaxAmount: z.number().default(350)
}).refine((data) => {
  if (data.contractorType === 'personaFisica') {
    return !!data.firstName && !!data.lastName && !!data.fiscalCode && 
           !!data.birthDate && !!data.birthPlace && !!data.birthProvince;
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
  const [totalPrice, setTotalPrice] = useState(0);
  
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
      terminiPagamento: 'Bonifico Bancario',
      clausoleSpeciali: '',
      tempiConsegna: '30',
      garanzia: '24 mesi',
      hasTradein: false,
      hasReducedVAT: false,
      discountAmount: 0,
      plateBonus: 0,
      tradeinBonus: 0,
      safetyKitAmount: 0,
      roadTaxAmount: 350
    }
  });

  // Watch form values for price calculation
  const watchHasTradein = form.watch('hasTradein');
  const watchHasReducedVAT = form.watch('hasReducedVAT');
  const watchDiscountAmount = form.watch('discountAmount');
  const watchPlateBonus = form.watch('plateBonus');
  const watchTradeinBonus = form.watch('tradeinBonus');
  const watchSafetyKitAmount = form.watch('safetyKitAmount');
  const watchRoadTaxAmount = form.watch('roadTaxAmount');

  // Calculate total price when form values change
  useEffect(() => {
    if (!vehicle || !quote) return;
    
    const basePrice = vehicle.price || quote.price || 0;
    const discount = Number(watchDiscountAmount) || 0;
    const plateBonus = Number(watchPlateBonus) || 0;
    const tradeinBonus = Number(watchTradeinBonus) || 0;
    const safetyKit = Number(watchSafetyKitAmount) || 0;
    const roadTax = Number(watchRoadTaxAmount) || 0;
    
    const totalDiscounts = discount + plateBonus + tradeinBonus;
    const totalAdditions = safetyKit + roadTax;
    
    const calculatedPrice = basePrice - totalDiscounts + totalAdditions;
    setTotalPrice(calculatedPrice);
  }, [
    vehicle, 
    quote,
    watchDiscountAmount,
    watchPlateBonus,
    watchTradeinBonus,
    watchSafetyKitAmount,
    watchRoadTaxAmount
  ]);

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

  const handleSubmit = async (data: ContractFormValues) => {
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

  const basePrice = vehicle.price || quote.price || 0;

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Contractor Type */}
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

                {/* Personal or Company Data */}
                {isCompany ? (
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
                ) : (
                  <div className="bg-gray-50 p-4 rounded-md space-y-4">
                    <h3 className="text-md font-semibold">Dati Personali</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
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
                        name="lastName"
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
                      name="fiscalCode"
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
                      name="birthDate"
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
                        name="birthPlace"
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
                        name="birthProvince"
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
                )}

                {/* Legal Representative for Company */}
                {isCompany && (
                  <div className="bg-gray-50 p-4 rounded-md space-y-4">
                    <h3 className="text-md font-semibold">Dati Rappresentante Legale</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="legalRepFirstName"
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
                        name="legalRepLastName"
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
                      name="legalRepFiscalCode"
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
                      name="legalRepBirthDate"
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
                        name="legalRepBirthPlace"
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
                        name="legalRepBirthProvince"
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
                )}

                {/* Contact Information */}
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

              {/* Right Column */}
              <div className="space-y-6">
                {/* Vehicle Information */}
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-md font-semibold mb-2">Informazioni Veicolo</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Modello</Label>
                      <div className="border rounded px-3 py-2 bg-white">
                        {vehicle?.model || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <Label>Allestimento</Label>
                      <div className="border rounded px-3 py-2 bg-white">
                        {vehicle?.trim || 'Standard'}
                      </div>
                    </div>
                    <div>
                      <Label>Colore Esterno</Label>
                      <div className="border rounded px-3 py-2 bg-white">
                        {vehicle?.exteriorColor || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <Label>Alimentazione</Label>
                      <div className="border rounded px-3 py-2 bg-white">
                        {vehicle?.fuelType || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <Label>Trasmissione</Label>
                      <div className="border rounded px-3 py-2 bg-white">
                        {vehicle?.transmission || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <Label>Ubicazione</Label>
                      <div className="border rounded px-3 py-2 bg-white">
                        {vehicle?.location || 'Preventivo Manuale'}
                      </div>
                    </div>
                    <div>
                      <Label>Telaio</Label>
                      <div className="border rounded px-3 py-2 bg-white">
                        {vehicle?.telaio || 'MANUALE' + Math.floor(Math.random() * 10000)}
                      </div>
                    </div>
                    <div>
                      <Label>Prezzo Base</Label>
                      <div className="border rounded px-3 py-2 bg-white">
                        {formatCurrency(basePrice)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price Configuration */}
                <div className="bg-gray-50 p-4 rounded-md space-y-4">
                  <h3 className="text-md font-semibold">Configurazione Prezzo</h3>
                  
                  <div className="flex items-center justify-between p-2 border rounded bg-white">
                    <div className="flex items-center space-x-2">
                      <FormField
                        control={form.control}
                        name="hasTradein"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <Switch 
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="m-0">Permuta</FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 border rounded bg-white">
                    <div className="flex items-center space-x-2">
                      <FormField
                        control={form.control}
                        name="hasReducedVAT"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <Switch 
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="m-0">IVA agevolata</FormLabel>
                            <span className="text-xs text-gray-500">
                              Applica IVA al 4% (Legge 104 art.3 com.3)
                            </span>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4">
                    <FormField
                      control={form.control}
                      name="discountAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sconto (€)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0" 
                              step="100"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="plateBonus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Premio Targa (€)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0" 
                              step="100"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="tradeinBonus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Premio Permuta (€)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0" 
                              step="100"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                              disabled={!watchHasTradein}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="safetyKitAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kit Sicurezza (€)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0" 
                              step="50"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                {/* Price Summary */}
                <div className="bg-gray-50 p-4 rounded-md space-y-2">
                  <h3 className="text-md font-semibold">Prezzo Finale</h3>
                  
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Prezzo Veicolo</span>
                      <span className="font-medium">{formatCurrency(basePrice)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Sconto</span>
                      <span className="text-red-500">- {formatCurrency(watchDiscountAmount)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Premio Targa</span>
                      <span className="text-red-500">- {formatCurrency(watchPlateBonus)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Premio Permuta</span>
                      <span className="text-red-500">- {formatCurrency(watchHasTradein ? watchTradeinBonus : 0)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Kit Sicurezza</span>
                      <span className="text-green-500">+ {formatCurrency(watchSafetyKitAmount)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Messa su strada</span>
                      <span className="text-green-500">+ {formatCurrency(watchRoadTaxAmount)}</span>
                    </div>
                    
                    <div className="border-t border-gray-300 mt-2 pt-2">
                      <div className="flex justify-between font-semibold">
                        <span>Prezzo Finale - Chiavi in mano</span>
                        <span className="text-lg">{formatCurrency(totalPrice)}</span>
                      </div>
                      <div className="text-xs text-right text-gray-500">
                        Aliquota IVA: {watchHasReducedVAT ? '4%' : '22%'}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Contract Conditions */}
                <div className="bg-gray-50 p-4 rounded-md space-y-4">
                  <h3 className="text-md font-semibold">Condizioni di Contratto</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
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
            </div>
            
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Annulla
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-blue-900 hover:bg-blue-800">
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
