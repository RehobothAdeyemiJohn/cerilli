
import React from 'react';
import { Vehicle } from '@/types';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CancelReservationFormProps {
  vehicle: Vehicle;
  onSubmit: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const CancelReservationForm = ({ 
  vehicle, 
  onSubmit, 
  onCancel,
  isSubmitting 
}: CancelReservationFormProps) => {
  // Simple confirmation dialog approach
  return (
    <AlertDialog defaultOpen={true} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Annulla Prenotazione</AlertDialogTitle>
          <AlertDialogDescription>
            Sei sicuro di voler annullare la prenotazione per {vehicle.model} {vehicle.trim || ''}
            {vehicle.reservedBy ? ` prenotato da ${vehicle.reservedBy}` : ''}?
            Questa azione non può essere annullata.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel} disabled={isSubmitting}>
            Annulla
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onSubmit}
            disabled={isSubmitting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isSubmitting ? 'Elaborazione...' : 'Conferma Cancellazione'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CancelReservationForm;
