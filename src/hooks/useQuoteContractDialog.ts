
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
        roadTaxAmount: contractData.roadTaxAmount || 400, // Default is 400 euros
        hasReducedVAT: contractData.hasReducedVAT || false,
        selectedAccessories: contractData.selectedAccessories || [],
        warrantyExtension: contractData.garanzia,
        warrantyAdditionalCost: contractData.garanzia === "84 Anni (addizionale € 1.000)" ? 1000 : 0
      };
      
      // Calculate VAT multiplier based on reduced VAT setting
      const vatMultiplier = priceDetails.hasReducedVAT ? 1.04 : 1.22;
      
      // Calculate final price with appropriate VAT
      // First convert to price without VAT, then apply the correct VAT rate
      const baseWithoutVAT = priceDetails.basePrice / 1.22;
      const discountWithoutVAT = priceDetails.discount / 1.22;
      const plateBonusWithoutVAT = priceDetails.plateBonus / 1.22;
      const tradeinBonusWithoutVAT = priceDetails.tradeinBonus / 1.22;
      const safetyKitWithoutVAT = priceDetails.safetyKitAmount / 1.22;
      const roadTaxWithoutVAT = priceDetails.roadTaxAmount / 1.22;
      const warrantyAdditionalCostWithoutVAT = priceDetails.warrantyAdditionalCost / 1.22;
      
      // Apply the correct VAT rate
      const baseWithVAT = baseWithoutVAT * vatMultiplier;
      const discountWithVAT = discountWithoutVAT * vatMultiplier;
      const plateBonusWithVAT = plateBonusWithoutVAT * vatMultiplier;
      const tradeinBonusWithVAT = tradeinBonusWithoutVAT * vatMultiplier;
      const safetyKitWithVAT = safetyKitWithoutVAT * vatMultiplier;
      const roadTaxWithVAT = roadTaxWithoutVAT * vatMultiplier;
      const warrantyAdditionalCostWithVAT = warrantyAdditionalCostWithoutVAT * vatMultiplier;
      
      // Trade-in value is not affected by VAT
      const tradeinValue = contractData.hasTradein ? (contractData.tradeinValue || 0) : 0;
      
      // Calculate final price
      const totalDiscounts = discountWithVAT + plateBonusWithVAT + tradeinBonusWithVAT + tradeinValue;
      const totalAdditions = safetyKitWithVAT + roadTaxWithVAT + warrantyAdditionalCostWithVAT;
      const finalPrice = baseWithVAT - totalDiscounts + totalAdditions;
      
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
        dealer_id: quote.dealerId,
        car_id: quote.vehicleId,
        contract_date: new Date().toISOString(),
        contract_details: {
          quoteId: quote.id,
          contractor: contractorData,
          priceDetails: priceDetails,
          finalPrice: finalPrice,
          contractTerms: {
            terminiPagamento: contractData.terminiPagamento,
            tempiConsegna: contractData.tempiConsegna,
            garanzia: contractData.garanzia,
            clausoleSpeciali: contractData.clausoleSpeciali || ''
          },
          selectedAccessories: contractData.selectedAccessories || []
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
