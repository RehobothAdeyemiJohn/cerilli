
import { Vehicle } from '@/types';
import { useInventory } from '@/hooks/useInventory';
import { toast } from '@/hooks/use-toast';
import { VirtualReservationFormValues } from '../schema';

const calculateEstimatedArrivalDays = (stockLocation: string | undefined): number => {
  // For a virtual vehicle, we'll get the original stock from the vehicle, 
  // not from the form anymore (since we removed that field)
  if (!stockLocation) return 120; // Default to longest time if unknown
  
  // Different arrival time estimates based on the original stock location
  if (stockLocation === 'Germania') {
    // Germany stock: 38-52 days
    return Math.floor(Math.random() * (52 - 38 + 1)) + 38;
  } else {
    // China stock (default): 90-120 days
    return Math.floor(Math.random() * (120 - 90 + 1)) + 90;
  }
};

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
      
      // Use original stock from the vehicle (not from the form)
      const originalStock = vehicle.originalStock;
      
      // Calculate estimated arrival days based on original stock
      const estimatedArrivalDays = calculateEstimatedArrivalDays(originalStock);
      
      console.log("Submitting virtual reservation with originalStock:", originalStock);
      console.log("Estimated arrival days:", estimatedArrivalDays);
      console.log("Calculated price:", calculatedPrice);
      
      const updatedVehicle: Vehicle = {
        ...vehicle,
        status: 'reserved',
        reservedBy: selectedDealerName,
        reservationDestination: data.reservationDestination,
        reservationTimestamp: new Date().toISOString(),
        originalStock: originalStock,
        estimatedArrivalDays: estimatedArrivalDays,
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
