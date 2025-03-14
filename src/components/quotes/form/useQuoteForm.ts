
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Vehicle, Accessory } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { modelsApi, accessoriesApi } from '@/api/localStorage';
import { useAuth } from '@/context/AuthContext';
import { dealersApi } from '@/api/supabase/dealersApi';

// Quote form schema
const quoteFormSchema = z.object({
  customerName: z.string().min(1, { message: "Il nome del cliente è obbligatorio." }),
  customerEmail: z.string().email({ message: "Email non valida." }).optional().or(z.literal('')),
  customerPhone: z.string().min(1, { message: "Il numero di telefono è obbligatorio." }),
  dealerId: z.string().min(1, { message: "Il concessionario è obbligatorio." }),
  notes: z.string().optional().or(z.literal('')),
  discount: z.number().default(0),
  licensePlateBonus: z.number().default(0), // New field for Premio Targa
  tradeInBonus: z.number().default(0), // New field for Premio Permuta
  safetyKit: z.number().default(0), // New field for Kit Sicurezza
  reducedVAT: z.boolean().default(false),
  hasTradeIn: z.boolean().default(false),
  tradeInBrand: z.string().optional(),
  tradeInModel: z.string().optional(),
  tradeInYear: z.string().optional(),
  tradeInKm: z.number().optional(),
  tradeInValue: z.number().optional(),
  tradeInHandlingFee: z.number().default(0), // New field for Gestione Usato
  accessories: z.array(z.string()).default([])
});

export const useQuoteForm = (vehicle?: Vehicle, onSubmit?: (data: any) => void) => {
  const [showTradeIn, setShowTradeIn] = useState(false);
  const [compatibleAccessories, setCompatibleAccessories] = useState<Accessory[]>([]);
  const [accessoryTotalPrice, setAccessoryTotalPrice] = useState(0);
  const [basePrice, setBasePrice] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);
  const [totalDiscount, setTotalDiscount] = useState(0);
  const { user } = useAuth();
  const roadPreparationFee = 400; // Default road preparation fee

  // Form initialization
  const form = useForm({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: {
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      dealerId: user?.dealerId || '',
      notes: '',
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
      accessories: []
    }
  });

  // Get dealers for select field
  const { data: dealers = [] } = useQuery({
    queryKey: ['dealers'],
    queryFn: dealersApi.getAll
  });

  // Get user role from auth context
  const isAdmin = user?.role === 'admin' || user?.role === 'superAdmin';

  // Watch form values for calculations
  const watchHasTradeIn = form.watch('hasTradeIn');
  const watchDiscount = form.watch('discount');
  const watchLicensePlateBonus = form.watch('licensePlateBonus');
  const watchTradeInBonus = form.watch('tradeInBonus');
  const watchSafetyKit = form.watch('safetyKit');
  const watchTradeInValue = form.watch('tradeInValue');
  const watchTradeInHandlingFee = form.watch('tradeInHandlingFee');
  const watchReducedVAT = form.watch('reducedVAT');
  const watchAccessories = form.watch('accessories');

  // Set trade-in visibility when hasTradeIn changes
  useEffect(() => {
    setShowTradeIn(watchHasTradeIn);
  }, [watchHasTradeIn]);

  // Set base price from vehicle
  useEffect(() => {
    if (vehicle) {
      setBasePrice(vehicle.price);
    }
  }, [vehicle]);

  // Get compatible accessories for vehicle
  useEffect(() => {
    if (vehicle) {
      const fetchAccessories = async () => {
        try {
          // Find model
          const allModels = await modelsApi.getAll();
          const modelObj = allModels.find(m => m.name === vehicle.model);
          
          // Find trim
          if (modelObj && modelObj.id) {
            const modelId = modelObj.id;
            // Use empty string for trim as we want all compatible accessories
            const compatibles = await accessoriesApi.getCompatible(modelId, '');
            setCompatibleAccessories(compatibles);
          }
        } catch (error) {
          console.error('Error loading accessories:', error);
        }
      };
      
      fetchAccessories();
    }
  }, [vehicle]);

  // Calculate accessory total price
  useEffect(() => {
    if (watchAccessories.length > 0 && compatibleAccessories.length > 0) {
      const total = watchAccessories.reduce((sum, accessoryName) => {
        const accessory = compatibleAccessories.find(a => a.name === accessoryName);
        if (accessory) {
          // Use price with VAT for display
          return sum + accessory.priceWithVAT;
        }
        return sum;
      }, 0);
      
      setAccessoryTotalPrice(total);
    } else {
      setAccessoryTotalPrice(0);
    }
  }, [watchAccessories, compatibleAccessories]);

  // Calculate total discount
  useEffect(() => {
    setTotalDiscount(watchDiscount || 0);
  }, [watchDiscount]);

  // Calculate final price based on all components
  useEffect(() => {
    // Base calculation without VAT
    const subTotal = basePrice + accessoryTotalPrice - (watchDiscount || 0) + 
                    (watchLicensePlateBonus || 0) + (watchTradeInBonus || 0) + 
                    (watchSafetyKit || 0) + roadPreparationFee;
    
    // Calculate VAT amount (trade-in value is exempt from VAT)
    const vatRate = watchReducedVAT ? 0.04 : 0.22;
    
    // Calculate final price with trade-in adjustments and VAT
    let final = subTotal;
    
    // Apply VAT to all components except trade-in value
    final += (subTotal + (watchTradeInHandlingFee || 0)) * vatRate;
    
    // Apply trade-in value and handling fee
    if (watchHasTradeIn) {
      final -= (watchTradeInValue || 0);
      final += (watchTradeInHandlingFee || 0);
    }
    
    setFinalPrice(Math.round(final * 100) / 100);
  }, [
    basePrice, 
    accessoryTotalPrice, 
    watchDiscount, 
    watchReducedVAT, 
    watchHasTradeIn, 
    watchTradeInValue,
    watchLicensePlateBonus,
    watchTradeInBonus,
    watchSafetyKit,
    watchTradeInHandlingFee,
    roadPreparationFee
  ]);

  // Handle form submission
  const handleSubmit = (data: any) => {
    if (onSubmit) {
      // Prepare final data with all calculated values
      const finalData = {
        ...data,
        price: basePrice,
        accessoryPrice: accessoryTotalPrice,
        finalPrice: finalPrice,
        vatRate: watchReducedVAT ? 4 : 22,
        // Include new fields in submission
        licensePlateBonus: data.licensePlateBonus || 0,
        tradeInBonus: data.tradeInBonus || 0,
        safetyKit: data.safetyKit || 0,
        tradeInHandlingFee: data.tradeInHandlingFee || 0,
        roadPreparationFee: roadPreparationFee
      };
      
      onSubmit(finalData);
    }
  };

  return {
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
  };
};
