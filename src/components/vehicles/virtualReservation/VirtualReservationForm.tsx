
import React from 'react';
import { Form } from '@/components/ui/form';
import { useVirtualReservation } from '../useVirtualReservation';
import VirtualReservationLoading from './VirtualReservationLoading';
import VirtualReservationError from './VirtualReservationError';
import VirtualReservationDestination from './VirtualReservationDestination';
import VirtualReservationDealerSelect from './VirtualReservationDealerSelect';
import VirtualReservationAccessories from './VirtualReservationAccessories';
import VirtualReservationPrice from './VirtualReservationPrice';
import VirtualReservationActions from './VirtualReservationActions';
import { Vehicle } from '@/types';

interface VirtualReservationFormProps {
  vehicle: Vehicle;
  onReservationComplete: () => void;
  onCancel: () => void;
}

const VirtualReservationForm: React.FC<VirtualReservationFormProps> = ({
  vehicle,
  onReservationComplete,
  onCancel
}) => {
  const {
    form,
    onSubmit,
    isLoading,
    modelObj,
    compatibleItems,
    compatibleAccessories,
    calculatedPrice,
    priceComponents,
    isAdmin,
    activeDealers
  } = useVirtualReservation(vehicle, onCancel, onReservationComplete);

  if (isLoading) {
    return <VirtualReservationLoading />;
  }

  if (!modelObj) {
    return <VirtualReservationError onCancel={onCancel} />;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Prenota Veicolo Virtuale</h2>
      <p className="text-sm text-gray-500">
        Configurazione per: {vehicle.model}
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <VirtualReservationDestination form={form} />
            <VirtualReservationDealerSelect 
              form={form} 
              dealers={activeDealers} 
              isAdmin={isAdmin} 
            />
          </div>

          {/* Accessories section */}
          <VirtualReservationAccessories 
            form={form} 
            compatibleAccessories={compatibleAccessories} 
          />

          {/* Price display */}
          <VirtualReservationPrice 
            calculatedPrice={calculatedPrice} 
            priceComponents={priceComponents} 
          />

          {/* Form actions */}
          <VirtualReservationActions onCancel={onCancel} />
        </form>
      </Form>
    </div>
  );
};

export default VirtualReservationForm;
