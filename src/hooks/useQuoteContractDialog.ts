
import { useState } from 'react';
import { Quote } from '@/types';
import { useToast } from '@/hooks/use-toast';

export const useQuoteContractDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleConvertToContract = async (quote: Quote, contractData: any) => {
    setIsSubmitting(true);
    try {
      // Update quote status to converted
      const updatedQuote = await quotesApi.update(quote.id, { 
        status: 'converted' 
      });

      // Create contract from quote data
      await dealerContractsApi.create({
        dealerId: quote.dealerId,
        carId: quote.vehicleId,
        contractDate: new Date().toISOString(),
        contractDetails: {
          ...contractData,
          quoteId: quote.id,
          price: quote.price,
          discount: quote.discount,
          finalPrice: quote.finalPrice
        },
        status: 'attivo'
      });

      toast({
        title: "Successo",
        description: "Il preventivo è stato convertito in contratto con successo",
      });

      setIsOpen(false);
    } catch (error) {
      console.error('Error converting quote to contract:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la conversione del preventivo",
        variant: "destructive",
      });
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
