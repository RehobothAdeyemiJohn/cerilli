
import React from 'react';
import { FormProvider } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Vehicle, Quote } from '@/types';
import { useQuoteForm } from './form/useQuoteForm';
import ManualQuoteForm from './form/ManualQuoteForm';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import QuoteDiscountSection from './form/QuoteDiscountSection';
import QuoteTradeIn from './form/QuoteTradeIn';

interface QuoteFormProps {
  vehicle?: Vehicle;
  isManualQuote?: boolean;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  editQuote?: Quote | null;
}

const QuoteForm = ({ 
  vehicle, 
  isManualQuote = false, 
  onSubmit, 
  onCancel, 
  isSubmitting = false,
  editQuote = null
}: QuoteFormProps) => {
  
  // 
  if (isManualQuote) {
    return (
      <ManualQuoteForm
        onSubmit={onSubmit}
        onCancel={onCancel}
        isSubmitting={isSubmitting}
        editQuote={editQuote}
      />
    );
  }
  // console.log(vehicle.id)
  // For vehicle-based quotes, use the existing form with proper checks
  const {
    form,
    showTradeIn,
    setShowTradeIn,
    vatAdjustedSafetyKit,
    compatibleAccessories,
    vehicleDetail,
    dealers,
    isAdmin,
    user,
    watchTradeInBonus,
    basePrice,
    accessoryTotalPrice,
    finalPrice,
    watchHasTradeIn,
    watchDiscount,
    watchTradeInValue,
    handleSubmit,
    totalDiscount,
    roadPreparationFee,
    watchLicensePlateBonus,
    watchReducedVAT,
    vatAdjustedHandlingFee
  } = useQuoteForm(vehicle, onSubmit, editQuote);

  // If no vehicle is provided, show a message
  if (!vehicle) {
    return (
      <div className="text-center p-6">
        <p className="text-gray-600 mb-4">
          Compila il modulo per creare un preventivo manuale senza un veicolo selezionato.
        </p>
      </div>
    );
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <p className="text-sm text-blue-600 mb-2">
          Compila il modulo per creare un preventivo manuale senza un veicolo selezionato.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Customer and Vehicle Information */}
          <div className="space-y-6">
            {/* Customer Information Section */}
            <div className="space-y-4">
              <h3 className="text-md font-semibold">Informazioni Cliente</h3>
              
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Cliente *</FormLabel>
                      <FormControl>
                        <Input placeholder="Inserisci nome cliente" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="customerEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input placeholder="cliente@esempio.com" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="customerPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefono *</FormLabel>
                        <FormControl>
                          <Input placeholder="+39 123 456 7890" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
            
            {/* Dealer Section */}
            <div className="space-y-4">
              <h3 className="text-md font-semibold">Dealer</h3>
              
              <FormField
                control={form.control}
                name="dealerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dealer</FormLabel>
                    <FormControl>
                      <select 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        value={field.value}
                        onChange={field.onChange}
                      >
                        {dealers.map(dealer => (
                          <option key={dealer.id} value={dealer.id}>
                            {dealer.companyName}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
            {/* Vehicle Information Section */}
            <div className="space-y-4">
              <h3 className="text-md font-semibold">Informazioni Veicolo</h3>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label>Modello</Label>
                  <Input 
                    value={vehicleDetail?.model} 
                    className="bg-gray-100"
                    readOnly
                  />
                </div>
                
                <div>
                  <Label>Allestimento</Label>
                  <Input 
                    value={vehicleDetail?.trim} 
                    className="bg-gray-100"
                    readOnly
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Colore</Label>
                    <Input 
                      value={vehicleDetail?.exteriorColor} 
                      className="bg-gray-100"
                      readOnly
                    />
                  </div>
                  
                  <div>
                    <Label>Motore</Label>
                    <Input 
                      value={vehicleDetail?.fuelType} 
                      className="bg-gray-100"
                      readOnly
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <Label>Prezzo di Listino Calcolato:</Label>
                <div className="text-xl font-bold"><span>€ {finalPrice}</span></div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Price Configuration */}
          <div className="space-y-6">
            <h3 className="text-md font-semibold">Configurazione Prezzo</h3>
            
            {/* Permuta Toggle */}
            <div className="flex items-center space-x-2">
              <FormField
                control={form.control}
                name="hasTradeIn"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">Permuta</FormLabel>
                  </FormItem>
                )}
              />
            </div>
            
            {/* IVA agevolata Toggle */}
            <div className="flex items-center space-x-2">
              <FormField
                control={form.control}
                name="reducedVAT"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">IVA agevolata (4% al posto di 22%)</FormLabel>
                  </FormItem>
                )}
              />
            </div>
            
            {/* Discount Section */}
            <QuoteDiscountSection />
            
            {/* Trade-In Section - Only if hasTradeIn is true */}
            {watchHasTradeIn && <QuoteTradeIn showTradeIn={showTradeIn} setShowTradeIn={setShowTradeIn} />}
            
            {/* Price Summary */}
            <div className="mt-6 bg-gray-50 p-4 rounded-md">
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Prezzo Veicolo:</span>
                  <span>€ {basePrice}</span>
                </div>
                
                {accessoryTotalPrice > 0 && (
                  <div className="flex justify-between">
                    <span>Accessori:</span>
                    <span>€ {accessoryTotalPrice}</span>
                  </div>
                )}
                
                
                {watchDiscount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Sconto:</span>
                    <span>- € {watchDiscount}</span>
                  </div>
                )}
                {watchLicensePlateBonus > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Premio Targa:</span>
                    <span>- € {watchLicensePlateBonus}</span>
                  </div>
                )}
                
                {watchHasTradeIn && watchTradeInValue > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Valore Permuta:</span>
                    <span>- € {watchTradeInValue}</span>
                  </div>
                )}
                {watchTradeInBonus && watchTradeInBonus > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Premio Permuta :</span>
                    <span>- € {watchTradeInBonus}</span>
                  </div>
                )}
                {vatAdjustedSafetyKit> 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Kit Sicurezza:</span>
                    <span>+ € {vatAdjustedSafetyKit}</span>
                  </div>
                )}

                {vatAdjustedHandlingFee> 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Gestione Usato:</span>
                    <span>+ € {    vatAdjustedHandlingFee }</span>
                  </div>
                )}
                
                <div className="flex justify-between font-bold border-t border-gray-300 pt-2 mt-2">
                  <span>Prezzo Finale:</span>
                  <span>€ {finalPrice}</span>
                </div>
                <div className="text-xs text-gray-500 text-right">
                  {watchReducedVAT ? 'IVA 4% inclusa' : 'IVA 22% inclusa'}
                </div>
              </div>
            </div>
            
            {/* Submit Button */}
            <div className="mt-auto pt-4">
              <Button 
                type="submit" 
                className="w-full bg-blue-700 hover:bg-blue-800 text-white py-3"
                disabled={isSubmitting}
              >
                Prezzo Totale / Chiudi in mano
                <span className="block text-lg font-bold">€ {finalPrice}</span>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Form Actions */}
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Annulla
          </Button>
          <Button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
            Crea Preventivo
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

export default QuoteForm;
