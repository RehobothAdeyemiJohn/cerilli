
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Vehicle, Accessory } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { dealersApi } from '@/api/supabase/dealersApi';
import { useAuth } from '@/context/AuthContext';
import { accessoriesApi } from '@/api/localStorage';

// Form schema
const quoteFormSchema = z.object({
  customerName: z.string().min(1, { message: "Il nome cliente è obbligatorio" }),
  customerEmail: z.string().email({ message: "Email non valida" }),
  customerPhone: z.string().min(1, { message: "Il telefono è obbligatorio" }),
  dealerId: z.string().min(1, { message: "Il dealer è obbligatorio" }),
  discount: z.coerce.number().default(0),
  licensePlateBonus: z.coerce.number().default(0),
  tradeInBonus: z.coerce.number().default(0),
  safetyKit: z.coerce.number().default(0),
  reducedVAT: z.boolean().default(false),
  hasTradeIn: z.boolean().default(false),
  tradeInBrand: z.string().optional(),
  tradeInModel: z.string().optional(),
  tradeInYear: z.string().optional(),
  tradeInKm: z.coerce.number().optional(),
  tradeInValue: z.coerce.number().optional(),
  tradeInHandlingFee: z.coerce.number().default(0),
  notes: z.string().optional(),
  selectedAccessories: z.array(z.string()).default([]),
});

export type QuoteFormValues = z.infer<typeof quoteFormSchema>;

export const useQuoteForm = (vehicle?: Vehicle, onSubmit?: (data: any) => void) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'superAdmin';
  const [showTradeIn, setShowTradeIn] = useState(false);
  const [compatibleAccessories, setCompatibleAccessories] = useState<Accessory[]>([]);
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);
  const [accessoryTotalPrice, setAccessoryTotalPrice] = useState(0);
  const roadPreparationFee = 400; // Default road preparation fee

  // Get all dealers
  const { data: dealers = [] } = useQuery({
    queryKey: ['dealers'],
    queryFn: dealersApi.getAll,
    enabled: isAdmin, // Only fetch if user is admin
  });

  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteFormSchema),
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
      notes: '',
      selectedAccessories: [],
    },
  });

  // Get form values for calculations
  const watchHasTradeIn = form.watch('hasTradeIn');
  const watchDiscount = form.watch('discount');
  const watchLicensePlateBonus = form.watch('licensePlateBonus');
  const watchTradeInBonus = form.watch('tradeInBonus');
  const watchSafetyKit = form.watch('safetyKit');
  const watchTradeInValue = form.watch('tradeInValue');
  const watchTradeInHandlingFee = form.watch('tradeInHandlingFee');
  const watchReducedVAT = form.watch('reducedVAT');
  const watchSelectedAccessories = form.watch('selectedAccessories');

  // Base price from vehicle
  const basePrice = vehicle?.price || 0;

  // Get compatible accessories for this vehicle
  useEffect(() => {
    const fetchCompatibleAccessories = async () => {
      if (vehicle && vehicle.model && vehicle.trim) {
        try {
          // First find model and trim IDs
          const modelId = vehicle.modelId || 'model_id';
          const trimId = vehicle.trimId || 'trim_id';
          
          const accessories = await accessoriesApi.getCompatible(modelId, trimId);
          setCompatibleAccessories(accessories || []);
        } catch (error) {
          console.error('Error fetching compatible accessories:', error);
          setCompatibleAccessories([]);
        }
      }
    };

    fetchCompatibleAccessories();
  }, [vehicle]);

  // Calculate accessory total price when selected accessories change
  useEffect(() => {
    if (watchSelectedAccessories && compatibleAccessories) {
      const total = watchSelectedAccessories.reduce((sum, accessoryName) => {
        const accessory = compatibleAccessories.find(a => a.name === accessoryName);
        return sum + (accessory?.price || 0);
      }, 0);
      setAccessoryTotalPrice(total);
    } else {
      setAccessoryTotalPrice(0);
    }
  }, [watchSelectedAccessories, compatibleAccessories]);

  // Calculate total discount (direct discount + trade-in value)
  const totalDiscount = (watchDiscount || 0) + (watchHasTradeIn ? (watchTradeInValue || 0) : 0);

  // Calculate final price with all components
  // Base price already includes 22% VAT
  const calculateFinalPrice = () => {
    // Start with base price and accessories
    let price = basePrice + accessoryTotalPrice;
    
    // Subtract discounts, premiums are now subtracted
    price -= (watchDiscount || 0);
    price -= (watchLicensePlateBonus || 0);
    price -= (watchTradeInBonus || 0);
    
    // Add fees and safety kit
    price += (watchSafetyKit || 0);
    price += roadPreparationFee;
    
    // Handle trade-in if enabled
    if (watchHasTradeIn) {
      price -= (watchTradeInValue || 0);
      price += (watchTradeInHandlingFee || 0);
    }
    
    // Apply reduced VAT if selected (only 4% on the total price)
    if (watchReducedVAT) {
      price += price * 0.04;
    }
    
    return price;
  };
  
  const finalPrice = calculateFinalPrice();

  // Handle form submission
  const handleSubmit = (data: QuoteFormValues) => {
    if (!vehicle) return;
    
    const formData = {
      ...data,
      vehicleId: vehicle.id,
      price: basePrice,
      accessoryTotalPrice,
      finalPrice,
      dealerId: data.dealerId || user?.dealerId,
      selectedAccessories: watchSelectedAccessories
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
    finalPrice,
    watchHasTradeIn,
    watchDiscount,
    watchTradeInValue,
    handleSubmit,
    totalDiscount,
    roadPreparationFee
  };
};
