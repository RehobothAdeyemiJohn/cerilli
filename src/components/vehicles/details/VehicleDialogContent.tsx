
import React from 'react';
import { Vehicle } from '@/types';
import { Button } from '@/components/ui/button';
import { LoaderCircle, Plus, X } from 'lucide-react';
import VehicleDetailsContent from './VehicleDetailsContent';
import QuoteForm from '@/components/quotes/QuoteForm';
import ReserveVehicleForm from '../ReserveVehicleForm';
import ReserveVirtualVehicleForm from '../ReserveVirtualVehicleForm';
import CancelReservationForm from '../CancelReservationForm';
import { DialogFooter } from '@/components/ui/dialog';

interface VehicleDialogContentProps {
  vehicle: Vehicle | null;
  onOpenChange?: (open: boolean) => void;
}

const VehicleDialogContent: React.FC<VehicleDialogContentProps> = ({ 
  vehicle, 
  onOpenChange 
}) => {
  if (!vehicle) {
    return null;
  }

  return (
    <>
      <VehicleDetailsContent vehicle={vehicle} />
    </>
  );
};

export default VehicleDialogContent;
