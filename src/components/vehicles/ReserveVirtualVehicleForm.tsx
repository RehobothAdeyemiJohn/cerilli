
import React from 'react';
import { Vehicle } from '@/types';
import { Form } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { useVirtualReservation } from './virtualReservation/useVirtualReservation';
import VirtualReservationDealerSelect from './virtualReservation/VirtualReservationDealerSelect';
import VirtualReservationConfigurator from './virtualReservation/VirtualReservationConfigurator';
import VirtualReservationAccessories from './virtualReservation/VirtualReservationAccessories';
import VirtualReservationPrice from './virtualReservation/VirtualReservationPrice';
import VirtualReservationActions from './virtualReservation/VirtualReservationActions';
import VirtualReservationLoading from './virtualReservation/VirtualReservationLoading';
import VirtualReservationError from './virtualReservation/VirtualReservationError';

interface ReserveVirtualVehicleFormProps {
  vehicle: Vehicle;
  onCancel: () => void;
  onReservationComplete: () => void;
}

const ReserveVirtualVehicleForm = ({ 
  vehicle, 
  onCancel, 
  onReservationComplete 
}: ReserveVirtualVehicleFormProps) => {
  const {
    form,
    onSubmit,
    isLoading,
    modelObj,
    compatibleItems,
    compatibleAccessories,
    calculatedPrice,
    isAdmin,
    activeDealers,
    onCancel: handleCancel,
  } = useVirtualReservation(vehicle, onCancel, onReservationComplete);

  // Show loader while data is being fetched
  if (isLoading) {
    return <VirtualReservationLoading />;
  }

  // Show error if model not found
  if (!modelObj) {
    return <VirtualReservationError onCancel={onCancel} />;
  }

  const { compatibleTrims, compatibleFuelTypes, compatibleColors, compatibleTransmissions } = compatibleItems;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <h3 className="text-lg font-medium">Configura e Prenota {vehicle.model}</h3>
        
        <VirtualReservationDealerSelect 
          form={form} 
          dealers={activeDealers} 
          isAdmin={isAdmin} 
        />
        
        <VirtualReservationConfigurator 
          form={form} 
          compatibleTrims={compatibleTrims}
          compatibleFuelTypes={compatibleFuelTypes}
          compatibleColors={compatibleColors}
          compatibleTransmissions={compatibleTransmissions}
        />
        
        <VirtualReservationAccessories 
          form={form} 
          compatibleAccessories={compatibleAccessories} 
        />
        
        <VirtualReservationPrice calculatedPrice={calculatedPrice} />
        
        <VirtualReservationActions onCancel={handleCancel} />
      </form>
    </Form>
  );
};

export default ReserveVirtualVehicleForm;
