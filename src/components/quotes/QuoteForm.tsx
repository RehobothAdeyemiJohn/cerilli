
import React from 'react';
import { FormProvider } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Vehicle } from '@/types';
import { useQuoteForm } from './form/useQuoteForm';
import ManualQuoteForm from './form/ManualQuoteForm';

// Import our form section components
import QuoteVehicleInfo from './form/QuoteVehicleInfo';
import QuoteCustomerInfo from './form/QuoteCustomerInfo';
import QuoteDiscountSection from './form/QuoteDiscountSection';
import QuoteAccessories from './form/QuoteAccessories';
import QuoteTradeIn from './form/QuoteTradeIn';
import QuotePriceSummary from './form/QuotePriceSummary';
import QuoteFormActions from './form/QuoteFormActions';

interface QuoteFormProps {
  vehicle?: Vehicle;
  isManualQuote?: boolean;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const QuoteForm = ({ 
  vehicle, 
  isManualQuote = false, 
  onSubmit, 
  onCancel, 
  isSubmitting = false 
}: QuoteFormProps) => {
  
  // If it's a manual quote, use the ManualQuoteForm component
  if (isManualQuote) {
    return (
      <ManualQuoteForm
        onSubmit={onSubmit}
        onCancel={onCancel}
        isSubmitting={isSubmitting}
      />
    );
  }
  
  // For vehicle-based quotes, use the existing form
  const {
    form,
    showTradeIn,
    setShowTradeIn,
    compatibleAccessories,
    dealers,
    isAdmin,
    user,
    basePrice,
    accessoryTotalPrice,
    finalPrice,
    watchHasTradeIn,
    watchDiscount,
    watchTradeInValue,
    handleSubmit,
    totalDiscount,
    roadPreparationFee
  } = useQuoteForm(vehicle, onSubmit);

  // If no vehicle is provided, show a selection screen
  if (!vehicle) {
    return (
      <div className="text-center p-6">
        <h3 className="text-lg font-medium mb-4">Selezione Veicolo</h3>
        <p className="text-gray-500 mb-4">
          In questa sezione sarà possibile selezionare un veicolo per il preventivo.
          Questa funzionalità è in sviluppo.
        </p>
        <Button variant="outline" onClick={onCancel}>
          Torna Indietro
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full text-sm">
      {/* Vehicle Information */}
      <QuoteVehicleInfo vehicle={vehicle} />

      {/* Form */}
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
          {/* Customer Information */}
          <QuoteCustomerInfo 
            isAdmin={isAdmin} 
            dealers={dealers} 
            userId={user?.id}
            dealerId={user?.dealerId}
          />

          {/* Discount and VAT Section */}
          <QuoteDiscountSection />

          {/* Optional Accessories */}
          <QuoteAccessories 
            compatibleAccessories={compatibleAccessories} 
            vehicle={vehicle}
          />

          {/* Trade-In Section */}
          <QuoteTradeIn showTradeIn={showTradeIn} setShowTradeIn={setShowTradeIn} />

          {/* Price Summary */}
          <QuotePriceSummary 
            basePrice={basePrice}
            accessoryTotalPrice={accessoryTotalPrice}
            finalPrice={finalPrice}
            watchReducedVAT={form.watch('reducedVAT')}
            totalDiscount={totalDiscount}
            roadPreparationFee={roadPreparationFee}
          />

          {/* Form Actions */}
          <QuoteFormActions onCancel={onCancel} isSubmitting={isSubmitting} />
        </form>
      </FormProvider>
    </div>
  );
};

export default QuoteForm;
