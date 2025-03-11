
import React from 'react';
import { Button } from '@/components/ui/button';

interface VirtualReservationErrorProps {
  onCancel: () => void;
}

const VirtualReservationError = ({ onCancel }: VirtualReservationErrorProps) => {
  return (
    <div className="p-4 text-center">
      <p className="text-red-500">Errore: Modello non trovato o dati non disponibili</p>
      <Button type="button" variant="outline" onClick={onCancel} className="mt-4">
        Annulla
      </Button>
    </div>
  );
};

export default VirtualReservationError;
