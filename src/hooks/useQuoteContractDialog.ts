
import { useState } from 'react';
import { Quote } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { quotesApi } from '@/api/supabase/quotesApi';
import { dealerContractsApi } from '@/api/supabase/dealerContractsApi';

export const useQuoteContractDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleConvertToContract = async (quote: Quote, contractData: any) => {
    console.log('Starting contract creation with data:', { quote, contractData });
    setIsSubmitting(true);
    
    try {
      // Extract price information from form data
      const priceDetails = {
        basePrice: quote.price || 0,
        discount: contractData.discountAmount || 0,
        plateBonus: contractData.plateBonus || 0,
        tradeinBonus: contractData.hasTradein ? (contractData.tradeinBonus || 0) : 0,
        safetyKitAmount: contractData.safetyKitAmount || 0,
        roadTaxAmount: contractData.roadTaxAmount || 350,
        hasReducedVAT: contractData.hasReducedVAT || false,
      };
      
      // Calculate final price
      const totalDiscounts = priceDetails.discount + priceDetails.plateBonus + priceDetails.tradeinBonus;
      const totalAdditions = priceDetails.safetyKitAmount + priceDetails.roadTaxAmount;
      const finalPrice = priceDetails.basePrice - totalDiscounts + totalAdditions;
      
      // Update quote status to converted
      const updatedQuote = await quotesApi.update(quote.id, { 
        status: 'converted' 
      });
      console.log('Quote updated:', updatedQuote);

      // Prepare contractor data based on type
      let contractorData: any = {};
      
      if (contractData.contractorType === 'personaFisica') {
        contractorData = {
          type: 'personaFisica',
          firstName: contractData.firstName,
          lastName: contractData.lastName,
          fiscalCode: contractData.fiscalCode,
          birthDate: contractData.birthDate,
          birthPlace: contractData.birthPlace,
          birthProvince: contractData.birthProvince,
          address: contractData.address,
          city: contractData.city,
          province: contractData.province,
          zipCode: contractData.zipCode,
          phone: contractData.phone,
          email: contractData.email
        };
      } else {
        contractorData = {
          type: 'personaGiuridica',
          companyName: contractData.companyName,
          vatNumber: contractData.vatNumber,
          address: contractData.address,
          city: contractData.city,
          province: contractData.province,
          zipCode: contractData.zipCode,
          phone: contractData.phone,
          email: contractData.email,
          legalRepresentative: {
            firstName: contractData.legalRepFirstName,
            lastName: contractData.legalRepLastName,
            fiscalCode: contractData.legalRepFiscalCode,
            birthDate: contractData.legalRepBirthDate,
            birthPlace: contractData.legalRepBirthPlace,
            birthProvince: contractData.legalRepBirthProvince
          }
        };
      }

      // Create contract from quote data
      const contract = await dealerContractsApi.create({
        dealerId: quote.dealerId,
        carId: quote.vehicleId,
        contractDate: new Date().toISOString(),
        contractDetails: {
          quoteId: quote.id,
          contractor: contractorData,
          priceDetails: priceDetails,
          finalPrice: finalPrice,
          contractTerms: {
            terminiPagamento: contractData.terminiPagamento,
            tempiConsegna: contractData.tempiConsegna,
            garanzia: contractData.garanzia,
            clausoleSpeciali: contractData.clausoleSpeciali || ''
          }
        },
        status: 'attivo'
      });
      
      console.log('Contract created:', contract);

      toast({
        title: "Successo",
        description: "Il preventivo è stato convertito in contratto con successo",
      });

      setIsOpen(false);
      return true;
    } catch (error) {
      console.error('Error converting quote to contract:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la conversione del preventivo",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isOpen,
    setIsOpen,
    isSubmitting,
    handleConvertToContract,
  };
};
