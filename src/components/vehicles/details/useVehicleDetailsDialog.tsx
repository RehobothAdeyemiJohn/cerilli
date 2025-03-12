
import { useState } from 'react';
import { Vehicle, Quote } from '@/types';
import { quotesApi } from '@/api/supabase/quotesApi';
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

  // Ottieni il primo dealer disponibile come fallback
  const { data: dealers = [] } = useQuery({
    queryKey: ['dealers-fallback'],
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
      
      // Per il dealerId, usiamo un UUID valido
      let dealerId: string | null = null;
      
      // Se l'utente è admin o superadmin, usa il primo dealer disponibile
      if (isAdmin && dealers.length > 0) {
        dealerId = dealers[0].id;
      } else {
        // Altrimenti usa la logica esistente
        dealerId = user?.dealerId;
        
        // Se l'utente non ha un dealerId, usa quello dal form o prendi il primo dealer disponibile
        if (!dealerId) {
          dealerId = quoteData.dealerId || (dealers.length > 0 ? dealers[0].id : null);
        }
      }
      
      // Se ancora non abbiamo un dealerId, mostra un errore
      if (!dealerId) {
        throw new Error("Nessun dealer disponibile per associare il preventivo");
      }
      
      console.log("Creazione preventivo con dealerId:", dealerId);
      
      await quotesApi.create({
        ...quoteData,
        status: 'pending' as Quote['status'],
        createdAt: new Date().toISOString(),
        dealerId: dealerId,
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
