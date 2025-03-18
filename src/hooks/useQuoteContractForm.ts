
import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

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
  tradeinPlate: z.string().optional(), // Added new field for plate
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
export type ContractFormValues = z.infer<typeof contractFormSchema>;

// Helper to check if contractorType is personaFisica
export const isPersonaFisica = (contractorType: string | undefined): boolean => contractorType === 'personaFisica';

// Helper to check if contractorType is personaGiuridica
export const isPersonaGiuridica = (contractorType: string | undefined): boolean => contractorType === 'personaGiuridica';

export const useQuoteContractForm = () => {
  const [activeTab, setActiveTab] = useState('contractor');
  
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

  // Watch contractorType to know which fields should be validated
  const contractorType = methods.watch('contractorType');
  const hasReducedVAT = methods.watch('hasReducedVAT');
  const hasTradein = methods.watch('hasTradein');
  const warranty = methods.watch('garanzia');

  // Type-safe error access helper functions
  const getPersonaFisicaError = (fieldName: keyof typeof personaFisicaSchema.shape) => {
    if (isPersonaFisica(contractorType) && methods.formState.errors[fieldName]) {
      return methods.formState.errors[fieldName]?.message;
    }
    return undefined;
  };

  const getPersonaGiuridicaError = (fieldName: keyof typeof personaGiuridicaSchema.shape) => {
    if (isPersonaGiuridica(contractorType) && methods.formState.errors[fieldName]) {
      return methods.formState.errors[fieldName]?.message;
    }
    return undefined;
  };

  const getCommonError = (fieldName: keyof typeof commonFieldsSchema.shape) => {
    if (methods.formState.errors[fieldName]) {
      return methods.formState.errors[fieldName]?.message;
    }
    return undefined;
  };

  const getTermsError = (fieldName: keyof typeof termsSchema.shape) => {
    if (methods.formState.errors[fieldName]) {
      return methods.formState.errors[fieldName]?.message;
    }
    return undefined;
  };

  // Tab order
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

  return {
    methods,
    contractorType,
    hasReducedVAT,
    hasTradein,
    warranty,
    activeTab,
    setActiveTab,
    tabOrder,
    goToNextTab,
    goToPrevTab,
    errors: {
      getPersonaFisicaError,
      getPersonaGiuridicaError,
      getCommonError,
      getTermsError
    }
  };
};
