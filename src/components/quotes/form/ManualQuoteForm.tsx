
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { modelsApi, trimsApi, fuelTypesApi, colorsApi } from '@/api/supabase/settingsApi';
import { useAuth } from '@/context/AuthContext';
import { dealersApi } from '@/api/supabase/dealersApi';
import { v4 as uuidv4 } from 'uuid';
import QuoteCustomerInfo from './QuoteCustomerInfo';
import QuoteDiscountSection from './QuoteDiscountSection';
import QuoteTradeIn from './QuoteTradeIn';
import QuotePriceSummary from './QuotePriceSummary';
import QuoteFormActions from './QuoteFormActions';
import VehiclePriceDisplay from '@/components/vehicles/form/VehiclePriceDisplay';

// Form schema for manual quote creation
const manualQuoteSchema = z.object({
  model: z.string().min(1, { message: "Il modello è obbligatorio" }),
  trim: z.string().min(1, { message: "L'allestimento è obbligatorio" }),
  fuelType: z.string().min(1, { message: "Il tipo di carburante è obbligatorio" }),
  exteriorColor: z.string().min(1, { message: "Il colore è obbligatorio" }),
  
  // Customer fields
  customerName: z.string().min(1, { message: "Il nome del cliente è obbligatorio" }),
  customerEmail: z.string().email({ message: "Formato email non valido" }),
  customerPhone: z.string().min(1, { message: "Il numero di telefono è obbligatorio" }),
  dealerId: z.string().min(1, { message: "Il concessionario è obbligatorio" }),
  
  // Optional fields
  discount: z.number().default(0),
  reducedVAT: z.boolean().default(false),
  hasTradeIn: z.boolean().default(false),
  tradeInBrand: z.string().optional(),
  tradeInModel: z.string().optional(),
  tradeInYear: z.string().optional(),
  tradeInKm: z.number().optional(),
  tradeInValue: z.number().optional(),
  notes: z.string().optional(),
  roadPreparationFee: z.number().default(400),
});

type ManualQuoteFormValues = z.infer<typeof manualQuoteSchema>;

