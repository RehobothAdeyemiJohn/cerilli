
import React from 'react';
import { Button } from '@/components/ui/button';

interface EditVehicleFormActionsProps {
  onCancel: () => void;
  isLoading?:Boolean|any
}

const EditVehicleFormActions = ({ onCancel,isLoading }: EditVehicleFormActionsProps) => {
  return (
    <div className="flex justify-end gap-4 pt-4">
      <Button 
        type="button" 
        variant="outline"
        disabled={isLoading}
        onClick={onCancel}
      >
        Annulla
      </Button>
      <Button 
        type="submit"
        disabled={isLoading}
      >
        Aggiorna Veicolo
      </Button>
    </div>
  );
};

export default EditVehicleFormActions;
