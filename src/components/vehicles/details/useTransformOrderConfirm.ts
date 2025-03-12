
import { useState } from 'react';

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
      await handleTransformToOrder();
      setShowTransformConfirm(false);
      onCloseDialog();
    } catch (error) {
      console.error('Transform to order failed:', error);
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
