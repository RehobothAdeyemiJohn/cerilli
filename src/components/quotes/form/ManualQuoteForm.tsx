
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
import { modelsApi, trimsApi, fuelTypesApi, colorsApi, accessoriesApi } from '@/api/supabase/settingsApi';
import { useAuth } from '@/context/AuthContext';
import { dealersApi } from '@/api/supabase/dealersApi';
import { v4 as uuidv4 } from 'uuid';
import QuoteCustomerInfo from './QuoteCustomerInfo';
import QuoteDiscountSection from './QuoteDiscountSection';
import QuoteTradeIn from './QuoteTradeIn';
import QuotePriceSummary from './QuotePriceSummary';
import QuoteFormActions from './QuoteFormActions';
import VehiclePriceDisplay from '@/components/vehicles/form/VehiclePriceDisplay';

const manualQuoteSchema = z.object({
  model: z.string().min(1, { message: "Il modello è obbligatorio" }),
  trim: z.string().min(1, { message: "L'allestimento è obbligatorio" }),
  fuelType: z.string().min(1, { message: "Il tipo di carburante è obbligatorio" }),
  exteriorColor: z.string().min(1, { message: "Il colore è obbligatorio" }),
  
  customerName: z.string().min(1, { message: "Il nome del cliente è obbligatorio" }),
  customerEmail: z.string().email({ message: "Formato email non valido" }),
  customerPhone: z.string().min(1, { message: "Il numero di telefono è obbligatorio" }),
  dealerId: z.string().min(1, { message: "Il concessionario è obbligatorio" }),
  
  discount: z.number().default(0),
  licensePlateBonus: z.number().default(0),
  tradeInBonus: z.number().default(0),
  safetyKit: z.number().default(0),
  reducedVAT: z.boolean().default(false),
  hasTradeIn: z.boolean().default(false),
  tradeInBrand: z.string().optional(),
  tradeInModel: z.string().optional(),
  tradeInYear: z.string().optional(),
  tradeInKm: z.number().optional(),
  tradeInValue: z.number().optional(),
  tradeInHandlingFee: z.number().default(0),
  notes: z.string().optional(),
  roadPreparationFee: z.number().default(400),
  accessories: z.array(z.string()).default([]),
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
  const [compatibleAccessories, setCompatibleAccessories] = useState<any[]>([]);
  
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
  
  const { data: allAccessories = [], isLoading: isLoadingAccessories } = useQuery({
    queryKey: ['accessories'],
    queryFn: accessoriesApi.getAll,
  });
  
  const { data: dealers = [] } = useQuery({
    queryKey: ['dealers'],
    queryFn: dealersApi.getAll,
    enabled: isAdmin,
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
      licensePlateBonus: 0,
      tradeInBonus: 0,
      safetyKit: 0,
      reducedVAT: false,
      hasTradeIn: false,
      tradeInBrand: '',
      tradeInModel: '',
      tradeInYear: '',
      tradeInKm: 0,
      tradeInValue: 0,
      tradeInHandlingFee: 0,
      notes: '',
      roadPreparationFee: 400,
      accessories: [],
    },
  });
  
  const watchDiscount = form.watch('discount');
  const watchHasTradeIn = form.watch('hasTradeIn');
  const watchTradeInValue = form.watch('tradeInValue');
  const watchModel = form.watch('model');
  const watchTrim = form.watch('trim');
  const watchFuelType = form.watch('fuelType');
  const watchExteriorColor = form.watch('exteriorColor');
  const watchLicensePlateBonus = form.watch('licensePlateBonus');
  const watchTradeInBonus = form.watch('tradeInBonus');
  const watchSafetyKit = form.watch('safetyKit');
  const watchReducedVAT = form.watch('reducedVAT');
  const watchTradeInHandlingFee = form.watch('tradeInHandlingFee');
  const watchAccessories = form.watch('accessories');
  
  const filteredTrims = trims.filter(trim => {
    if (!watchModel) return true;
    return trim.compatibleModels.length === 0 || 
           trim.compatibleModels.includes(watchModel) || 
           trim.compatibleModels.includes(models.find(m => m.name === watchModel)?.id || '');
  });
  
  // Update compatible accessories when model or trim changes
  useEffect(() => {
    if (watchModel && watchTrim) {
      const modelObj = models.find(m => m.name === watchModel);
      const trimObj = trims.find(t => t.name === watchTrim);
      
      if (modelObj && trimObj) {
        const modelId = modelObj.id;
        const trimId = trimObj.id;
        
        const compatible = allAccessories.filter(acc => {
          const isCompatibleWithModel = acc.compatibleModels.length === 0 || 
                                       acc.compatibleModels.includes(modelId) ||
                                       acc.compatibleModels.includes(modelObj.name);
                                       
          const isCompatibleWithTrim = acc.compatibleTrims.length === 0 || 
                                      acc.compatibleTrims.includes(trimId) ||
                                      acc.compatibleTrims.includes(trimObj.name);
                                      
          return isCompatibleWithModel && isCompatibleWithTrim;
        });
        
        setCompatibleAccessories(compatible);
      }
    } else {
      setCompatibleAccessories([]);
    }
  }, [watchModel, watchTrim, models, trims, allAccessories]);
  
  const roadPreparationFee = 400;
  const basePrice = calculatedPrice;
  const discount = watchDiscount || 0;
  const tradeInValue = watchHasTradeIn ? watchTradeInValue || 0 : 0;
  const totalDiscount = discount + tradeInValue;
  
  // Calculate price when model, trim, fuel type, color, or accessories change
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
        
        const colorRegex = /(.+) \((.+)\)$/;
        const colorMatch = watchExteriorColor.match(colorRegex);
        const colorName = colorMatch ? colorMatch[1] : watchExteriorColor;
        const colorType = colorMatch ? colorMatch[2] : '';
        
        const selectedColor = colors.find(c => 
          c.name === colorName && c.type === colorType
        );
        
        if (selectedModel && selectedTrim && selectedFuelType && selectedColor) {
          const baseModelPrice = selectedModel.basePrice;
          const trimAdjustment = selectedTrim.basePrice;
          const fuelTypeAdjustment = selectedFuelType.priceAdjustment;
          const colorAdjustment = selectedColor.priceAdjustment;
          
          // Calculate accessories price
          const selectedAccessories = watchAccessories || [];
          const accessoriesPrice = selectedAccessories.reduce((total, accName) => {
            const acc = allAccessories.find(a => a.name === accName);
            return total + (acc ? acc.price : 0);
          }, 0);
          
          const total = baseModelPrice + trimAdjustment + fuelTypeAdjustment + colorAdjustment + accessoriesPrice;
          setCalculatedPrice(total);
          console.log('Calculated price:', total, 'based on', { 
            baseModelPrice, 
            trimAdjustment, 
            fuelTypeAdjustment, 
            colorAdjustment,
            accessoriesPrice
          });
        }
      } catch (error) {
        console.error("Error calculating price:", error);
        setCalculatedPrice(0);
      }
    };
    
    calculatePrice();
  }, [watchModel, watchTrim, watchFuelType, watchExteriorColor, watchAccessories, models, trims, fuelTypes, colors, allAccessories]);
  
  const finalPrice = calculateFinalPrice();
  
  function calculateFinalPrice() {
    const discount = watchDiscount || 0;
    const licensePlateBonus = watchLicensePlateBonus || 0;
    const tradeInBonus = watchTradeInBonus || 0;
    const safetyKit = watchSafetyKit || 0;
    const tradeInValue = watchHasTradeIn ? (watchTradeInValue || 0) : 0;
    const tradeInHandlingFee = watchHasTradeIn ? (watchTradeInHandlingFee || 0) : 0;
    const reducedVAT = watchReducedVAT || false;

    let priceWithCorrectVAT = calculatedPrice;
    if (reducedVAT) {
      const priceWithoutVAT = calculatedPrice / 1.22;
      priceWithCorrectVAT = priceWithoutVAT * 1.04;
    }

    let calculatedFinalPrice = priceWithCorrectVAT;
    
    calculatedFinalPrice -= discount;
    calculatedFinalPrice -= licensePlateBonus;
    calculatedFinalPrice -= tradeInBonus;
    
    calculatedFinalPrice += safetyKit;
    calculatedFinalPrice += roadPreparationFee;
    calculatedFinalPrice += tradeInHandlingFee;
    
    calculatedFinalPrice -= tradeInValue;

    return Math.round(calculatedFinalPrice * 100) / 100;
  }
  
  const handleFormSubmit = (data: ManualQuoteFormValues) => {
    const vehicleId = uuidv4();
    
    const manualVehicleData = {
      model: data.model,
      trim: data.trim,
      fuelType: data.fuelType,
      exteriorColor: data.exteriorColor,
      manualEntry: true,
      price: calculatedPrice,
      accessories: data.accessories || []
    };
    
    const submitData = {
      ...data,
      vehicleId: vehicleId,
      vehicleData: manualVehicleData,
      finalPrice: finalPrice,
      manualEntry: true,
      price: calculatedPrice
    };
    
    if (!submitData.hasTradeIn) {
      submitData.tradeInBrand = '';
      submitData.tradeInModel = '';
      submitData.tradeInYear = '';
      submitData.tradeInKm = 0;
      submitData.tradeInValue = 0;
    }
    
    console.log("Form submission data:", submitData);
    
    onSubmit(submitData);
  };

  if (isLoadingModels || isLoadingTrims || isLoadingFuelTypes || isLoadingColors || isLoadingAccessories) {
    return <div className="text-center p-4">Caricamento configurazioni...</div>;
  }
  
  return (
    <div className="w-full text-sm">
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Column - Vehicle and Customer Information */}
            <div className="space-y-4">
              {/* Customer Information */}
              <QuoteCustomerInfo 
                isAdmin={isAdmin} 
                dealers={dealers} 
                userId={user?.id}
                dealerId={user?.dealerId}
              />

              {/* Vehicle Information */}
              <div className="bg-gray-100 p-4 rounded-md">
                <h3 className="text-md font-semibold mb-4">Informazioni Veicolo</h3>
                
                <div className="grid grid-cols-1 gap-4">
                  {/* Model and Trim on the same row */}
                  <div className="grid grid-cols-2 gap-3">
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
                  </div>
                  
                  {/* Fuel Type and Color on the same row */}
                  <div className="grid grid-cols-2 gap-3">
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
                  
                  {/* Accessories Section */}
                  {compatibleAccessories.length > 0 && (
                    <div className="pt-2">
                      <FormField
                        control={form.control}
                        name="accessories"
                        render={() => (
                          <FormItem>
                            <div className="mb-2">
                              <FormLabel>Optional Disponibili</FormLabel>
                            </div>
                            <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto border rounded p-2">
                              {compatibleAccessories.map((accessory) => (
                                <FormField
                                  key={accessory.id}
                                  control={form.control}
                                  name="accessories"
                                  render={({ field }) => {
                                    return (
                                      <FormItem
                                        key={accessory.id}
                                        className="flex flex-row items-start space-x-3 space-y-0 bg-white p-2 rounded"
                                      >
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes(accessory.name)}
                                            onCheckedChange={(checked) => {
                                              return checked
                                                ? field.onChange([...field.value, accessory.name])
                                                : field.onChange(
                                                    field.value?.filter(
                                                      (value) => value !== accessory.name
                                                    )
                                                  )
                                            }}
                                          />
                                        </FormControl>
                                        <div className="flex justify-between items-center w-full">
                                          <FormLabel className="font-normal cursor-pointer">
                                            {accessory.name}
                                          </FormLabel>
                                          <span className="text-sm">€{accessory.price.toLocaleString('it-IT')}</span>
                                        </div>
                                      </FormItem>
                                    )
                                  }}
                                />
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>
                
                <VehiclePriceDisplay calculatedPrice={calculatedPrice} />
              </div>
            </div>
            
            {/* Right Column - Price Configuration */}
            <div className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-md font-semibold">Configurazione Prezzo</h3>
                
                {/* Discount Section */}
                <QuoteDiscountSection />
                
                {/* Trade-In Section */}
                {watchHasTradeIn && <QuoteTradeIn showTradeIn={showTradeIn} setShowTradeIn={setShowTradeIn} />}
                
                {/* Price Summary */}
                <div className="mt-4">
                  <QuotePriceSummary 
                    basePrice={basePrice}
                    accessoryTotalPrice={0}
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

export default ManualQuoteForm;
