
import { useState } from 'react';
import { Vehicle, Quote } from '@/types';
import { quotesApi } from '@/api/supabase/quotesApi'; // Using Supabase API
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { dealersApi } from '@/api/supabase/dealersApi';

export function useVehicleDetailsDialog(
  vehicle: Vehicle | null,
  onOpenChange: (open: boolean) => void
) {
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [showReserveForm, setShowReserveForm] = useState(false);
  const [showVirtualReserveForm, setShowVirtualReserveForm] = useState(false);
  const [showCancelReservationForm, setShowCancelReservationForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Check if the user is an admin or superadmin
  const isAdmin = user?.role === 'admin' || user?.role === 'superAdmin';

  // Get all available dealers
  const { data: dealers = [] } = useQuery({
    queryKey: ['dealers'],
    queryFn: () => dealersApi.getAll(),
    staleTime: 60000,
  });

  const handleShowQuoteForm = () => {
    setShowQuoteForm(true);
  };
  
  const handleCreateQuote = async (quoteData: any) => {
    if (!vehicle) return;
    
    try {
      setIsSubmitting(true);
      
      // Make sure we have a dealerId - use the first available if none provided
      if (!quoteData.dealerId && dealers.length > 0) {
        quoteData.dealerId = dealers[0].id;
        console.log("Using first available dealer:", quoteData.dealerId);
      }
      
      // If still no dealerId and user has a dealerId, use that
      if (!quoteData.dealerId && user?.dealerId) {
        quoteData.dealerId = user.dealerId;
        console.log("Using user's dealer ID:", quoteData.dealerId);
      }
      
      // If we still don't have a dealerId, show error
      if (!quoteData.dealerId) {
        throw new Error("No dealer available to associate with the quote");
      }
      
      console.log("Creating quote with data:", {
        ...quoteData,
        vehicleId: vehicle.id,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      
      const result = await quotesApi.create({
        ...quoteData,
        status: 'pending' as Quote['status'],
        createdAt: new Date().toISOString(),
        vehicleId: vehicle.id
      });
      
      console.log("Quote created successfully:", result);
      
      await queryClient.invalidateQueries({ queryKey: ['quotes'] });
      
      toast({
        title: "Quote Created",
        description: "The quote has been created successfully",
      });
      
      setShowQuoteForm(false);
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating quote:', error);
      toast({
        title: "Error",
        description: "An error occurred while creating the quote",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelQuote = () => {
    setShowQuoteForm(false);
  };

  const handleReserveVehicle = () => {
    setShowReserveForm(true);
  };

  const handleReserveVirtualVehicle = () => {
    setShowVirtualReserveForm(true);
  };

  const handleCancelReservation = () => {
    setShowReserveForm(false);
    setShowVirtualReserveForm(false);
    setShowCancelReservationForm(false);
  };
  
  const handleShowCancelReservationForm = () => {
    setShowCancelReservationForm(true);
  };
  
  const handleCancelReservationSubmit = async (data?: { cancellationReason: string }) => {
    if (!vehicle) return;
    
    try {
      setIsSubmitting(true);
      
      // If the user is a dealer, they must provide a reason
      if (!isAdmin && (!data || !data.cancellationReason)) {
        toast({
          title: "Errore",
          description: "È necessario fornire una motivazione per cancellare la prenotazione",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      // Create a copy of the vehicle and restore it to available status
      const updatedVehicle: Vehicle = {
        ...vehicle,
        status: 'available',
        reservedBy: undefined,
        reservedAccessories: [],
        virtualConfig: vehicle.location === 'Stock Virtuale' ? undefined : vehicle.virtualConfig,
        reservationDestination: undefined
      };
      
      // Get the inventory hook to update the vehicle
      const { handleVehicleUpdate } = await import('@/hooks/useInventory').then(module => ({ handleVehicleUpdate: module.useInventory().handleVehicleUpdate }));
      
      await handleVehicleUpdate(updatedVehicle);
      
      // Log the cancellation reason if provided
      if (data?.cancellationReason) {
        console.log("Reservation canceled with reason:", data.cancellationReason);
      }
      
      await queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      
      toast({
        title: "Prenotazione Cancellata",
        description: `La prenotazione per ${vehicle.model} ${vehicle.trim || ''} è stata cancellata.`,
      });
      
      setShowCancelReservationForm(false);
      onOpenChange(false);
    } catch (error) {
      console.error('Error canceling reservation:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la cancellazione della prenotazione",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    showQuoteForm,
    showReserveForm,
    showVirtualReserveForm,
    showCancelReservationForm,
    isSubmitting,
    user,
    handleShowQuoteForm,
    handleCreateQuote,
    handleCancelQuote,
    handleReserveVehicle,
    handleReserveVirtualVehicle,
    handleCancelReservation,
    handleShowCancelReservationForm,
    handleCancelReservationSubmit
  };
}
