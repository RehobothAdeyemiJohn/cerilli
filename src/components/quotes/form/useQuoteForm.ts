
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useForm } from 'react-hook-form';
import { Vehicle, Quote } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { dealersApi } from '@/api/supabase/dealersApi';
import { vehiclesApi } from '@/api/supabase';

export const useQuoteForm = (
  vehicle?: Vehicle, 
  onSubmit?: (data: any) => void,
  editQuote?: Quote | null
) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'superAdmin';
  
  const [showTradeIn, setShowTradeIn] = useState(editQuote?.hasTradeIn || false);
  
  const { data: dealers = [] } = useQuery({
    queryKey: ['dealers'],
    queryFn: () => dealersApi.getAll(),
  });
  const {data:vehic={}}=useQuery({
    queryKey:["vehicle"],
    queryFn:()=>vehiclesApi.getById(vehicle.id)
  })

  const compatibleAccessories = vehicle?.accessories || [];
  const basePrice = vehicle?.price || 0;
  const roadPreparationFee = editQuote?.roadPreparationFee || 400; // Changed from 350 to 400
  
  // console.log(vehicle)
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
      tradeInPlate: editQuote?.tradeInPlate || '',
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

  useEffect(() => {
    if (vehicle && !editQuote) {
      form.setValue('vehicleId', vehicle.id);
      form.setValue('accessories', []);
      form.setValue('roadPreparationFee', roadPreparationFee);
    }
  }, [vehicle, form, roadPreparationFee, editQuote]);

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
  
  const totalDiscount = Number(watchDiscount) +
    Number(watchLicensePlateBonus) +
    Number(watchTradeInBonus);
  
  const accessoryTotalPrice = 0;
  
  // Calculate price based on VAT setting
  const getVATAdjustedPrice = (price: number) => {
    if (!watchReducedVAT) return price; // No change for standard VAT
    
    // For reduced VAT, first remove standard VAT then apply 4% VAT
    const priceWithoutVAT = price / 1.22;
    return priceWithoutVAT * 1.04;
  };
  
  // Apply VAT adjustment to all components except trade-in value
  const vatAdjustedBasePrice = getVATAdjustedPrice(basePrice);
  const vatAdjustedDiscount = getVATAdjustedPrice(Number(watchDiscount));
  const vatAdjustedPlateBonus = getVATAdjustedPrice(Number(watchLicensePlateBonus));
  const vatAdjustedTradeInBonus = getVATAdjustedPrice(Number(watchTradeInBonus));
  const vatAdjustedSafetyKit = getVATAdjustedPrice(Number(watchSafetyKit));
  const vatAdjustedHandlingFee = getVATAdjustedPrice(Number(watchTradeInHandlingFee));
  const vatAdjustedRoadPrep = getVATAdjustedPrice(Number(watchRoadPreparationFee));
  
  // Calculate final price with VAT adjustments
  const calculatedPrice = vatAdjustedBasePrice + accessoryTotalPrice + vatAdjustedRoadPrep - 
    (vatAdjustedDiscount + vatAdjustedPlateBonus + vatAdjustedTradeInBonus) - 
    Number(watchTradeInValue) + vatAdjustedSafetyKit + vatAdjustedHandlingFee;
    console.log(calculatedPrice)
  
  const finalPrice = Math.ceil((calculatedPrice > 0 ? calculatedPrice : 0)*100)/100;
  
  useEffect(() => {
    setShowTradeIn(watchHasTradeIn);
  }, [watchHasTradeIn]);
  
  const handleSubmit = (data: any) => {
    const formData = {
      ...data,
      price: basePrice,
      accessoryPrice: accessoryTotalPrice,
      finalPrice,
      ...(editQuote && { id: editQuote.id })
    };
    
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
    watchLicensePlateBonus,
    finalPrice,
    watchHasTradeIn,
    watchDiscount,
    watchTradeInValue,
    handleSubmit,
    totalDiscount,
    vehicleDetail:vehic as any,
    roadPreparationFee,
    watchReducedVAT,
    vatAdjustedSafetyKit,
    watchTradeInBonus,
    vatAdjustedHandlingFee
  };
};
