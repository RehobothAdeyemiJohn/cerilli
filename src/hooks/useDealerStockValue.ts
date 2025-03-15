
import { useQuery } from '@tanstack/react-query';
import { dealersApi } from '@/api/supabase/dealersApi';
import { vehiclesApi } from '@/api/supabase/vehiclesApi';
import { useState, useEffect } from 'react';

export const useDealerStockValue = (dealerCompanyName: string = 'CMC') => {
  const [dealerPlafond, setDealerPlafond] = useState<number>(0);
  const [stockValue, setStockValue] = useState<number>(0);
  const [dealerId, setDealerId] = useState<string | null>(null);

  // Fetch all dealers to find CMC
  const { data: dealers = [], isLoading: isLoadingDealers } = useQuery({
    queryKey: ['dealers'],
    queryFn: dealersApi.getAll,
  });

  // Fetch all vehicles
  const { data: vehicles = [], isLoading: isLoadingVehicles } = useQuery({
    queryKey: ['vehicles'],
    queryFn: vehiclesApi.getAll,
  });

  useEffect(() => {
    // Find the dealer with the specified company name
    const dealer = dealers.find(d => 
      d.companyName.toLowerCase() === dealerCompanyName.toLowerCase()
    );
    
    if (dealer) {
      setDealerId(dealer.id);
      setDealerPlafond(dealer.creditLimit || 0);
      
      // Calculate total value of vehicles in "Stock Dealer" that belong to this dealer
      const dealerVehicles = vehicles.filter(vehicle => 
        vehicle.location === 'Stock Dealer' && 
        vehicle.reservedBy === dealer.companyName
      );
      
      const totalValue = dealerVehicles.reduce((sum, vehicle) => 
        sum + (vehicle.price || 0), 0
      );
      
      setStockValue(totalValue);
      console.log(`Found ${dealerVehicles.length} vehicles in ${dealerCompanyName}'s stock with total value: ${totalValue}`);
    }
  }, [dealers, vehicles, dealerCompanyName]);

  return {
    dealerPlafond,
    stockValue,
    dealerId,
    isLoading: isLoadingDealers || isLoadingVehicles
  };
};
