import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { useForm, FormProvider } from 'react-hook-form';
import { Quote, Vehicle } from '@/types';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { formatCurrency } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface QuoteContractDialogProps {
  quote: Quote | null;
  vehicle: Vehicle | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (quoteId: string, contractData: any) => void;
  isSubmitting: boolean;
}

// Common fields schema
const commonFieldsSchema = z.object({
  address: z.string().min(1, "L'indirizzo è obbligatorio"),
  city: z.string().min(1, 'La città è obbligatoria'),
  province: z.string().min(1, 'La provincia è obbligatoria'),
  zipCode: z.string().min(1, 'Il CAP è obbligatorio'),
  phone: z.string().min(1, 'Il telefono è obbligatorio'),
  email: z.string().email('Email non valida'),
});

// Schema for persona fisica
const personaFisicaSchema = z.object({
  contractorType: z.literal('personaFisica'),
  firstName: z.string().min(1, 'Il nome è obbligatorio'),
  lastName: z.string().min(1, 'Il cognome è obbligatorio'),
  fiscalCode: z.string().min(16, 'Il codice fiscale deve essere di 16 caratteri').max(16),
  birthDate: z.string().min(1, 'La data di nascita è obbligatoria'),
  birthPlace: z.string().min(1, 'Il luogo di nascita è obbligatorio'),
  birthProvince: z.string().min(1, 'La provincia di nascita è obbligatoria'),
}).merge(commonFieldsSchema);

// Schema for persona giuridica
const personaGiuridicaSchema = z.object({
  contractorType: z.literal('personaGiuridica'),
  companyName: z.string().min(1, 'La ragione sociale è obbligatoria'),
  vatNumber: z.string().min(11, 'La partita IVA deve essere di 11 caratteri').max(11),
  legalRepFirstName: z.string().min(1, 'Il nome del rappresentante legale è obbligatorio'),
  legalRepLastName: z.string().min(1, 'Il cognome del rappresentante legale è obbligatorio'),
  legalRepFiscalCode: z.string().min(16, 'Il codice fiscale deve essere di 16 caratteri').max(16),
  legalRepBirthDate: z.string().min(1, 'La data di nascita è obbligatoria'),
  legalRepBirthPlace: z.string().min(1, 'Il luogo di nascita è obbligatorio'),
  legalRepBirthProvince: z.string().min(1, 'La provincia di nascita è obbligatoria'),
}).merge(commonFieldsSchema);

// Additional schemas for prices and terms
const priceSchema = z.object({
  hasReducedVAT: z.boolean().default(false),
  discountAmount: z.string().optional(),
  plateBonus: z.string().optional(),
  hasTradein: z.boolean().default(false),
  tradeinBrand: z.string().optional(),
  tradeinModel: z.string().optional(),
  tradeinYear: z.string().optional(),
  tradeinKm: z.string().optional(),
  tradeinValue: z.string().optional(),
  tradeinBonus: z.string().optional(),
  safetyKitAmount: z.string().optional(),
  roadTaxAmount: z.string().default('400'),
  depositoAmount: z.string().optional(),
  selectedAccessories: z.array(z.string()).default([]),
});

const termsSchema = z.object({
  tempiConsegna: z.string().min(1, 'I tempi di consegna sono obbligatori'),
  garanzia: z.string().min(1, 'La garanzia è obbligatoria'),
  clausoleSpeciali: z.string().optional(),
});

// Combine schemas with discriminated union
const contractFormSchema = z.discriminatedUnion('contractorType', [
  personaFisicaSchema,
  personaGiuridicaSchema
]).and(priceSchema).and(termsSchema);

// Form values type
type ContractFormValues = z.infer<typeof contractFormSchema>;

// Type guards to narrow down form error types
const isPersonaFisica = (contractorType: string): boolean => {
  return contractorType === 'personaFisica';
};

const isPersonaGiuridica = (contractorType: string): boolean => {
  return contractorType === 'personaGiuridica';
};

