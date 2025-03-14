
import { Vehicle } from '@/types';
import { useVirtualReservationForm } from './virtualReservation/hooks/useVirtualReservationForm';
import { useVirtualReservationData } from './virtualReservation/hooks/useVirtualReservationData';
import { useCompatibleItems } from './virtualReservation/useCompatibleItems';
import { useCalculatePrice } from './virtualReservation/useCalculatePrice';
import { useCompatibleAccessories } from './virtualReservation/useCompatibleAccessories';
import { useVirtualReservationSubmit } from './virtualReservation/hooks/useVirtualReservationSubmit';

export type { VirtualReservationFormValues } from './virtualReservation/schema';

export const useVirtualReservation = (
  vehicle: Vehicle,
  onCancel: () => void,
  onReservationComplete: () => void
) => {
  // Use custom hooks for form management
  const { form, isAdmin, dealerId, dealerName } = useVirtualReservationForm(vehicle);
  
  // Use custom hook for data loading
  const {
    models,
    trims,
    fuelTypes,
    colors,
    transmissions,
    accessories,
    filteredDealers,
    isLoading,
    modelObj
  } = useVirtualReservationData(vehicle, isAdmin);

  // Watch form fields
  const watchTrim = form.watch('trim');
  const watchFuelType = form.watch('fuelType');
  const watchColor = form.watch('exteriorColor');
  const watchTransmission = form.watch('transmission');
  const watchAccessories = form.watch('accessories');

  // Use custom hooks for modular functionality
  const compatibleItems = useCompatibleItems(vehicle, modelObj, trims, fuelTypes, colors, transmissions);
  
  const { calculatedPrice, priceComponents } = useCalculatePrice(
    modelObj,
    watchTrim,
    watchFuelType,
    watchColor,
    watchTransmission,
    watchAccessories,
    trims,
    fuelTypes,
    colors,
    transmissions,
    accessories
  );
  
  const compatibleAccessories = useCompatibleAccessories(vehicle, watchTrim, modelObj, trims);

  // Use custom hook for form submission
  const { onSubmit } = useVirtualReservationSubmit(
    vehicle,
    isAdmin,
    dealerId,
    dealerName,
    onReservationComplete,
    calculatedPrice,
    filteredDealers
  );

  return {
    form,
    onSubmit,
    isLoading,
    modelObj,
    compatibleItems,
    compatibleAccessories,
    calculatedPrice,
    priceComponents,
    vehicle,
    isAdmin,
    activeDealers: filteredDealers,
    onCancel
  };
};
