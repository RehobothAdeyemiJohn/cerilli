
import React, { useEffect, useState } from 'react';
import { Form } from '@/components/ui/form';
import { Vehicle } from '@/types';
import { dealers } from '@/data/mockData';
import { useVehicleForm } from './form/useVehicleForm';
import VehicleBasicInfo from './form/VehicleBasicInfo';
import VehicleDetailsInfo from './form/VehicleDetailsInfo';
import VehicleSpecifications from './form/VehicleSpecifications';
import VehicleAccessories from './form/VehicleAccessories';
import VehiclePriceDisplay from './form/VehiclePriceDisplay';
import VehicleFormActions from './form/VehicleFormActions';

interface AddVehicleFormProps {
  onComplete: (newVehicle: Vehicle | null) => void;
  locationOptions?: string[];
}

const AddVehicleForm = ({ onComplete, locationOptions }: AddVehicleFormProps) => {
  const [locations, setLocations] = useState<string[]>(['Stock CMC', 'Stock Virtuale']);
  
  const {
    form,
    calculatedPrice,
    compatibleAccessories,
    isVirtualStock,
    validationError,
    priceComponents,
    onSubmit
  } = useVehicleForm(onComplete);

  // Set up location options
  // useEffect(() => {
  //   if (locationOptions) {
  //     setLocations(locationOptions);
  //   } else {
  //     const defaultLocations = ['Stock CMC', 'Stock Virtuale'];
  //     const activeDealerLocations = dealers
  //       .filter(dealer => dealer.isActive)
  //       .map(dealer => dealer.companyName);
  //     setLocations([...defaultLocations, ...activeDealerLocations]);
  //   }
  // }, [locationOptions]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Basic vehicle information section */}
        <VehicleBasicInfo 
          control={form.control} 
          locations={locations}
          isVirtualStock={isVirtualStock}
        />
        
        {/* Additional fields shown only for non-virtual stock */}
        {!isVirtualStock && (
          <>
            <VehicleDetailsInfo control={form.control} />
            <VehicleSpecifications control={form.control} />
            <VehicleAccessories 
              control={form.control}
              compatibleAccessories={compatibleAccessories}
              form={form}
            />
            <VehiclePriceDisplay calculatedPrice={calculatedPrice} priceComponents={priceComponents} />
          </>
        )}
        
        {/* Show validation errors */}
        {validationError && (
          <div className="text-red-500 text-sm mt-2">{validationError}</div>
        )}
        
        {/* Form actions */}
        <VehicleFormActions onCancel={() => onComplete(null)} />
      </form>
    </Form>
  );
};

export default AddVehicleForm;
