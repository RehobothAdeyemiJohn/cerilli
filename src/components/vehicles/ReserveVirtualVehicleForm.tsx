
import React, { useEffect, useRef } from 'react';
import { Vehicle } from '@/types';
import { Form } from '@/components/ui/form';
import { useVirtualReservation } from './useVirtualReservation';
import VirtualReservationDealerSelect from './virtualReservation/VirtualReservationDealerSelect';
import VirtualReservationConfigurator from './virtualReservation/VirtualReservationConfigurator';
import VirtualReservationAccessories from './virtualReservation/VirtualReservationAccessories';
import VirtualReservationPrice from './virtualReservation/VirtualReservationPrice';
import VirtualReservationActions from './virtualReservation/VirtualReservationActions';
import VirtualReservationLoading from './virtualReservation/VirtualReservationLoading';
import VirtualReservationError from './virtualReservation/VirtualReservationError';
import VirtualReservationDestination from './virtualReservation/VirtualReservationDestination';

export interface ReserveVirtualVehicleFormProps {
  vehicle: Vehicle;
  onCancel: () => void;
  onReservationComplete: () => void;
  isSubmitting?: boolean;
}

const ReserveVirtualVehicleForm = ({ 
  vehicle, 
  onCancel, 
  onReservationComplete,
  isSubmitting: externalIsSubmitting
}: ReserveVirtualVehicleFormProps) => {
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
    activeDealers,
    isSubmitting: internalIsSubmitting,
    onCancel: handleCancel,
  } = useVirtualReservation(vehicle, onCancel, onReservationComplete);

  // Use external isSubmitting value if provided, otherwise fall back to internal state
  const isSubmittingState = externalIsSubmitting !== undefined ? externalIsSubmitting : internalIsSubmitting;

  const formRef = useRef<HTMLFormElement>(null);

  // Scroll to the form when component mounts
  useEffect(() => {
    if (formRef.current) {
      setTimeout(() => {
        formRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 100);
    }
  }, []);

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
      <form ref={formRef} onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4">
        <h3 className="text-lg font-medium">Configura e Prenota {vehicle.model}</h3>
        
        <VirtualReservationDealerSelect 
          form={form} 
          dealers={activeDealers} 
          isAdmin={isAdmin} 
        />
        
        <VirtualReservationDestination form={form} />
        
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
        
        <VirtualReservationPrice 
          calculatedPrice={calculatedPrice} 
          priceComponents={priceComponents}
        />
        
        <VirtualReservationActions onCancel={handleCancel} isSubmitting={isSubmittingState} />
      </form>
    </Form>
  );
};

export default ReserveVirtualVehicleForm;
