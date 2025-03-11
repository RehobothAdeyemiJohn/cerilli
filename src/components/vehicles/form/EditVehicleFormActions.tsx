
import React from 'react';
import { Button } from '@/components/ui/button';

interface EditVehicleFormActionsProps {
  onCancel: () => void;
}

const EditVehicleFormActions = ({ onCancel }: EditVehicleFormActionsProps) => {
  return (
    <div className="flex justify-end gap-4 pt-4">
      <Button 
        type="button" 
        variant="outline"
        onClick={onCancel}
      >
        Annulla
      </Button>
      <Button 
        type="submit"
      >
        Aggiorna Veicolo
      </Button>
    </div>
  );
};

export default EditVehicleFormActions;
