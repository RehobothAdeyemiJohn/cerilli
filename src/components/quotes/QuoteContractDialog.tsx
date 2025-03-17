
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Quote } from '@/types';
import { Loader2 } from 'lucide-react';

const contractSchema = z.object({
  contractorType: z.enum(['personaFisica', 'personaGiuridica']),
  firstName: z.string().min(1, "Il nome è obbligatorio"),
  lastName: z.string().min(1, "Il cognome è obbligatorio"),
  companyName: z.string().optional(),
  fiscalCode: z.string().min(1, "Il codice fiscale è obbligatorio"),
  birthDate: z.string().min(1, "La data di nascita è obbligatoria"),
  birthPlace: z.string().min(1, "Il comune di nascita è obbligatorio"),
  birthProvince: z.string().min(1, "La provincia è obbligatoria"),
  // Add legal representative fields that are conditional
  legalRepFirstName: z.string().optional(),
  legalRepLastName: z.string().optional(),
  legalRepFiscalCode: z.string().optional()
}).refine((data) => {
  // If contractor type is company, legal representative fields are required
  if (data.contractorType === 'personaGiuridica') {
    return !!data.companyName && !!data.legalRepFirstName && !!data.legalRepLastName && !!data.legalRepFiscalCode;
  }
  return true;
}, {
  message: "Per le persone giuridiche è necessario specificare la ragione sociale e i dati del rappresentante legale",
  path: ["companyName"]
});

type ContractFormValues = z.infer<typeof contractSchema>;

interface QuoteContractDialogProps {
  quote: Quote | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (quoteId: string, contractData: ContractFormValues) => Promise<void>;
  isSubmitting: boolean;
}

const QuoteContractDialog = ({ 
  quote, 
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
      companyName: '',
      fiscalCode: '',
      birthDate: '',
      birthPlace: '',
      birthProvince: '',
      legalRepFirstName: '',
      legalRepLastName: '',
      legalRepFiscalCode: ''
    }
  });

  const contractorType = form.watch('contractorType');
  const isCompany = contractorType === 'personaGiuridica';

  const handleSubmit = async (data: ContractFormValues) => {
    if (quote) {
      await onSubmit(quote.id, data);
    }
  };

  if (!quote) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Converti Preventivo in Contratto</DialogTitle>
          <DialogDescription>
            Inserisci i dati del contraente per creare un nuovo contratto
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
            
            {isCompany && (
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
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name={isCompany ? "legalRepFirstName" : "firstName"}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{isCompany ? "Nome Rappresentante" : "Nome"}</FormLabel>
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
                    <FormLabel>{isCompany ? "Cognome Rappresentante" : "Cognome"}</FormLabel>
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
                  <FormLabel>{isCompany ? "Codice Fiscale Rappresentante" : "Codice Fiscale"}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Inserisci codice fiscale" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isCompany && (
              <>
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
                        <FormLabel>Provincia</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Provincia" maxLength={2} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}
            
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
