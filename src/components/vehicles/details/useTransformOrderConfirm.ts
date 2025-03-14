
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

export const useTransformOrderConfirm = (
  handleTransformToOrder: () => Promise<void>,
  onCloseDialog: () => void
) => {
  const [isTransforming, setIsTransforming] = useState(false);
  const [showTransformConfirm, setShowTransformConfirm] = useState(false);
  
  const handleTransformToOrderClick = () => {
    setShowTransformConfirm(true);
  };
  
  const handleConfirmTransform = async () => {
    if (isTransforming) return; // Prevent multiple clicks
    
    setIsTransforming(true);
    try {
      console.log("Starting transformation process...");
      await handleTransformToOrder();
      console.log("Transformation completed successfully");
      
      toast({
        title: "Ordine Creato",
        description: "Il veicolo è stato trasformato in ordine con successo.",
      });
      
      setShowTransformConfirm(false);
      onCloseDialog();
    } catch (error) {
      console.error('Transform to order failed:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la trasformazione in ordine",
        variant: "destructive",
      });
      // Don't close the main dialog if there's an error, but close the confirm dialog
      setShowTransformConfirm(false);
    } finally {
      setIsTransforming(false);
    }
  };
  
  return {
    isTransforming,
    showTransformConfirm,
    setShowTransformConfirm,
    handleTransformToOrderClick,
    handleConfirmTransform
  };
};
