
import React, { useEffect, useState } from 'react';
import { Form } from '@/components/ui/form';
import { Vehicle } from '@/types';
import { dealers } from '@/data/mockData';
import { useEditVehicleForm } from './form/useEditVehicleForm';
import VehicleBasicInfo from './form/VehicleBasicInfo';
import VehicleDetailsInfo from './form/VehicleDetailsInfo';
import VehicleSpecifications from './form/VehicleSpecifications';
import VehicleAccessories from './form/VehicleAccessories';
import VehiclePriceDisplay from './form/VehiclePriceDisplay';
import EditVehicleFormActions from './form/EditVehicleFormActions';

interface EditVehicleFormProps {
  vehicle: Vehicle;
  onComplete: (vehicle: Vehicle) => void;
  onCancel: () => void;
  locationOptions?: string[];
}

const EditVehicleForm = ({ vehicle, onComplete, onCancel, locationOptions }: EditVehicleFormProps) => {
  const [locations, setLocations] = useState<string[]>(['Stock CMC', 'Stock Virtuale']);
  
  const {
    form,
    calculatedPrice,
    compatibleAccessories,
    isVirtualStock,
    validationError,
    priceComponents,
    onSubmit
  } = useEditVehicleForm(vehicle, onComplete, onCancel);

  // Set up location options
  useEffect(() => {
    if (locationOptions) {
      setLocations(locationOptions);
    } else {
      const defaultLocations = ['Stock CMC', 'Stock Virtuale'];
      const activeDealerLocations = dealers
        .filter(dealer => dealer.isActive)
        .map(dealer => dealer.companyName);
      setLocations([...defaultLocations, ...activeDealerLocations]);
    }
  }, [locationOptions]);

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
        <EditVehicleFormActions onCancel={onCancel} />
      </form>
    </Form>
  );
};

export default EditVehicleForm;
