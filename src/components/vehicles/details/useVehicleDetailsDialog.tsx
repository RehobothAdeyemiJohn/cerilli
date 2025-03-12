
import { useState } from 'react';
import { Vehicle, Quote } from '@/types';
import { quotesApi } from '@/api/localStorage/quotesApi'; // Change to localStorage API
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Check if the user is an admin or superadmin
  const isAdmin = user?.role === 'admin' || user?.role === 'superAdmin';

  // Ottieni tutti i dealer disponibili
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
      
      // Verifica se abbiamo un dealerId valido
      if (!quoteData.dealerId && dealers.length > 0) {
        quoteData.dealerId = dealers[0].id;
        console.log("Usando il primo dealer disponibile:", quoteData.dealerId);
      }
      
      // Se ancora non abbiamo un dealerId, mostra un errore
      if (!quoteData.dealerId) {
        throw new Error("Nessun dealer disponibile per associare il preventivo");
      }
      
      console.log("Creazione preventivo con:", quoteData);
      
      await quotesApi.create({
        ...quoteData,
        status: 'pending' as Quote['status'],
        createdAt: new Date().toISOString(),
        vehicleId: vehicle.id
      });
      
      await queryClient.invalidateQueries({ queryKey: ['quotes'] });
      
      toast({
        title: "Preventivo Creato",
        description: "Il preventivo è stato creato con successo",
      });
      
      setShowQuoteForm(false);
      onOpenChange(false);
    } catch (error) {
      console.error('Errore durante la creazione del preventivo:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la creazione del preventivo",
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
  };

  return {
    showQuoteForm,
    showReserveForm,
    showVirtualReserveForm,
    isSubmitting,
    user,
    handleShowQuoteForm,
    handleCreateQuote,
    handleCancelQuote,
    handleReserveVehicle,
    handleReserveVirtualVehicle,
    handleCancelReservation
  };
}
