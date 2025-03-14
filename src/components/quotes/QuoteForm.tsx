
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
      {/* Form */}
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Column - Customer and Vehicle Information */}
            <div className="space-y-4">
              {/* Customer Information - Gray background */}
              <QuoteCustomerInfo 
                isAdmin={isAdmin} 
                dealers={dealers} 
                userId={user?.id}
                dealerId={user?.dealerId}
              />
              
              {/* Vehicle Information - Gray background */}
              <QuoteVehicleInfo 
                vehicle={vehicle} 
                compatibleAccessories={compatibleAccessories}
              />
            </div>
            
            {/* Right Column - Price Configuration */}
            <div className="space-y-4">
              {/* Price Configuration Section */}
              <div className="space-y-4">
                <h3 className="text-md font-semibold">Configurazione Prezzo</h3>
                
                {/* Discount and VAT Section */}
                <QuoteDiscountSection />
                
                {/* Trade-In Section - Only if hasTradeIn is true */}
                {watchHasTradeIn && (
                  <QuoteTradeIn showTradeIn={showTradeIn} setShowTradeIn={setShowTradeIn} />
                )}
                
                {/* Price Summary */}
                <div className="mt-4">
                  <QuotePriceSummary 
                    basePrice={basePrice}
                    accessoryTotalPrice={accessoryTotalPrice}
                    finalPrice={finalPrice}
                    watchReducedVAT={form.watch('reducedVAT')}
                    totalDiscount={totalDiscount}
                    roadPreparationFee={roadPreparationFee}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <QuoteFormActions onCancel={onCancel} isSubmitting={isSubmitting} />
        </form>
      </FormProvider>
    </div>
  );
};

export default QuoteForm;
