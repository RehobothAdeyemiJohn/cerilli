
import { useQuery } from '@tanstack/react-query';
import { dealersApi } from '@/api/supabase/dealersApi';
import { vehiclesApi } from '@/api/supabase/vehiclesApi';
import { useState, useEffect } from 'react';

export const useDealerStockValue = (dealerCompanyName: string = 'CMC') => {
  const [dealerPlafond, setDealerPlafond] = useState<number>(0);
  const [stockValue, setStockValue] = useState<number>(0);
  const [nuovoPlafond, setNuovoPlafond] = useState<number>(0);
  const [dealerId, setDealerId] = useState<string | null>(null);
  const [stockCount, setStockCount] = useState<number>(0);
  const [averageDays, setAverageDays] = useState<number>(0);

  // Fetch all dealers to find the requested dealer
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
      console.log(`Found dealer: ${dealer.companyName}, creditLimit: ${dealer.creditLimit}, nuovoPlafond: ${dealer.nuovoPlafond}`);
      
      setDealerId(dealer.id);
      setDealerPlafond(dealer.creditLimit || 0);
      
      // Use nuovoPlafond directly from the database
      setNuovoPlafond(dealer.nuovoPlafond !== undefined ? dealer.nuovoPlafond : 0);
      
      // Calculate total value of vehicles in "Stock Dealer" that belong to this dealer
      const dealerVehicles = vehicles.filter(vehicle => 
        vehicle.location === 'Stock Dealer' && 
        vehicle.reservedBy === dealer.companyName
      );
      
      // Calculate stock count
      setStockCount(dealerVehicles.length);
      
      // Calculate average days in stock
      const now = new Date();
      let totalDays = 0;
      
      dealerVehicles.forEach(vehicle => {
        if (vehicle.dateAdded) {
          const dateAdded = new Date(vehicle.dateAdded);
          const diffTime = Math.abs(now.getTime() - dateAdded.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          totalDays += diffDays;
        }
      });
      
      if (dealerVehicles.length > 0) {
        setAverageDays(Math.round(totalDays / dealerVehicles.length));
      } else {
        setAverageDays(0);
      }
      
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
    nuovoPlafond,
    stockCount,
    averageDays,
    isLoading: isLoadingDealers || isLoadingVehicles
  };
};
