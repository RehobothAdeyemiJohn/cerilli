import { useState } from 'react';
import { Vehicle, Quote } from '@/types';
import { quotesApi } from '@/api/supabase/quotesApi';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { dealersApi } from '@/api/supabase/dealersApi';
import { vehiclesApi } from '@/api/supabase/vehiclesApi';
import { ordersApi } from '@/api/supabase/ordersApi';
import { supabase } from '@/api/supabase/client';

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

  const isAdmin = user?.role === 'admin' || user?.role === 'superAdmin';

  const { data: dealers = [] } = useQuery({
    queryKey: ['dealers'],
    queryFn: () => dealersApi.getAll(),
    staleTime: 0, // Set to 0 to always consider data stale
  });

  const handleShowQuoteForm = () => {
    setShowQuoteForm(true);
  };

  const handleCreateQuote = async (quoteData: any) => {
    if (!vehicle) return;
    
    try {
      setIsSubmitting(true);
      
      if (!quoteData.dealerId && dealers.length > 0) {
        quoteData.dealerId = dealers[0].id;
        console.log("Using first available dealer:", quoteData.dealerId);
      }
      
      if (!quoteData.dealerId && user?.dealerId) {
        quoteData.dealerId = user.dealerId;
        console.log("Using user's dealer ID:", quoteData.dealerId);
      }
      
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
      await queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      
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
  
  const handleCancelReservationSubmit = async () => {
    if (!vehicle) return;
    
    try {
      setIsSubmitting(true);
      
      const updatedVehicle: Vehicle = {
        ...vehicle,
        status: 'available',
        reservedBy: undefined,
        reservedAccessories: [],
        virtualConfig: vehicle.location === 'Stock Virtuale' ? undefined : vehicle.virtualConfig,
        reservationDestination: undefined,
        reservationTimestamp: undefined
      };
      
      await vehiclesApi.update(vehicle.id, updatedVehicle);
      
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

  const handleTransformToOrder = async (): Promise<void> => {
    if (!vehicle) {
      console.error("No vehicle provided for transformation");
      return Promise.reject(new Error("No vehicle provided"));
    }
    
    console.log("Beginning transformation process for vehicle:", vehicle.id);
    
    try {
      if (vehicle.status !== 'reserved') {
        console.error("Vehicle not in reserved status:", vehicle.status);
        toast({
          title: "Errore",
          description: "Solo i veicoli prenotati possono essere trasformati in ordini",
          variant: "destructive",
        });
        return Promise.reject(new Error("Vehicle not in reserved status"));
      }
      
      console.log("Checking current vehicle status in database...");
      
      // Double-check the vehicle status to prevent race conditions
      const { data: currentVehicle, error: fetchError } = await supabase
        .from('vehicles')
        .select('status')
        .eq('id', vehicle.id)
        .maybeSingle();
      
      if (fetchError) {
        console.error("Error checking vehicle status:", fetchError);
        throw new Error("Error checking vehicle status");
      }
      
      if (!currentVehicle) {
        console.error("Vehicle not found in database");
        throw new Error("Vehicle not found in database");
      }
      
      if (currentVehicle.status === 'ordered') {
        console.log("Vehicle already ordered, skipping transformation");
        toast({
          title: "Avviso",
          description: "Questo veicolo è già stato trasformato in ordine",
        });
        return Promise.resolve();
      }
      
      if (currentVehicle.status !== 'reserved') {
        console.error("Vehicle no longer in reserved status:", currentVehicle.status);
        throw new Error(`Vehicle in invalid status: ${currentVehicle.status}`);
      }
      
      console.log("Transforming vehicle to ordered status:", vehicle.id);
      
      // Perform the update to make the vehicle 'ordered'
      await vehiclesApi.transformToOrder(vehicle.id);
      
      console.log("Vehicle status updated successfully to ordered");
      
      // Only after successful vehicle status update, create the order
      if (vehicle.reservedBy) {
        const dealerId = user?.dealerId || (dealers.length > 0 ? dealers[0].id : null);
        
        if (!dealerId) {
          console.error("No dealer ID available for order creation");
          toast({
            title: "Avviso",
            description: "Veicolo ordinato ma non è stato possibile creare il record dell'ordine: nessun concessionario disponibile",
          });
          
          // Still consider this a success since the vehicle status was updated
          await queryClient.invalidateQueries({ queryKey: ['vehicles'] });
          return Promise.resolve();
        }
        
        console.log("Creating order record with data:", {
          vehicleId: vehicle.id,
          dealerId,
          customerName: vehicle.reservedBy
        });
        
        try {
          // Create the order record
          const orderData = {
            vehicleId: vehicle.id,
            dealerId,
            customerName: vehicle.reservedBy,
            status: 'processing',
            orderDate: new Date().toISOString()
          };
          
          const createdOrder = await ordersApi.create(orderData);
          console.log("Order created successfully:", createdOrder);
        } catch (orderError) {
          console.error("Error creating order record:", orderError);
          toast({
            title: "Avviso",
            description: "Veicolo ordinato ma si è verificato un errore nella creazione del record dell'ordine",
          });
          
          // Still consider this a success since the vehicle status was updated
          await queryClient.invalidateQueries({ queryKey: ['vehicles'] });
          return Promise.resolve();
        }
      }
      
      // Update queries with staleTime: 0 to force a refresh
      console.log("Refreshing data queries...");
      await queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      await queryClient.invalidateQueries({ queryKey: ['orders'] });
      
      console.log("Transformation process completed successfully");
      return Promise.resolve();
    } catch (error) {
      console.error('Error in transform to order process:', error);
      throw error;
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
    handleCancelReservationSubmit,
    handleTransformToOrder
  };
}