// Helper function to safely access errors based on contractor type
const getFieldError = (errors: any, fieldName: string, contractorType: string) => {
  // For common fields that exist in both types
  if (['address', 'city', 'province', 'zipCode', 'phone', 'email', 'tempiConsegna', 'garanzia'].includes(fieldName)) {
    return errors[fieldName]?.message;
  }
  
  // For persona fisica specific fields
  if (isPersonaFisica(contractorType) && 
      ['firstName', 'lastName', 'fiscalCode', 'birthDate', 'birthPlace', 'birthProvince'].includes(fieldName)) {
    return errors[fieldName]?.message;
  }
  
  // For persona giuridica specific fields
  if (isPersonaGiuridica(contractorType) && 
      ['companyName', 'vatNumber', 'legalRepFirstName', 'legalRepLastName', 
       'legalRepFiscalCode', 'legalRepBirthDate', 'legalRepBirthPlace', 'legalRepBirthProvince'].includes(fieldName)) {
    return errors[fieldName]?.message;
  }
  
  return undefined;
};

const QuoteContractDialog: React.FC<QuoteContractDialogProps> = ({
  quote,
  vehicle,
  open,
  onClose,
  onSubmit,
  isSubmitting
}) => {
  const [activeTab, setActiveTab] = useState('contractor');
  const [contractorType, setContractorType] = useState<'personaFisica' | 'personaGiuridica'>('personaFisica');
  const [hasReducedVAT, setHasReducedVAT] = useState(false);
  const [hasTradein, setHasTradein] = useState(false);
  const [warrantyExtension, setWarrantyExtension] = useState("24 Mesi");
  
  // Tab order reflecting the new desired flow
  const tabOrder = ['contractor', 'vehicle', 'terms', 'price'];
  
  // Function to navigate to next tab
  const goToNextTab = () => {
    const currentIndex = tabOrder.indexOf(activeTab);
    if (currentIndex < tabOrder.length - 1) {
      setActiveTab(tabOrder[currentIndex + 1]);
    }
  };
  
  // Function to navigate to previous tab
  const goToPrevTab = () => {
    const currentIndex = tabOrder.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabOrder[currentIndex - 1]);
    }
  };

  // Create form with zod resolver
  const methods = useForm<ContractFormValues>({
    resolver: zodResolver(contractFormSchema),
    defaultValues: {
      contractorType: 'personaFisica',
      hasReducedVAT: false,
      hasTradein: false,
      roadTaxAmount: '400',
      tempiConsegna: '30',
      garanzia: '24 Mesi',
      selectedAccessories: [],
    } as ContractFormValues
  });

  const { handleSubmit, setValue, watch, register, formState: { errors }, reset, trigger } = methods;

  // Watch necessary values
  const watchContractorType = watch('contractorType');
  const watchReducedVAT = watch('hasReducedVAT');
  const watchTradein = watch('hasTradein');
  const watchTradeInValue = watch('tradeinValue');
  const watchDiscount = watch('discountAmount');
  const watchPlateBonus = watch('plateBonus');
  const watchTradeInBonus = watch('tradeinBonus');
  const watchSafetyKit = watch('safetyKitAmount');
  const watchDepositoAmount = watch('depositoAmount');
  const watchSelectedAccessories = watch('selectedAccessories');
  const watchWarranty = watch('garanzia');

  // Sync form state with UI state
  useEffect(() => {
    setContractorType(watchContractorType);
  }, [watchContractorType]);

  useEffect(() => {
    setHasReducedVAT(watchReducedVAT);
  }, [watchReducedVAT]);

  useEffect(() => {
    setHasTradein(watchTradein);
  }, [watchTradein]);

  useEffect(() => {
    setWarrantyExtension(watchWarranty);
  }, [watchWarranty]);

  // Pre-fill form with quote data when available
  useEffect(() => {
    if (quote) {
      setValue('discountAmount', quote.discount?.toString() || '0');
      setValue('hasReducedVAT', quote.reducedVAT || false);
      
      if (quote.customerName) {
        const nameParts = quote.customerName.split(' ');
        if (nameParts.length > 1 && contractorType === 'personaFisica') {
          setValue('firstName', nameParts[0]);
          setValue('lastName', nameParts.slice(1).join(' '));
        } else if (contractorType === 'personaFisica') {
          setValue('firstName', quote.customerName);
        }
      }
      
      if (quote.customerEmail) {
        setValue('email', quote.customerEmail);
      }
      
      if (quote.customerPhone) {
        setValue('phone', quote.customerPhone);
      }
      
      // Handle trade-in if present
      if (quote.hasTradeIn) {
        setValue('hasTradein', true);
        setHasTradein(true);
        
        if (quote.tradeInBrand) setValue('tradeinBrand', quote.tradeInBrand);
        if (quote.tradeInModel) setValue('tradeinModel', quote.tradeInModel);
        if (quote.tradeInYear) setValue('tradeinYear', quote.tradeInYear);
        if (quote.tradeInKm) setValue('tradeinKm', quote.tradeInKm.toString());
        if (quote.tradeInValue) setValue('tradeinValue', quote.tradeInValue.toString());
        if (quote.tradeInBonus) setValue('tradeinBonus', quote.tradeInBonus.toString());
      }
      
      // Set license plate bonus if available
      if (quote.licensePlateBonus) {
        setValue('plateBonus', quote.licensePlateBonus.toString());
      }
      
      // Set safety kit amount if available
      if (quote.safetyKit) {
        setValue('safetyKitAmount', quote.safetyKit.toString());
      }
    }
  }, [quote, setValue, contractorType]);

  // Reset form when dialog is closed
  useEffect(() => {
    if (!open) {
      setActiveTab('contractor');
      reset();
    }
  }, [open, reset]);
  
  const onSubmitForm = (data: ContractFormValues) => {
    if (!quote) return;
    
    // Calculate warranty additional cost
    let warrantyAdditionalCost = 0;
    if (data.garanzia === "84 Anni (addizionale € 1.000)") {
      warrantyAdditionalCost = 1000;
    }
    
    // Submit form data with accessories and warranty cost
    const formDataWithAccessories = {
      ...data,
      selectedAccessories: watchSelectedAccessories,
      warrantyAdditionalCost
    };
    
    onSubmit(quote.id, formDataWithAccessories);
  };
  
  // Handle navigation button click - validate current tab before proceeding
  const handleNavigationClick = async () => {
    const isLastTab = activeTab === tabOrder[tabOrder.length - 1];
    
    if (isLastTab) {
      // If we're on the last tab, submit the form
      handleSubmit(onSubmitForm)();
    } else {
      // Otherwise, validate the current tab and move to the next if valid
      let fieldsToValidate: string[] = [];
      
      // Determine which fields to validate based on the current tab
      switch (activeTab) {
        case 'contractor':
          // Common fields
          fieldsToValidate = ['address', 'city', 'province', 'zipCode', 'phone', 'email'];
          
          // Type-specific fields
          if (contractorType === 'personaFisica') {
            fieldsToValidate.push('firstName', 'lastName', 'fiscalCode', 'birthDate', 'birthPlace', 'birthProvince');
          } else {
            fieldsToValidate.push('companyName', 'vatNumber', 'legalRepFirstName', 'legalRepLastName', 
              'legalRepFiscalCode', 'legalRepBirthDate', 'legalRepBirthPlace', 'legalRepBirthProvince');
          }
          break;
        
        case 'vehicle':
          // No required fields on the vehicle tab
          break;
        
        case 'terms':
          fieldsToValidate = ['tempiConsegna', 'garanzia'];
          break;
          
        default:
          break;
      }
      
      // Trigger validation for the specified fields
      const isValid = await trigger(fieldsToValidate as any);
      
      if (isValid) {
        goToNextTab();
      }
    }
  };

  // Calculate price with VAT adjustment
  const getVATAdjustedPrice = (price: number) => {
    if (!watchReducedVAT) return price; // No change for standard VAT
    
    // For reduced VAT, first remove standard VAT then apply 4% VAT
    const priceWithoutVAT = price / 1.22;
    return priceWithoutVAT * 1.04;
  };
  
  // Available accessories
  const availableAccessories = vehicle?.accessories || [];
  const selectedAccessoriesInQuote = quote?.accessories || [];
  
  // Base price from quote
  const basePrice = quote?.price || 0;
  const roadPreparationFee = 400;
  
  // Parse numeric inputs safely
  const parseNumeric = (value: string | undefined) => {
    if (!value) return 0;
    return parseFloat(value) || 0;
  };
  
  // Calculate price components with VAT adjustment
  const vatAdjustedBasePrice = getVATAdjustedPrice(basePrice);
  const vatAdjustedDiscount = getVATAdjustedPrice(parseNumeric(watchDiscount));
  const vatAdjustedPlateBonus = getVATAdjustedPrice(parseNumeric(watchPlateBonus));
  const vatAdjustedTradeInBonus = getVATAdjustedPrice(parseNumeric(watchTradeInBonus));
  const vatAdjustedSafetyKit = getVATAdjustedPrice(parseNumeric(watchSafetyKit));
  const vatAdjustedRoadPrep = getVATAdjustedPrice(roadPreparationFee);
  const depositoAmount = parseNumeric(watchDepositoAmount);
  
  // Calculate warranty cost with correct VAT
  let warrantyAdditionalCost = 0;
  if (watchWarranty === "84 Anni (addizionale € 1.000)") {
    warrantyAdditionalCost = getVATAdjustedPrice(1000);
  }
  
  // Trade-in value is not affected by VAT
  const tradeInValue = watchTradein ? parseNumeric(watchTradeInValue) : 0;
  
  // Calculate total discounts and additions
  const totalDiscounts = vatAdjustedDiscount + vatAdjustedPlateBonus + vatAdjustedTradeInBonus + tradeInValue + depositoAmount;
  const totalAdditions = vatAdjustedSafetyKit + vatAdjustedRoadPrep + warrantyAdditionalCost;
  
  // Calculate final price
  const finalPrice = vatAdjustedBasePrice - totalDiscounts + totalAdditions;
  
  if (!quote || !vehicle) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Crea Contratto</DialogTitle>
          <DialogDescription>
            Inserisci i dati per convertire il preventivo in contratto
          </DialogDescription>
        </DialogHeader>
        
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmitForm)} className="flex-1 overflow-hidden flex flex-col">
            <Tabs 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="flex-1 flex flex-col overflow-hidden"
            >
              <TabsList className="w-full">
                <TabsTrigger value="contractor" className="flex-1">Dati Contraente</TabsTrigger>
                <TabsTrigger value="vehicle" className="flex-1">Dati Veicolo</TabsTrigger>
                <TabsTrigger value="terms" className="flex-1">Condizioni Contrattuali</TabsTrigger>
                <TabsTrigger value="price" className="flex-1">Configurazione Prezzi</TabsTrigger>
              </TabsList>
              
              <div className="flex-1 overflow-auto">
                <ScrollArea className="h-[calc(100vh-18rem)]">
                  {/* Contractor Data Tab */}
                  <TabsContent value="contractor" className="pt-4 pb-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="personaFisica"
                            value="personaFisica"
                            {...register('contractorType')}
                            checked={contractorType === 'personaFisica'}
                            onChange={() => {
                              setContractorType('personaFisica');
                              setValue('contractorType', 'personaFisica');
                            }}
                          />
                          <Label htmlFor="personaFisica">Persona Fisica</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="personaGiuridica"
                            value="personaGiuridica"
                            {...register('contractorType')}
                            checked={contractorType === 'personaGiuridica'}
                            onChange={() => {
                              setContractorType('personaGiuridica');
                              setValue('contractorType', 'personaGiuridica');
                            }}
                          />
                          <Label htmlFor="personaGiuridica">Persona Giuridica</Label>
                        </div>
                      </div>
                      
                      {contractorType === 'personaFisica' ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="firstName">Nome</Label>
                              <Input id="firstName" {...register('firstName')} />
                              {getFieldError(errors, 'firstName', contractorType) && (
                                <p className="text-red-500 text-sm">{getFieldError(errors, 'firstName', contractorType)}</p>
                              )}
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="lastName">Cognome</Label>
                              <Input id="lastName" {...register('lastName')} />
                              {getFieldError(errors, 'lastName', contractorType) && (
                                <p className="text-red-500 text-sm">{getFieldError(errors, 'lastName', contractorType)}</p>
                              )}
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="fiscalCode">Codice Fiscale</Label>
                              <Input id="fiscalCode" {...register('fiscalCode')} />
                              {getFieldError(errors, 'fiscalCode', contractorType) && (
                                <p className="text-red-500 text-sm">{getFieldError(errors, 'fiscalCode', contractorType)}</p>
                              )}
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="birthDate">Data di Nascita</Label>
                              <Input id="birthDate" type="date" {...register('birthDate')} />
                              {getFieldError(errors, 'birthDate', contractorType) && (
                                <p className="text-red-500 text-sm">{getFieldError(errors, 'birthDate', contractorType)}</p>
                              )}
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="birthPlace">Luogo di Nascita</Label>
                              <Input id="birthPlace" {...register('birthPlace')} />
                              {getFieldError(errors, 'birthPlace', contractorType) && (
                                <p className="text-red-500 text-sm">{getFieldError(errors, 'birthPlace', contractorType)}</p>
                              )}
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="birthProvince">Provincia di Nascita</Label>
                              <Input id="birthProvince" {...register('birthProvince')} />
                              {getFieldError(errors, 'birthProvince', contractorType) && (
                                <p className="text-red-500 text-sm">{getFieldError(errors, 'birthProvince', contractorType)}</p>
                              )}
                            </div>
                          </div>
                          
                          <Separator />
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="address">Indirizzo</Label>
                              <Input id="address" {...register('address')} />
                              {getFieldError(errors, 'address', contractorType) && (
                                <p className="text-red-500 text-sm">{getFieldError(errors, 'address', contractorType)}</p>
                              )}
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="city">Città</Label>
                              <Input id="city" {...register('city')} />
                              {getFieldError(errors, 'city', contractorType) && (
                                <p className="text-red-500 text-sm">{getFieldError(errors, 'city', contractorType)}</p>
                              )}
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="province">Provincia</Label>
                              <Input id="province" {...register('province')} />
                              {getFieldError(errors, 'province', contractorType) && (
                                <p className="text-red-500 text-sm">{getFieldError(errors, 'province', contractorType)}</p>
                              )}
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="zipCode">CAP</Label>
                              <Input id="zipCode" {...register('zipCode')} />
                              {getFieldError(errors, 'zipCode', contractorType) && (
                                <p className="text-red-500 text-sm">{getFieldError(errors, 'zipCode', contractorType)}</p>
                              )}
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="phone">Telefono</Label>
                              <Input id="phone" {...register('phone')} />
                              {getFieldError(errors, 'phone', contractorType) && (
                                <p className="text-red-500 text-sm">{getFieldError(errors, 'phone', contractorType)}</p>
                              )}
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="email">Email</Label>
                              <Input id="email" type="email" {...register('email')} />
                              {getFieldError(errors, 'email', contractorType) && (
                                <p className="text-red-500 text-sm">{getFieldError(errors, 'email', contractorType)}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="companyName">Ragione Sociale</Label>
                              <Input id="companyName" {...register('companyName')} />
                              {getFieldError(errors, 'companyName', contractorType) && (
                                <p className="text-red-500 text-sm">{getFieldError(errors, 'companyName', contractorType)}</p>
                              )}
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="vatNumber">Partita IVA</Label>
                              <Input id="vatNumber" {...register('vatNumber')} />
                              {getFieldError(errors, 'vatNumber', contractorType) && (
                                <p className="text-red-500 text-sm">{getFieldError(errors, 'vatNumber', contractorType)}</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="address">Indirizzo</Label>
                              <Input id="address" {...register('address')} />
                              {getFieldError(errors, 'address', contractorType) && (
                                <p className="text-red-500 text-sm">{getFieldError(errors, 'address', contractorType)}</p>
                              )}
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="city">Città</Label>
                              <Input id="city" {...register('city')} />
                              {getFieldError(errors, 'city', contractorType) && (
                                <p className="text-red-500 text-sm">{getFieldError(errors, 'city', contractorType)}</p>
                              )}
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="province">Provincia</Label>
                              <Input id="province" {...register('province')} />
                              {getFieldError(errors, 'province', contractorType) && (
                                <p className="text-red-500 text-sm">{getFieldError(errors, 'province', contractorType)}</p>
                              )}
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="zipCode">CAP</Label>
                              <Input id="zipCode" {...register('zipCode')} />
                              {getFieldError(errors, 'zipCode', contractorType) && (
                                <p className="text-red-500 text-sm">{getFieldError(errors, 'zipCode', contractorType)}</p>
                              )}
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="phone">Telefono</Label>
                              <Input id="phone" {...register('phone')} />
                              {getFieldError(errors, 'phone', contractorType) && (
                                <p className="text-red-500 text-sm">{getFieldError(errors, 'phone', contractorType)}</p>
                              )}
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="email">Email</Label>
                              <Input id="email" type="email" {...register('email')} />
                              {getFieldError(errors, 'email', contractorType) && (
                                <p className="text-red-500 text-sm">{getFieldError(errors, 'email', contractorType)}</p>
                              )}
                            </div>
                          </div>
                          
                          <Separator className="my-4" />
                          
                          <h3 className="text-sm font-medium">Dati Rappresentante Legale</h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="legalRepFirstName">Nome</Label>
                              <Input id="legalRepFirstName" {...register('legalRepFirstName')} />
                              {getFieldError(errors, 'legalRepFirstName', contractorType) && (
                                <p className="text-red-500 text-sm">{getFieldError(errors, 'legalRepFirstName', contractorType)}</p>
                              )}
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="legalRepLastName">Cognome</Label>
                              <Input id="legalRepLastName" {...register('legalRepLastName')} />
                              {getFieldError(errors, 'legalRepLastName', contractorType) && (
                                <p className="text-red-500 text-sm">{getFieldError(errors, 'legalRepLastName', contractorType)}</p>
                              )}
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="legalRepFiscalCode">Codice Fiscale</Label>
                              <Input id="legalRepFiscalCode" {...register('legalRepFiscalCode')} />
                              {getFieldError(errors, 'legalRepFiscalCode', contractorType) && (
                                <p className="text-red-500 text-sm">{getFieldError(errors, 'legalRepFiscalCode', contractorType)}</p>
                              )}
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="legalRepBirthDate">Data di Nascita</Label>
                              <Input id="legalRepBirthDate" type="date" {...register('legalRepBirthDate')} />
                              {getFieldError(errors, 'legalRepBirthDate', contractorType) && (
                                <p className="text-red-500 text-sm">{getFieldError(errors, 'legalRepBirthDate', contractorType)}</p>
                              )}
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="legalRepBirthPlace">Luogo di Nascita</Label>
                              <Input id="legalRepBirthPlace" {...register('legalRepBirthPlace')} />
                              {getFieldError(errors, 'legalRepBirthPlace', contractorType) && (
                                <p className="text-red-500 text-sm">{getFieldError(errors, 'legalRepBirthPlace', contractorType)}</p>
                              )}
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="legalRepBirthProvince">Provincia di Nascita</Label>
                              <Input id="legalRepBirthProvince" {...register('legalRepBirthProvince')} />
                              {getFieldError(errors, 'legalRepBirthProvince', contractorType) && (
                                <p className="text-red-500 text-sm">{getFieldError(errors, 'legalRepBirthProvince', contractorType)}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  {/* Vehicle Data Tab */}
                  <TabsContent value="vehicle" className="pt-4 pb-6">
                    <div className="space-y-6">
                      <h3 className="text-lg font-medium">Dati del Veicolo</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Modello</Label>
                          <Input value={vehicle.model} readOnly className="bg-gray-50" />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Allestimento</Label>
                          <Input value={vehicle.trim || ''} readOnly className="bg-gray-50" />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Alimentazione</Label>
                          <Input value={vehicle.fuelType || ''} readOnly className="bg-gray-50" />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Colore</Label>
                          <Input value={vehicle.exteriorColor || ''} readOnly className="bg-gray-50" />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Cambio</Label>
                          <Input value={vehicle.transmission || ''} readOnly className="bg-gray-50" />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Telaio</Label>
                          <Input value={vehicle.telaio || ''} readOnly className="bg-gray-50" />
                        </div>
                      </div>
                      
                      <Separator className="my-2" />
                      
                      {/* Accessories Section */}
                      <div className="space-y-4">
                        <h3 className="text-md font-medium">Optional e Accessori</h3>
                        
                        {/* Show included accessories */}
                        {vehicle.accessories && vehicle.accessories.length > 0 ? (
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium">Accessori di Serie:</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {vehicle.accessories.map((accessory, idx) => (
                                <div key={idx} className="flex items-center">
                                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                  <span className="text-sm">{accessory}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">Nessun accessorio di serie installato.</p>
                        )}
                        
                        {/* Optional accessories selector */}
                        {availableAccessories.length > 0 && (
                          <div className="space-y-2 pt-2">
                            <h4 className="text-sm font-medium">Seleziona Accessori Aggiuntivi:</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 border rounded-md p-3 bg-gray-50">
                              {availableAccessories.map((accessory, idx) => (
                                <FormField
                                  key={idx}
                                  control={methods.control}
                                  name="selectedAccessories"
                                  render={({ field }) => (
                                    <FormItem className="flex space-x-3 space-y-0 items-center">
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(accessory)}
                                          onCheckedChange={(checked) => {
                                            const currentAccessories = [...field.value || []];
                                            if (checked) {
                                              setValue('selectedAccessories', [...currentAccessories, accessory]);
                                            } else {
                                              setValue('selectedAccessories', 
                                                currentAccessories.filter(item => item !== accessory)
                                              );
                                            }
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="text-sm font-normal cursor-pointer">
                                        {accessory}
                                      </FormLabel>
                                    </FormItem>
                                  )}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                  
                  {/* Contract Terms Tab */}
                  <TabsContent value="terms" className="pt-4 pb-6">
                    <div className="space-y-6">
                      <h3 className="text-lg font-medium">Condizioni Contrattuali</h3>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="tempiConsegna">Tempi di Consegna (giorni)</Label>
                          <Input
                            id="tempiConsegna"
                            type="number"
                            min="1"
                            defaultValue="30"
                            {...register('tempiConsegna')}
                          />
                          {getFieldError(errors, 'tempiConsegna', contractorType) && (
                            <p className="text-red-500 text-sm">{getFieldError(errors, 'tempiConsegna', contractorType)}</p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="garanzia">Garanzia</Label>
                          <Select
                            defaultValue="24 Mesi"
                            onValueChange={(value) => setValue('garanzia', value)}
                          >
                            <SelectTrigger id="garanzia">
                              <SelectValue placeholder="Seleziona la garanzia" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="24 Mesi">24 Mesi</SelectItem>
                              <SelectItem value="84 Anni (addizionale € 1.000)">84 Anni (addizionale € 1.000)</SelectItem>
                            </SelectContent>
                          </Select>
                          {getFieldError(errors, 'garanzia', contractorType) && (
                            <p className="text-red-500 text-sm">{getFieldError(errors, 'garanzia', contractorType)}</p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="clausoleSpeciali">Clausole Speciali</Label>
                          <Textarea
                            id="clausoleSpeciali"
                            placeholder="Inserire eventuali clausole speciali"
                            className="min-h-32"
                            {...register('clausoleSpeciali')}
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  {/* Price Configuration Tab */}
                  <TabsContent value="price" className="pt-4 pb-6">
                    <div className="space-y-6">
                      <h3 className="text-lg font-medium">Configurazione Prezzi</h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="hasReducedVAT"
                              checked={watchReducedVAT}
                              onCheckedChange={(checked) => {
                                setValue('hasReducedVAT', checked);
                              }}
                            />
                            <Label htmlFor="hasReducedVAT">IVA Agevolata 4%</Label>
                          </div>
                          <span className="text-sm text-gray-500">
                            {watchReducedVAT ? 'IVA al 4%' : 'IVA standard al 22%'}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="discountAmount">Sconto</Label>
                            <Input
                              id="discountAmount"
                              type="number"
                              min="0"
                              {...register('discountAmount')}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="plateBonus">Bonus Targa</Label>
                            <Input
                              id="plateBonus"
                              type="number"
                              min="0"
                              {...register('plateBonus')}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="safetyKitAmount">Kit Sicurezza</Label>
                            <Input
                              id="safetyKitAmount"
                              type="number"
                              min="0"
                              {...register('safetyKitAmount')}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="roadTaxAmount">Messa su Strada</Label>
                            <Input
                              id="roadTaxAmount"
                              type="number"
                              min="0"
                              value="400"
                              readOnly
                              className="bg-gray-50"
                              {...register('roadTaxAmount')}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="depositoAmount">Deposito Cauzionale</Label>
                            <Input
                              id="depositoAmount"
                              type="number"
                              min="0"
                              {...register('depositoAmount')}
                            />
                          </div>
                        </div>
                        
                        <Separator className="my-2" />
                        
                        {/* Trade-in Section */}
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="hasTradein"
                              checked={watchTradein}
                              onCheckedChange={(checked) => {
                                setValue('hasTradein', checked);
                                if (!checked) {
                                  setValue('tradeinValue', '0');
                                  setValue('tradeinBonus', '0');
                                }
                              }}
                            />
                            <Label htmlFor="hasTradein">Permuta</Label>
                          </div>
                          
                          {watchTradein && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6 border-l-2 border-gray-200">
                              <div className="space-y-2">
                                <Label htmlFor="tradeinBrand">Marca</Label>
                                <Input id="tradeinBrand" {...register('tradeinBrand')} />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="tradeinModel">Modello</Label>
                                <Input id="tradeinModel" {...register('tradeinModel')} />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="tradeinYear">Anno</Label>
                                <Input id="tradeinYear" {...register('tradeinYear')} />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="tradeinKm">Chilometraggio</Label>
                                <Input id="tradeinKm" type="number" min="0" {...register('tradeinKm')} />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="tradeinValue">Valore Permuta</Label>
                                <Input
                                  id="tradeinValue"
                                  type="number"
                                  min="0"
                                  {...register('tradeinValue')}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="tradeinBonus">Bonus Permuta</Label>
                                <Input
                                  id="tradeinBonus"
                                  type="number"
                                  min="0"
                                  {...register('tradeinBonus')}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <Separator className="my-2" />
                        
                        {/* Price Summary */}
                        <div className="space-y-3 p-4 bg-gray-50 rounded-md">
                          <h4 className="font-medium">Riepilogo Prezzi</h4>
                          
                          <div className="flex justify-between">
                            <span>Prezzo Veicolo:</span>
                            <span className="font-medium">{formatCurrency(vatAdjustedBasePrice)}</span>
                          </div>
                          
                          <div className="flex justify-between">
                            <span>Sconto:</span>
                            <span className="text-red-600">- {formatCurrency(vatAdjustedDiscount)}</span>
                          </div>
                          
                          <div className="flex justify-between">
                            <span>Bonus Targa:</span>
                            <span className="text-red-600">- {formatCurrency(vatAdjustedPlateBonus)}</span>
                          </div>
                          
                          <div className="flex justify-between">
                            <span>Premio Permuta:</span>
                            <span className="text-red-600">- {formatCurrency(vatAdjustedTradeInBonus)}</span>
                          </div>
                          
                          {watchTradein && (
                            <div className="flex justify-between">
                              <span>Valore Permuta:</span>
                              <span className="text-red-600">- {formatCurrency(tradeInValue)}</span>
                            </div>
                          )}
                          
                          {depositoAmount > 0 && (
                            <div className="flex justify-between">
                              <span>Deposito Cauzionale:</span>
                              <span className="text-red-600">- {formatCurrency(depositoAmount)}</span>
                            </div>
                          )}
                          
                          <div className="flex justify-between">
                            <span>Kit Sicurezza:</span>
                            <span className="text-green-600">+ {formatCurrency(vatAdjustedSafetyKit)}</span>
                          </div>
                          
                          <div className="flex justify-between">
                            <span>Messa su strada:</span>
                            <span className="text-green-600">+ {formatCurrency(vatAdjustedRoadPrep)}</span>
                          </div>
                          
                          {warrantyAdditionalCost > 0 && (
                            <div className="flex justify-between">
                              <span>Estensione Garanzia (84 mesi):</span>
                              <span className="text-green-600">+ {formatCurrency(warrantyAdditionalCost)}</span>
                            </div>
                          )}
                          
                          <Separator className="my-2" />
                          
                          <div className="flex justify-between font-bold">
                            <span>Prezzo Finale chiavi in mano (iva inclusa) a saldo:</span>
                            <span className="text-primary">{formatCurrency(finalPrice)}</span>
                          </div>
                          
                          {watchReducedVAT && (
                            <div className="text-sm text-gray-500 text-right">
                              IVA agevolata 4% inclusa
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </ScrollArea>
              </div>
            </Tabs>
            
            <DialogFooter className="pt-4 border-t">
              {activeTab !== tabOrder[0] && (
                <Button type="button" variant="outline" onClick={goToPrevTab}>
                  Indietro
                </Button>
              )}
              
              <Button 
                type="button" 
                onClick={handleNavigationClick} 
                disabled={isSubmitting}
              >
                {activeTab === tabOrder[tabOrder.length - 1] 
                  ? (isSubmitting ? 'Creazione...' : 'Crea Contratto') 
                  : 'Avanti'}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};

export default QuoteContractDialog;
