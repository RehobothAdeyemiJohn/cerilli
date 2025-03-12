import { supabase } from '@/api/supabase/client';
import { Dealer, Vehicle, Accessory } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/context/AuthContext';
import { dealersApi } from '@/api/supabase/dealersApi';
import { useQuery } from '@tanstack/react-query';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Define form validation schema with Zod
const formSchema = z.object({
  vehicleId: z.string(),
  dealerId: z.string(),
  customerName: z.string().min(1, { message: "Il nome del cliente è obbligatorio" }),
  customerEmail: z.string().email({ message: "Formato email non valido" }),
  customerPhone: z.string().min(1, { message: "Il numero di telefono è obbligatorio" }),
  price: z.number(),
  discount: z.number().default(0),
  reducedVAT: z.boolean().default(false),
  vehicleAccessories: z.array(z.string()).default([]),
  hasTradeIn: z.boolean().default(false),
  tradeInBrand: z.string().optional(),
  tradeInModel: z.string().optional(),
  tradeInYear: z.string().optional(),
  tradeInKm: z.number().optional(),
  tradeInValue: z.number().optional(),
  notes: z.string().optional(),
  finalPrice: z.number(),
  selectedAccessories: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      price: z.number()
    })
  ).optional(),
  accessoryTotalPrice: z.number().optional(),
});

export type QuoteFormValues = z.infer<typeof formSchema>;

export const useQuoteForm = (vehicle: Vehicle | undefined, onSubmit: (data: any) => void) => {
  const { user } = useAuth();
  // Properly check admin role
  const isAdmin = user?.role === 'admin' || user?.role === 'superAdmin';
  
  const [showTradeIn, setShowTradeIn] = useState(false);
  
  // Get all dealers for admin users
  const { data: dealers = [] } = useQuery({
    queryKey: ['dealers'],
    queryFn: dealersApi.getAll,
    enabled: isAdmin, // Only fetch if user is admin
  });
  
  const basePrice = vehicle?.price || 0;
  
  // Precomputed values for price calculations
  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vehicleId: vehicle?.id || '',
      dealerId: user?.dealerId || '',
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      price: basePrice,
      discount: 0,
      reducedVAT: false,
      vehicleAccessories: [] as string[],
      hasTradeIn: false,
      tradeInBrand: '',
      tradeInModel: '',
      tradeInYear: '',
      tradeInKm: 0,
      tradeInValue: 0,
      notes: '',
      finalPrice: basePrice,
      selectedAccessories: [],
      accessoryTotalPrice: 0,
    },
  });
  
  const watchHasTradeIn = form.watch('hasTradeIn');
  const watchReducedVAT = form.watch('reducedVAT');
  const watchDiscount = form.watch('discount');
  const watchTradeInValue = form.watch('tradeInValue');
  const watchVehicleAccessories = form.watch('vehicleAccessories');

  // Use vehicle.accessories or an empty array if it doesn't exist
  const vehicleAccessories = vehicle?.accessories || [];
  
  // Create a compatible accessories array from the vehicle's accessories
  const compatibleAccessories: Accessory[] = vehicleAccessories.map(accessoryName => ({
    id: accessoryName,
    name: accessoryName,
    priceWithVAT: 0,
    priceWithoutVAT: 0,
    compatibleModels: [],
    compatibleTrims: []
  }));
  
  // Calculate selected accessories total
  const accessoryTotalPrice = (watchVehicleAccessories || []).reduce((total, accessoryName) => {
    const accessory = compatibleAccessories.find(acc => acc.name === accessoryName);
    return total + (accessory?.priceWithVAT || 0);
  }, 0);
  
  // Calculate final price with proper deduction of trade-in value
  const discount = watchDiscount || 0;
  const tradeInValue = watchHasTradeIn ? watchTradeInValue || 0 : 0;
  const totalDiscount = discount + tradeInValue;
  
  // Base price plus accessories minus discounts (including trade-in)
  const subtotal = basePrice + accessoryTotalPrice - totalDiscount;
  
  // Apply VAT rate based on selection
  const vatRate = watchReducedVAT ? 0.04 : 0.22;
  const finalPrice = subtotal + (subtotal * vatRate);
  
  // Update final price when component values change
  form.setValue('finalPrice', finalPrice);
  
  const handleSubmit = (data: QuoteFormValues) => {
    // Set vehicle ID
    data.vehicleId = vehicle?.id || '';
    
    // Set price info
    data.price = basePrice;
    
    // Calculate accessory selections
    const selectedAccessories = (data.vehicleAccessories || []).map(accessoryName => {
      const accessory = compatibleAccessories.find(acc => acc.name === accessoryName);
      return {
        id: accessoryName,
        name: accessoryName,
        price: accessory?.priceWithVAT || 0
      };
    });
    
    // Create a new object with the form data and additional calculated properties
    const submitData = {
      ...data,
      selectedAccessories: selectedAccessories,
      accessoryTotalPrice: accessoryTotalPrice,
    };
    
    // Set trade-in info
    if (!submitData.hasTradeIn) {
      submitData.tradeInBrand = '';
      submitData.tradeInModel = '';
      submitData.tradeInYear = '';
      submitData.tradeInKm = 0;
      submitData.tradeInValue = 0;
    }
    
    // Ensure dealerId is set
    if (!submitData.dealerId && user?.dealerId) {
      submitData.dealerId = user.dealerId;
      console.log("Setting dealerId from user:", submitData.dealerId);
    } else if (!submitData.dealerId && dealers.length > 0) {
      submitData.dealerId = dealers[0].id;
      console.log("Setting dealerId from first dealer:", submitData.dealerId);
    }
    
    console.log("Form submission data:", submitData);
    
    // Call parent onSubmit
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
    totalDiscount
  };
};
