
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Vehicle, Accessory } from '@/types';
import { accessoriesApi } from '@/api/supabase/settingsApi';
import { dealersApi } from '@/api/supabase/dealersApi';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';

const quoteSchema = z.object({
  customerName: z.string().min(1, { message: "Il nome del cliente è obbligatorio" }),
  customerEmail: z.string().email({ message: "Formato email non valido" }),
  customerPhone: z.string().min(1, { message: "Il numero di telefono è obbligatorio" }),
  dealerId: z.string().min(1, { message: "Il concessionario è obbligatorio" }),
  discount: z.number().min(0).default(0),
  licensePlateBonus: z.number().min(0).default(0), // Premio Targa
  tradeInBonus: z.number().min(0).default(0), // Premio Permuta
  safetyKit: z.number().min(0).default(0), // Kit Sicurezza
  reducedVAT: z.boolean().default(false), // IVA agevolata (4% invece di 22%)
  hasTradeIn: z.boolean().default(false), // Whether there's a trade-in vehicle
  tradeInBrand: z.string().optional(),
  tradeInModel: z.string().optional(),
  tradeInYear: z.string().optional(),
  tradeInKm: z.number().optional(),
  tradeInValue: z.number().optional(),
  tradeInHandlingFee: z.number().default(0), // Gestione Usato
  selectedAccessories: z.array(z.string()).default([]), // Optional accessories
  notes: z.string().optional(),
  roadPreparationFee: z.number().default(400),
});

export type QuoteFormValues = z.infer<typeof quoteSchema>;

