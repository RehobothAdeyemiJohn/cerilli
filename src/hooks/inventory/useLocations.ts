
import { useState, useEffect } from 'react';
import { dealers } from '@/data/mockData';

export const useLocationOptions = () => {
  const [locationOptions, setLocationOptions] = useState<string[]>(['Stock CMC', 'Stock Virtuale']);
  
  // Load dealer names to use as location options
  useEffect(() => {
    const defaultLocations = ['Stock CMC', 'Stock Virtuale'];
    const activeDealerLocations = dealers
      .filter(dealer => dealer.isActive)
      .map(dealer => dealer.companyName);
    setLocationOptions([...defaultLocations, ...activeDealerLocations]);
  }, []);

  return locationOptions;
};
