
import React from 'react';
import { Button } from '@/components/ui/button';

interface VirtualReservationActionsProps {
  onCancel: () => void;
}

const VirtualReservationActions = ({ onCancel }: VirtualReservationActionsProps) => {
  return (
    <div className="flex justify-end gap-2 pt-4">
      <Button type="button" variant="outline" onClick={onCancel}>
        Annulla
      </Button>
      <Button type="submit">
        Conferma Prenotazione
      </Button>
    </div>
  );
};

export default VirtualReservationActions;
