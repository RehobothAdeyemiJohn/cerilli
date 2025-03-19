
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UseFormReturn } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { ordersApi, vehiclesApi } from '@/api/supabase';
import { toast } from '@/hooks/use-toast';
import { Vehicle, Order } from '@/types';
import { VirtualReservationFormValues } from '../schema';

interface UseVirtualReservationSubmitProps {
  form: UseFormReturn<VirtualReservationFormValues>;
  vehicle: Vehicle;
  calculatedPrice: number;
  onClose: () => void;
  dealers: { id: string; companyName: string }[];
  accessoriesTotal: number;
  selectedAccessories: string[];
}

export const useVirtualReservationSubmit = ({
  form,
  vehicle,
  calculatedPrice,
  onClose,
  dealers,
  accessoriesTotal,
  selectedAccessories
}: UseVirtualReservationSubmitProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: Omit<Order, 'id'>) => {
      return ordersApi.create(orderData);
    },
    onSuccess: () => {
      toast({
        title: "Configurazione riservata",
        description: "La configurazione è stata riservata con successo"
      });
      
      setTimeout(() => {
        onClose();
        navigate('/orders');
      }, 2000);
    },
    onError: (error) => {
      console.error('Error creating order:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la prenotazione. Riprova più tardi.",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  });

  const updateVehicleMutation = useMutation({
    mutationFn: async (vehicleData: Vehicle) => {
      return vehiclesApi.update(vehicleData.id, vehicleData);
    },
    onSuccess: () => {
      console.log('Vehicle updated successfully');
    },
    onError: (error) => {
      console.error('Error updating vehicle:', error);
    }
  });
  
  const handleSubmit = async (values: VirtualReservationFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Find the dealer info
      const dealer = dealers.find(d => d.id === values.dealerId);
      
      if (!dealer) {
        throw new Error("Dealer information not found");
      }
      
      // Create an updated vehicle object with reservation info
      const updatedVehicle: Vehicle = {
        ...vehicle,
        status: 'reserved',
        reservedBy: values.dealerId,
        reservedAccessories: selectedAccessories,
        reservationDestination: values.destination || undefined,
        reservationTimestamp: new Date().toISOString(),
        virtualConfig: {
          trim: values.trim || '',
          fuelType: values.fuelType || '',
          exteriorColor: values.exteriorColor || '',
          transmission: values.transmission || '',
          accessories: selectedAccessories,
          price: calculatedPrice
        }
      };
      
      // Update the vehicle first
      await updateVehicleMutation.mutateAsync(updatedVehicle);
      
      // Then create the order
      const orderData = {
        vehicleId: vehicle.id,
        dealerId: values.dealerId,
        customerName: values.customer || 'Cliente da confermare',
        status: 'processing' as 'processing' | 'delivered' | 'cancelled', // Fixed typecasting
        orderDate: new Date().toISOString(),
        price: calculatedPrice,
        dealerName: dealer.companyName,
        modelName: vehicle.model,
        plafondDealer: dealer.nuovoPlafond, // Just pass it through
        isLicensable: false,
        hasProforma: false,
        isPaid: false,
        isInvoiced: false,
        hasConformity: false,
        odlGenerated: false,
        transportCosts: 0,
        restorationCosts: 0
      };
      
      await createOrderMutation.mutateAsync(orderData);
      
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'elaborazione della richiesta.",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  };
  
  return {
    handleSubmit: form.handleSubmit(handleSubmit),
    isSubmitting: isSubmitting || createOrderMutation.isPending || updateVehicleMutation.isPending
  };
};
