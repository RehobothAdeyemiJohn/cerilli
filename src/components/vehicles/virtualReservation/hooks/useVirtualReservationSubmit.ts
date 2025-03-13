
import { Vehicle, VehicleModel } from '@/types';
import { useInventory } from '@/hooks/useInventory';
import { toast } from '@/hooks/use-toast';
import { VirtualReservationFormValues } from '../schema';

export const useVirtualReservationSubmit = (
  vehicle: Vehicle,
  isAdmin: boolean,
  dealerId: string,
  dealerName: string,
  onReservationComplete: () => void,
  calculatedPrice: number,
  filteredDealers: any[]
) => {
  const { handleVehicleUpdate } = useInventory();

  const onSubmit = async (data: VirtualReservationFormValues) => {
    try {
      // Determine dealer ID and name based on user role
      let selectedDealerId = '';
      let selectedDealerName = '';
      
      if (isAdmin) {
        // For admin, use selected dealer from dropdown
        selectedDealerId = (data as any).dealerId;
        const selectedDealer = filteredDealers.find(dealer => dealer.id === selectedDealerId);
        selectedDealerName = selectedDealer ? selectedDealer.companyName : 'Unknown';
      } else {
        // For dealer, use authenticated user's dealer info
        selectedDealerId = dealerId;
        selectedDealerName = dealerName;
      }
      
      const updatedVehicle: Vehicle = {
        ...vehicle,
        status: 'reserved',
        reservedBy: selectedDealerName,
        reservationDestination: data.reservationDestination,
        virtualConfig: {
          trim: data.trim,
          fuelType: data.fuelType,
          exteriorColor: data.exteriorColor,
          transmission: data.transmission,
          accessories: data.accessories,
          price: calculatedPrice
        }
      };
      
      await handleVehicleUpdate(updatedVehicle);
      
      toast({
        title: "Veicolo Virtuale Prenotato",
        description: `${vehicle.model} configurato è stato prenotato per ${selectedDealerName}`,
      });
      
      onReservationComplete();
    } catch (error) {
      console.error('Error reserving virtual vehicle:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la prenotazione del veicolo virtuale",
        variant: "destructive",
      });
    }
  };

  return { onSubmit };
};