export const useQuoteForm = (
  vehicle: Vehicle | undefined,
  onSubmit: (data: any) => void,
) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'superAdmin';
  const [showTradeIn, setShowTradeIn] = useState(false);
  const [compatibleAccessories, setCompatibleAccessories] = useState<Accessory[]>([]);
  const [basePrice, setBasePrice] = useState(vehicle?.price || 0);
  const [accessoryTotalPrice, setAccessoryTotalPrice] = useState(0);
  const [finalPrice, setFinalPrice] = useState(vehicle?.price || 0);
  const [totalDiscount, setTotalDiscount] = useState(0);
  const roadPreparationFee = 400; // Default value

  // Fetch compatible accessories
  useEffect(() => {
    const fetchCompatibleAccessories = async () => {
      if (vehicle?.model && vehicle?.trim) {
        try {
          const accessories = await accessoriesApi.getCompatible(vehicle.model, vehicle.trim);
          // Filter out accessories that are already included in the vehicle
          const available = accessories.filter(
            accessory => !vehicle.accessories?.includes(accessory.name)
          );
          setCompatibleAccessories(available);
        } catch (error) {
          console.error('Error fetching compatible accessories:', error);
        }
      }
    };

    fetchCompatibleAccessories();
  }, [vehicle]);

  // Form initialization
  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
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
      selectedAccessories: [],
      notes: '',
      roadPreparationFee: 400,
    },
  });

  // Get all dealers for admin users
  const { data: dealers = [] } = useQuery({
    queryKey: ['dealers'],
    queryFn: dealersApi.getAll,
    enabled: isAdmin, // Only fetch if user is admin
  });

  // Watch form values
  const watchSelectedAccessories = form.watch('selectedAccessories');
  const watchDiscount = form.watch('discount');
  const watchHasTradeIn = form.watch('hasTradeIn');
  const watchTradeInValue = form.watch('tradeInValue');
  const watchReducedVAT = form.watch('reducedVAT');
  const watchLicensePlateBonus = form.watch('licensePlateBonus');
  const watchTradeInBonus = form.watch('tradeInBonus');
  const watchSafetyKit = form.watch('safetyKit');
  const watchTradeInHandlingFee = form.watch('tradeInHandlingFee');

  // Calculate accessory prices
  useEffect(() => {
    if (compatibleAccessories.length && watchSelectedAccessories.length) {
      const total = watchSelectedAccessories.reduce((sum, accessoryName) => {
        const accessory = compatibleAccessories.find(a => a.name === accessoryName);
        return sum + (accessory ? (accessory.priceWithVAT || 0) : 0);
      }, 0);
      setAccessoryTotalPrice(total);
    } else {
      setAccessoryTotalPrice(0);
    }
  }, [compatibleAccessories, watchSelectedAccessories]);

  // Calculate total discount (discount + trade-in value)
  useEffect(() => {
    const discount = watchDiscount || 0;
    const tradeInValue = watchHasTradeIn ? (watchTradeInValue || 0) : 0;
    setTotalDiscount(discount + tradeInValue);
  }, [watchDiscount, watchHasTradeIn, watchTradeInValue]);

  // Calculate the final price with all components
  useEffect(() => {
    if (!vehicle) {
      setFinalPrice(0);
      return;
    }

    const vehiclePrice = vehicle.price || 0;
    setBasePrice(vehiclePrice);

    // Get values from form
    const discount = watchDiscount || 0;
    const licensePlateBonus = watchLicensePlateBonus || 0;
    const tradeInBonus = watchTradeInBonus || 0;
    const safetyKit = watchSafetyKit || 0;
    const tradeInValue = watchHasTradeIn ? (watchTradeInValue || 0) : 0;
    const tradeInHandlingFee = watchHasTradeIn ? (watchTradeInHandlingFee || 0) : 0;
    const reducedVAT = watchReducedVAT || false;

    // Calculations for VAT
    // If reduced VAT (4%) is selected, we need to:
    // 1. Remove the standard 22% VAT from the base price (divide by 1.22)
    // 2. Add 4% VAT to the resulting amount (multiply by 1.04)
    let priceWithCorrectVAT = vehiclePrice;
    if (reducedVAT) {
      // Remove 22% VAT
      const priceWithoutVAT = vehiclePrice / 1.22;
      // Add 4% VAT
      priceWithCorrectVAT = priceWithoutVAT * 1.04;
    }

    // Apply the same VAT adjustment to accessories if needed
    let accessoriesWithCorrectVAT = accessoryTotalPrice;
    if (reducedVAT) {
      // Remove 22% VAT
      const accessoriesWithoutVAT = accessoryTotalPrice / 1.22;
      // Add 4% VAT  
      accessoriesWithCorrectVAT = accessoriesWithoutVAT * 1.04;
    }

    // Calculate final price with all components
    let calculatedPrice = priceWithCorrectVAT + accessoriesWithCorrectVAT;
    
    // Subtract discounts
    calculatedPrice -= discount;
    calculatedPrice -= licensePlateBonus;
    calculatedPrice -= tradeInBonus;
    
    // Add fees
    calculatedPrice += safetyKit;
    calculatedPrice += roadPreparationFee;
    calculatedPrice += tradeInHandlingFee;
    
    // Apply trade-in value (no VAT adjustment for trade-in)
    calculatedPrice -= tradeInValue;

    // Round to 2 decimal places and set as final price
    setFinalPrice(Math.round(calculatedPrice * 100) / 100);
  }, [
    vehicle,
    accessoryTotalPrice,
    watchDiscount,
    watchLicensePlateBonus,
    watchTradeInBonus,
    watchSafetyKit,
    watchHasTradeIn,
    watchTradeInValue,
    watchTradeInHandlingFee,
    watchReducedVAT,
    roadPreparationFee
  ]);

  // When hasTradeIn changes, update showTradeIn state
  useEffect(() => {
    setShowTradeIn(watchHasTradeIn);
  }, [watchHasTradeIn]);

  // Handle form submission
  const handleSubmit = (data: QuoteFormValues) => {
    if (!vehicle) return;

    // Prepare data for submission
    const submitData = {
      ...data,
      vehicleId: vehicle.id,
      price: basePrice,
      finalPrice: finalPrice,
      accessoryTotalPrice: accessoryTotalPrice,
    };

    // If no trade-in, clear trade-in fields
    if (!submitData.hasTradeIn) {
      submitData.tradeInBrand = '';
      submitData.tradeInModel = '';
      submitData.tradeInYear = '';
      submitData.tradeInKm = 0;
      submitData.tradeInValue = 0;
      submitData.tradeInHandlingFee = 0;
    }

    // Submit form
    onSubmit(submitData);
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
