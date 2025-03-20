
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
  const [actionProcessed, setActionProcessed] = useState(false);
  const queryClient = useQueryClient();
  
  // Import isDuplicating flag from hook to prevent concurrent operations
  const { handleVehicleDuplicate, isDuplicating: isActionDuplicating } = useVehicleActions();
  
  // Make handleDuplicate a useCallback to prevent unnecessary rerenders
  const handleDuplicate = useCallback(async () => {
    // Multiple checks to prevent duplicate operations
    if (!vehicle || !vehicle.id || isDuplicating || isActionDuplicating) {
      console.error("Cannot duplicate: Invalid vehicle, missing ID, or already duplicating");
      return;
    }
    
    console.log("useVehicleDetailsDialog: Duplicating vehicle:", vehicle.id);
    setIsDuplicating(true);
    
    try {
      await handleVehicleDuplicate(vehicle);
      
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
  }, [vehicle, handleVehicleDuplicate, queryClient, onClose, isDuplicating, isActionDuplicating]);
  
  // Clear any action request when component unmounts
  useEffect(() => {
    return () => {
      setActionProcessed(false);
    };
  }, []);
  
  // Only attempt automatic duplication for virtual stock vehicles
  useEffect(() => {
    // Only proceed if we haven't processed this action yet and it's not already duplicating
    if (
      requestedAction === 'duplicate' && 
      vehicle && 
      vehicle.id && 
      vehicle.location === 'Stock Virtuale' && 
      !actionProcessed && 
      !isDuplicating && 
      !isActionDuplicating
    ) {
      console.log("Auto-duplicating vehicle based on requestedAction:", vehicle.id);
      setActionProcessed(true);
      handleDuplicate();
    }
  }, [requestedAction, vehicle, handleDuplicate, actionProcessed, isDuplicating, isActionDuplicating]);
  
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
  
  // Return only handleDuplicate for Stock Virtuale
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
    handleDuplicate: vehicle.location === 'Stock Virtuale' ? handleDuplicate : undefined,
  };
}
