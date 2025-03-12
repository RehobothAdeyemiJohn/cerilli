
import { supabase } from '@/api/supabase/client';
import { Dealer, Vehicle, Accessory } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/context/AuthContext';
import { dealersApi } from '@/api/supabase/dealersApi';
import { useQuery } from '@tanstack/react-query';

export const useQuoteForm = (vehicle: Vehicle | undefined, onSubmit: (data: any) => void) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  const [showTradeIn, setShowTradeIn] = useState(false);
  
  // Get all dealers for admin users
  const { data: dealers = [] } = useQuery({
    queryKey: ['dealers'],
    queryFn: dealersApi.getAll,
    enabled: isAdmin, // Only fetch if user is admin
  });
  
  const basePrice = vehicle?.price || 0;
  
  // Precomputed values for price calculations
  const form = useForm({
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
    },
  });
  
  const watchHasTradeIn = form.watch('hasTradeIn');
  const watchReducedVAT = form.watch('reducedVAT');
  const watchDiscount = form.watch('discount');
  const watchTradeInValue = form.watch('tradeInValue');
  const watchVehicleAccessories = form.watch('vehicleAccessories');
  const watchLocation = form.watch('location');

  // Use vehicle.accessories or an empty array if it doesn't exist
  const vehicleAccessories = vehicle?.accessories || [];
  
  // Create a compatible accessories array from the vehicle's accessories
  const compatibleAccessories: Accessory[] = vehicleAccessories.map(accessoryName => ({
    id: accessoryName, // Use the accessory name as ID
    name: accessoryName,
    // Use priceWithVAT and priceWithoutVAT instead of price
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
  
  // Calculate final price with VAT and including trade-in value
  const totalDiscount = (watchDiscount || 0) + (watchHasTradeIn ? watchTradeInValue || 0 : 0);
  const subtotal = basePrice + accessoryTotalPrice - totalDiscount;
  
  const finalPrice = watchReducedVAT 
    ? subtotal + (subtotal * 0.04) // 4% reduced VAT 
    : subtotal + (subtotal * 0.22); // 22% standard VAT
  
  // Update final price when component values change
  form.setValue('finalPrice', finalPrice);
  
  const handleSubmit = (data: any) => {
    // Set vehicle ID
    data.vehicleId = vehicle?.id;
    
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
    
    data.selectedAccessories = selectedAccessories;
    data.accessoryTotalPrice = accessoryTotalPrice;
    
    // Set trade-in info
    if (!data.hasTradeIn) {
      data.tradeInBrand = '';
      data.tradeInModel = '';
      data.tradeInYear = '';
      data.tradeInKm = 0;
      data.tradeInValue = 0;
    }
    
    // Call parent onSubmit
    onSubmit(data);
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
    handleSubmit
  };
};