interface ManualQuoteFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const ManualQuoteForm = ({ onSubmit, onCancel, isSubmitting = false }: ManualQuoteFormProps) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'superAdmin';
  const [showTradeIn, setShowTradeIn] = useState(false);
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  
  // Fetch all required data
  const { data: models = [], isLoading: isLoadingModels } = useQuery({
    queryKey: ['models'],
    queryFn: modelsApi.getAll,
  });
  
  const { data: trims = [], isLoading: isLoadingTrims } = useQuery({
    queryKey: ['trims'],
    queryFn: trimsApi.getAll,
  });
  
  const { data: fuelTypes = [], isLoading: isLoadingFuelTypes } = useQuery({
    queryKey: ['fuelTypes'],
    queryFn: fuelTypesApi.getAll,
  });
  
  const { data: colors = [], isLoading: isLoadingColors } = useQuery({
    queryKey: ['colors'],
    queryFn: colorsApi.getAll,
  });
  
  // Get all dealers for admin users
  const { data: dealers = [] } = useQuery({
    queryKey: ['dealers'],
    queryFn: dealersApi.getAll,
    enabled: isAdmin, // Only fetch if user is admin
  });

  console.log('Loaded models:', models);
  console.log('Loaded trims:', trims);
  console.log('Loaded fuelTypes:', fuelTypes);
  console.log('Loaded colors:', colors);
  
  const form = useForm<ManualQuoteFormValues>({
    resolver: zodResolver(manualQuoteSchema),
    defaultValues: {
      model: '',
      trim: '',
      fuelType: '',
      exteriorColor: '',
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      dealerId: user?.dealerId || '',
      discount: 0,
      reducedVAT: false,
      hasTradeIn: false,
      tradeInBrand: '',
      tradeInModel: '',
      tradeInYear: '',
      tradeInKm: 0,
      tradeInValue: 0,
      notes: '',
      roadPreparationFee: 400,
    },
  });
  
  const watchDiscount = form.watch('discount');
  const watchHasTradeIn = form.watch('hasTradeIn');
  const watchTradeInValue = form.watch('tradeInValue');
  const watchModel = form.watch('model');
  const watchTrim = form.watch('trim');
  const watchFuelType = form.watch('fuelType');
  const watchExteriorColor = form.watch('exteriorColor');
  
  // Get model-compatible trims
  const filteredTrims = trims.filter(trim => {
    if (!watchModel) return true;
    return trim.compatibleModels.length === 0 || 
           trim.compatibleModels.includes(watchModel) || 
           trim.compatibleModels.includes(models.find(m => m.name === watchModel)?.id || '');
  });
  
  // Calculate final price
  const roadPreparationFee = 400;
  const basePrice = calculatedPrice;
  const discount = watchDiscount || 0;
  const tradeInValue = watchHasTradeIn ? watchTradeInValue || 0 : 0;
  const totalDiscount = discount + tradeInValue;
  const finalPrice = basePrice - totalDiscount + roadPreparationFee;
  
  // Calculate vehicle price based on selected options
  useEffect(() => {
    const calculatePrice = async () => {
      if (!watchModel || !watchTrim || !watchFuelType || !watchExteriorColor) {
        setCalculatedPrice(0);
        return;
      }
      
      try {
        const selectedModel = models.find(m => m.name === watchModel);
        const selectedTrim = trims.find(t => t.name === watchTrim);
        const selectedFuelType = fuelTypes.find(f => f.name === watchFuelType);
        
        // Parse color to extract name and type from format "Name (type)"
        const colorRegex = /(.+) \((.+)\)$/;
        const colorMatch = watchExteriorColor.match(colorRegex);
        const colorName = colorMatch ? colorMatch[1] : watchExteriorColor;
        const colorType = colorMatch ? colorMatch[2] : '';
        
        const selectedColor = colors.find(c => 
          c.name === colorName && c.type === colorType
        );
        
        if (selectedModel && selectedTrim && selectedFuelType && selectedColor) {
          // Calculate price based on base model price + adjustments
          const baseModelPrice = selectedModel.basePrice;
          const trimAdjustment = selectedTrim.basePrice;
          const fuelTypeAdjustment = selectedFuelType.priceAdjustment;
          const colorAdjustment = selectedColor.priceAdjustment;
          
          const total = baseModelPrice + trimAdjustment + fuelTypeAdjustment + colorAdjustment;
          setCalculatedPrice(total);
          console.log('Calculated price:', total, 'based on', { 
            baseModelPrice, 
            trimAdjustment, 
            fuelTypeAdjustment, 
            colorAdjustment 
          });
        }
      } catch (error) {
        console.error("Error calculating price:", error);
        setCalculatedPrice(0);
      }
    };
    
    calculatePrice();
  }, [watchModel, watchTrim, watchFuelType, watchExteriorColor, models, trims, fuelTypes, colors]);
  
  const handleFormSubmit = (data: ManualQuoteFormValues) => {
    // Create a proper UUID for manual quotes instead of a string
    const vehicleId = uuidv4();
    
    // Create vehicle data for this quote
    const manualVehicleData = {
      model: data.model,
      trim: data.trim,
      fuelType: data.fuelType,
      exteriorColor: data.exteriorColor,
      manualEntry: true, // Flag to identify manual vehicle entries
      price: calculatedPrice
    };
    
    // Calculate accessory total price and final price
    const submitData = {
      ...data,
      vehicleId: vehicleId, // Use proper UUID
      vehicleData: manualVehicleData,
      finalPrice: finalPrice,
      manualEntry: true,
      price: calculatedPrice
    };
    
    // Set trade-in info
    if (!submitData.hasTradeIn) {
      submitData.tradeInBrand = '';
      submitData.tradeInModel = '';
      submitData.tradeInYear = '';
      submitData.tradeInKm = 0;
      submitData.tradeInValue = 0;
    }
    
    console.log("Form submission data:", submitData);
    
    // Call parent onSubmit
    onSubmit(submitData);
  };

  // Loading state
  if (isLoadingModels || isLoadingTrims || isLoadingFuelTypes || isLoadingColors) {
    return <div className="text-center p-4">Caricamento configurazioni...</div>;
  }
  
  return (
    <div className="w-full text-sm">
      {/* Form */}
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Manual Vehicle Information */}
          <div className="p-4 bg-gray-50 rounded-md space-y-4">
            <h3 className="text-md font-semibold mb-2">Informazioni Veicolo</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modello</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona modello" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {models.map((model) => (
                          <SelectItem key={model.id} value={model.name}>
                            {model.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="trim"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Allestimento</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={!watchModel}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona allestimento" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredTrims.map((trim) => (
                          <SelectItem key={trim.id} value={trim.name}>
                            {trim.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="fuelType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Motore</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona motore" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {fuelTypes.map((fuelType) => (
                          <SelectItem key={fuelType.id} value={fuelType.name}>
                            {fuelType.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="exteriorColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Colore</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona colore" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {colors.map((color) => (
                          <SelectItem key={color.id} value={`${color.name} (${color.type})`}>
                            {color.name} ({color.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Display calculated price */}
            <VehiclePriceDisplay calculatedPrice={calculatedPrice} />
          </div>

          {/* Customer Information */}
          <QuoteCustomerInfo 
            isAdmin={isAdmin} 
            dealers={dealers} 
            userId={user?.id}
            dealerId={user?.dealerId}
          />

          {/* Discount and VAT Section */}
          <QuoteDiscountSection />

          {/* Trade-In Section */}
          <QuoteTradeIn showTradeIn={showTradeIn} setShowTradeIn={setShowTradeIn} />

          {/* Price Summary */}
          <QuotePriceSummary 
            basePrice={basePrice}
            accessoryTotalPrice={0}
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

export default ManualQuoteForm;
