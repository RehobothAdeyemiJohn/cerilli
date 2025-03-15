
import { useState, useEffect, useCallback } from 'react';
import { Vehicle } from '@/types';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { useVehicleActions } from '@/hooks/inventory/useVehicleActions';

export function useVehicleDetailsDialog(
  vehicle: Vehicle,
  onVehicleUpdated: () => void,
  onVehicleDeleted: (id: string) => void,
  onClose: () => void,
  requestedAction?: string
) {
  const [isEditing, setIsEditing] = useState(false);
  const [isReserving, setIsReserving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [isCancellingReservation, setIsCancellingReservation] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const queryClient = useQueryClient();
  
  const { handleVehicleDuplicate } = useVehicleActions();
  
  // Make handleDuplicate a useCallback to prevent unnecessary rerenders
  const handleDuplicate = useCallback(async () => {
    if (!vehicle || !vehicle.id) {
      console.error("Cannot duplicate: Invalid vehicle or missing ID");
      return;
    }
    
    console.log("useVehicleDetailsDialog: Duplicating vehicle:", vehicle.id);
    setIsDuplicating(true);
    
    try {
      await handleVehicleDuplicate(vehicle.id);
      
      // Refresh the vehicles list
      await queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      
      // Close the dialog after duplication
      onClose();
      
      toast({
        title: "Veicolo duplicato",
        description: `Il veicolo ${vehicle.model} è stato duplicato con successo.`,
      });
      
    } catch (error) {
      console.error("Error duplicating vehicle:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la duplicazione del veicolo.",
        variant: "destructive",
      });
    } finally {
      setIsDuplicating(false);
    }
  }, [vehicle, handleVehicleDuplicate, queryClient, onClose]);
  
  // Handle automatic duplication when requested
  useEffect(() => {
    if (requestedAction === 'duplicate' && vehicle && vehicle.id) {
      console.log("Auto-duplicating vehicle based on requestedAction:", vehicle.id);
      handleDuplicate();
    }
  }, [requestedAction, vehicle, handleDuplicate]);
  
  const startEditing = () => {
    setIsEditing(true);
  };
  
  const cancelEditing = () => {
    setIsEditing(false);
  };
  
  const startReserving = () => {
    setIsReserving(true);
  };
  
  const cancelReserving = () => {
    setIsReserving(false);
  };
  
  const startCancellingReservation = () => {
    setIsCancellingReservation(true);
  };
  
  const cancelCancellingReservation = () => {
    setIsCancellingReservation(false);
  };
  
  const startCreatingOrder = () => {
    setIsCreatingOrder(true);
  };
  
  const cancelCreatingOrder = () => {
    setIsCreatingOrder(false);
  };
  
  const handleVehicleUpdated = () => {
    setIsEditing(false);
    setIsReserving(false);
    setIsCancellingReservation(false);
    setIsCreatingOrder(false);
    
    onVehicleUpdated();
    
    // Invalidate the vehicles query to refresh data
    queryClient.invalidateQueries({ queryKey: ['vehicles'] });
  };
  
  const handleDelete = () => {
    onVehicleDeleted(vehicle.id);
    onClose();
  };
  
  return {
    isEditing,
    isReserving,
    isDeleting,
    isDuplicating,
    isCancellingReservation,
    isCreatingOrder,
    startEditing,
    cancelEditing,
    startReserving,
    cancelReserving,
    startCancellingReservation,
    cancelCancellingReservation,
    startCreatingOrder,
    cancelCreatingOrder,
    handleVehicleUpdated,
    handleDelete,
    handleDuplicate,
  };
}
