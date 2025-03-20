import { useState } from 'react';
import { Vehicle, Quote, Order } from '@/types';
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
  const [isTransforming, setIsTransforming] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const isAdmin = user?.role === 'admin' || user?.role === 'superAdmin';
  const isVirtualStock = vehicle?.location === 'Stock Virtuale';

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
      toast({
        title: "Errore",
        description: "Nessun veicolo selezionato",
        variant: "destructive",
      });
      return;
    }
    
    if (isTransforming) {
      console.log("Already transforming, ignoring click");
      return;
    }
    
    try {
      setIsTransforming(true);
      console.log("Beginning transformation process for vehicle:", vehicle.id);
      
      if (vehicle.status !== 'reserved') {
        toast({
          title: "Errore",
          description: "Solo i veicoli prenotati possono essere trasformati in ordini",
          variant: "destructive",
        });
        return;
      }
      
      let dealerId = null;
      let dealerName = vehicle.reservedBy || '';
      
      if (dealerName) {
        const dealer = dealers.find(d => d.companyName === dealerName);
        if (dealer) {
          dealerId = dealer.id;
          console.log("Found dealer by name:", dealerName, "with ID:", dealerId);
        } else {
          console.log("Dealer not found by name, checking all dealers...");
          for (const d of dealers) {
            if (dealerName.includes(d.companyName) || d.companyName.includes(dealerName)) {
              dealerId = d.id;
              dealerName = d.companyName;
              console.log("Found similar dealer:", dealerName, "with ID:", dealerId);
              break;
            }
          }
        }
      }
      
      if (!dealerId) {
        if (user?.dealerId) {
          dealerId = user.dealerId;
          const userDealer = dealers.find(d => d.id === dealerId);
          if (userDealer) {
            dealerName = userDealer.companyName;
          }
          console.log("Using user's dealer ID:", dealerId);
        } else if (dealers.length > 0) {
          dealerId = dealers[0].id;
          dealerName = dealers[0].companyName;
          console.log("Using first available dealer:", dealerId);
        }
      }
      
      if (!dealerId) {
        throw new Error("Nessun concessionario disponibile per creare l'ordine");
      }
      
      const price = vehicle.virtualConfig?.price || vehicle.price || 0;
      
      const { data: orderData, error: orderError } = await supabase.rpc(
        'insert_order',
        {
          p_vehicleid: vehicle.id,
          p_dealerid: dealerId,
          p_customername: dealerName,
          p_status: 'processing',
          p_orderdate: new Date().toISOString()
        }
      );
      
      if (orderError) {
        console.error("Error creating order:", orderError);
        throw new Error(`Errore durante la creazione dell'ordine: ${orderError.message}`);
      }
      
      console.log("Order created successfully with ID:", orderData);
      
      await vehiclesApi.update(vehicle.id, {
        status: 'ordered'
      });
      
      console.log("Vehicle status updated to ordered");
      
      await queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      await queryClient.invalidateQueries({ queryKey: ['orders'] });
      
      toast({
        title: "Ordine Creato",
        description: `L'ordine per ${vehicle.model} è stato creato con successo`,
      });
      
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error in transform to order process:', error);
      toast({
        title: "Errore",
        description: error.message || "Si è verificato un errore durante la trasformazione in ordine",
        variant: "destructive",
      });
    } finally {
      setIsTransforming(false);
    }
  };

  return {
    showQuoteForm,
    showReserveForm,
    showVirtualReserveForm,
    showCancelReservationForm,
    isSubmitting,
    isTransforming,
    user,
    isVirtualStock,
    handleShowQuoteForm,
    handleCreateQuote,
    handleCancelQuote: () => setShowQuoteForm(false),
    handleReserveVehicle: () => setShowReserveForm(true),
    handleReserveVirtualVehicle: () => setShowVirtualReserveForm(true),
    handleCancelReservation: () => {
      setShowReserveForm(false);
      setShowVirtualReserveForm(false);
      setShowCancelReservationForm(false);
    },
    handleShowCancelReservationForm: () => setShowCancelReservationForm(true),
    handleCancelReservationSubmit,
    handleTransformToOrder
  };
}
