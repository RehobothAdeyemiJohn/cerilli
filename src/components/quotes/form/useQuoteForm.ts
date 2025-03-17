
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useForm } from 'react-hook-form';
import { Vehicle, Quote } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { dealersApi } from '@/api/supabase/dealersApi';

export const useQuoteForm = (
  vehicle?: Vehicle, 
  onSubmit?: (data: any) => void,
  editQuote?: Quote | null
) => {
  // Get user info from auth context
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'superAdmin';
  
  // States
  const [showTradeIn, setShowTradeIn] = useState(editQuote?.hasTradeIn || false);
  
  // Fetch dealers
  const { data: dealers = [] } = useQuery({
    queryKey: ['dealers'],
    queryFn: () => dealersApi.getAll(),
  });

  // Get compatible accessories from the vehicle
  const compatibleAccessories = vehicle?.accessories || [];
  
  // Calculate base price from vehicle
  const basePrice = vehicle?.price || 0;
  
  // Calculate road preparation fee
  const roadPreparationFee = editQuote?.roadPreparationFee || 350; // Standard fee
  
  // Set up form with default values
  const form = useForm({
    defaultValues: {
      vehicleId: vehicle?.id || '',
      dealerId: user?.dealerId || dealers[0]?.id || '',
      customerName: editQuote?.customerName || '',
      customerEmail: editQuote?.customerEmail || '',
      customerPhone: editQuote?.customerPhone || '',
      accessories: editQuote?.accessories || [],
      discount: editQuote?.discount || 0,
      reducedVAT: editQuote?.reducedVAT || false,
      vatRate: editQuote?.vatRate || 22,
      hasTradeIn: editQuote?.hasTradeIn || false,
      tradeInBrand: editQuote?.tradeInBrand || '',
      tradeInModel: editQuote?.tradeInModel || '',
      tradeInYear: editQuote?.tradeInYear || '',
      tradeInKm: editQuote?.tradeInKm || 0,
      tradeInValue: editQuote?.tradeInValue || 0,
      licensePlateBonus: editQuote?.licensePlateBonus || 0,
      tradeInBonus: editQuote?.tradeInBonus || 0,
      safetyKit: editQuote?.safetyKit || 0,
      tradeInHandlingFee: editQuote?.tradeInHandlingFee || 0,
      roadPreparationFee: editQuote?.roadPreparationFee || roadPreparationFee,
      notes: editQuote?.notes || '',
    }
  });
  
  // Initialize when vehicle changes and we're not editing
  useEffect(() => {
    if (vehicle && !editQuote) {
      form.setValue('vehicleId', vehicle.id);
      form.setValue('accessories', []);
      form.setValue('roadPreparationFee', roadPreparationFee);
    }
  }, [vehicle, form, roadPreparationFee, editQuote]);

  // Watch form values for calculations
  const watchAccessories = form.watch('accessories');
  const watchDiscount = form.watch('discount');
  const watchReducedVAT = form.watch('reducedVAT');
  const watchHasTradeIn = form.watch('hasTradeIn');
  const watchTradeInValue = form.watch('tradeInValue');
  const watchLicensePlateBonus = form.watch('licensePlateBonus') || 0;
  const watchTradeInBonus = form.watch('tradeInBonus') || 0;
  const watchSafetyKit = form.watch('safetyKit') || 0;
  const watchTradeInHandlingFee = form.watch('tradeInHandlingFee') || 0;
  const watchRoadPreparationFee = form.watch('roadPreparationFee');
  
  // Calculate total discount
  const totalDiscount = Number(watchDiscount) +
    Number(watchLicensePlateBonus) +
    Number(watchTradeInBonus);
  
  // Calculate accessory price
  const accessoryTotalPrice = 0; // You can implement dynamic calculation here
  
  // Calculate final price
  const calculatedPrice = basePrice + accessoryTotalPrice + Number(watchRoadPreparationFee) - 
    totalDiscount - Number(watchTradeInValue) + Number(watchSafetyKit) + Number(watchTradeInHandlingFee);
  
  const finalPrice = calculatedPrice > 0 ? calculatedPrice : 0;
  
  // Update showTradeIn when hasTradeIn changes
  useEffect(() => {
    setShowTradeIn(watchHasTradeIn);
  }, [watchHasTradeIn]);
  
  // Handle form submission
  const handleSubmit = (data: any) => {
    // Add calculated values to form data
    const formData = {
      ...data,
      price: basePrice,
      accessoryPrice: accessoryTotalPrice,
      finalPrice,
      // For editing, preserve the original ID
      ...(editQuote && { id: editQuote.id })
    };
    
    // Submit the form data
    if (onSubmit) {
      onSubmit(formData);
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
