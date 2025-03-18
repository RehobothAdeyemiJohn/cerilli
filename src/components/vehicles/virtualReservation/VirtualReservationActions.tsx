
import React from 'react';
import { Button } from '@/components/ui/button';

interface VirtualReservationActionsProps {
  onCancel: () => void;
  isSubmitting?: boolean;
}

const VirtualReservationActions = ({ onCancel, isSubmitting = false }: VirtualReservationActionsProps) => {
  return (
    <div className="flex justify-end space-x-2 pt-4">
      <Button 
        type="button" 
        variant="outline" 
        onClick={onCancel}
        disabled={isSubmitting}
      >
        Annulla
      </Button>
      <Button 
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Prenotazione in corso...' : 'Configura e Prenota'}
      </Button>
    </div>
  );
};

export default VirtualReservationActions;
