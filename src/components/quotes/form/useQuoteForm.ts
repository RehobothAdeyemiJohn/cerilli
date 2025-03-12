
import { useState, useEffect, useMemo } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Vehicle, Accessory } from '@/types';
import { accessoriesApi } from '@/api/localStorage';
import { useQuery } from '@tanstack/react-query';
import { dealersApi } from '@/api/supabase/dealersApi';
import { useAuth } from '@/context/AuthContext';

const formSchema = z.object({
  customerName: z.string().min(2, {
    message: "Il nome del cliente deve contenere almeno 2 caratteri.",
  }),
  customerEmail: z.string().email({
    message: "Inserisci un indirizzo email valido.",
  }),
  customerPhone: z.string().min(6, {
    message: "Inserisci un numero di telefono valido.",
  }),
  discount: z.number().min(0),
  hasTradeIn: z.boolean().default(false),
  tradeInValue: z.number().min(0).optional(),
  tradeInBrand: z.string().optional(),
  tradeInModel: z.string().optional(),
  tradeInYear: z.string().optional(),
  tradeInKm: z.number().min(0).optional(),
  reducedVAT: z.boolean().default(false),
  vehicleAccessories: z.array(z.string()).default([]),
  dealerId: z.string().optional(),
});

export type QuoteFormValues = z.infer<typeof formSchema>;

export const useQuoteForm = (vehicle?: Vehicle, onSubmit: (data: any) => void) => {
  const [showTradeIn, setShowTradeIn] = useState(false);
  const [compatibleAccessories, setCompatibleAccessories] = useState<Accessory[]>([]);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'superAdmin';
  
  const { data: accessories = [] } = useQuery({
    queryKey: ['accessories'],
    queryFn: accessoriesApi.getAll
  });
  
  const { data: dealers = [], isLoading: isLoadingDealers } = useQuery({
    queryKey: ['dealers'],
    queryFn: () => dealersApi.getAll()
  });
  
  // Setup form with default values
  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      discount: 0,
      hasTradeIn: false,
      tradeInValue: 0,
      tradeInBrand: "",
      tradeInModel: "",
      tradeInYear: "",
      tradeInKm: 0,
      reducedVAT: false,
      vehicleAccessories: [],
      dealerId: user?.dealerId || undefined,
    },
  });

  // Load compatible accessories when vehicle changes
  useEffect(() => {
    const getVehicleAccessories = async () => {
      if (vehicle?.model && vehicle?.trim) {
        // Get accessories compatible with this model
        const modelObj = await accessoriesApi.getCompatible(vehicle.model, vehicle.trim);
        setCompatibleAccessories(modelObj);
      }
    };
    
    if (vehicle) {
      getVehicleAccessories();
    }
  }, [vehicle?.model, vehicle?.trim]);
  
  // Update dealerId when dealers data is loaded and user is not a dealer
  useEffect(() => {
    if (dealers && dealers.length > 0) {
      // Se l'utente è un dealer, usa il suo ID
      if (user?.dealerId) {
        form.setValue('dealerId', user.dealerId);
      } 
      // Altrimenti, usa il primo dealer disponibile
      else {
        form.setValue('dealerId', dealers[0].id);
      }
    }
  }, [dealers, user?.dealerId, form]);

  // Watch form values
  const watchDiscount = form.watch('discount') || 0;
  const watchTradeInValue = form.watch('tradeInValue') || 0;
  const watchHasTradeIn = form.watch('hasTradeIn');
  const watchReducedVAT = form.watch('reducedVAT');
  const watchVehicleAccessories = form.watch('vehicleAccessories');
  
  // Calculate prices
  const vatRate = watchReducedVAT ? 0.04 : 0.22;
  const basePrice = useMemo(() => {
    if (!vehicle) return 0;
    const priceWithoutVAT = vehicle.price / 1.22;
    return Math.round(priceWithoutVAT * (1 + vatRate));
  }, [vehicle?.price, vatRate]);

  const accessoryTotalPrice = useMemo(() => {
    return watchVehicleAccessories.reduce((total, accName) => {
      const accessory = compatibleAccessories.find(a => a.name === accName);
      return total + (accessory?.priceWithVAT || 0);
    }, 0);
  }, [watchVehicleAccessories, compatibleAccessories]);

  const finalPrice = Math.max(0, basePrice + accessoryTotalPrice - watchDiscount - (watchHasTradeIn ? watchTradeInValue : 0));

  // Submit handler
  const handleSubmit = (values: QuoteFormValues) => {
    if (!vehicle) return;
    
    // Ensure dealerId is set from the form or from the first dealer
    let dealerId = values.dealerId;
    if (!dealerId && dealers.length > 0) {
      dealerId = dealers[0].id;
    }
    
    const quoteData = {
      ...values,
      vehicleId: vehicle.id,
      price: basePrice,
      finalPrice: finalPrice,
      vatRate: vatRate,
      accessories: values.vehicleAccessories,
      accessoryPrice: accessoryTotalPrice,
      dealerId: dealerId // Make sure dealerId is always set
    };
    
    onSubmit(quoteData);
  };

  return {
    form,
    showTradeIn,
    setShowTradeIn,
    compatibleAccessories,
    dealers,
    isAdmin,
    isLoadingDealers,
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
