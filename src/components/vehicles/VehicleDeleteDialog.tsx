
import React, { useState } from 'react';
import { Vehicle } from '@/types';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';

interface VehicleDeleteDialogProps {
  vehicle: Vehicle | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
}

const VehicleDeleteDialog = ({ 
  vehicle, 
  open, 
  onOpenChange,
  onConfirm 
}: VehicleDeleteDialogProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  
  if (!vehicle) return null;
  
  const handleConfirm = async () => {
    console.log('Delete confirmation for vehicle ID:', vehicle.id);
    setIsDeleting(true);
    
    try {
      await onConfirm();
      console.log('Delete operation completed successfully');
    } catch (error) {
      console.error('Error in delete confirmation:', error);
    } finally {
      setIsDeleting(false);
      onOpenChange(false);
    }
  };
  
  return (
    <AlertDialog open={open} onOpenChange={(value) => {
      if (!isDeleting) {
        onOpenChange(value);
      }
    }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Sei sicuro di voler eliminare questo veicolo?</AlertDialogTitle>
          <AlertDialogDescription>
            Questa azione non può essere annullata. Il veicolo {vehicle.model} {vehicle.trim} verrà 
            permanentemente rimosso dall'inventario.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annulla</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm} 
            className="bg-red-600 hover:bg-red-700"
            disabled={isDeleting}
          >
            {isDeleting ? 'Eliminazione...' : 'Elimina'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default VehicleDeleteDialog;
