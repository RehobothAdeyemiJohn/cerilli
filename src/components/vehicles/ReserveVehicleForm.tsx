
import React, { useState, useEffect } from 'react';
import { Vehicle, Accessory } from '@/types';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { dealers } from '@/data/mockData';
import { accessoriesApi } from '@/api/localStorage';
import { vehiclesApi } from '@/api/localStorage';
import { toast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useInventory } from '@/hooks/useInventory';

const reservationSchema = z.object({
  dealerId: z.string().min(1, { message: "È necessario selezionare un concessionario" }),
  accessories: z.array(z.string()).optional(),
});

type ReservationFormValues = z.infer<typeof reservationSchema>;

interface ReserveVehicleFormProps {
  vehicle: Vehicle;
  onCancel: () => void;
  onReservationComplete: () => void;
}

const ReserveVehicleForm = ({ vehicle, onCancel, onReservationComplete }: ReserveVehicleFormProps) => {
  const [compatibleAccessories, setCompatibleAccessories] = useState<Accessory[]>([]);
  const [isAdmin, setIsAdmin] = useState(true); // For now, assume admin, in real app get from auth
  const [dealerName, setDealerName] = useState<string>(''); // For dealer view, get from auth
  const queryClient = useQueryClient();
  const { handleVehicleUpdate } = useInventory();
  
  // Get all compatible accessories for this vehicle model
  const { data: accessories = [] } = useQuery({
    queryKey: ['accessories'],
    queryFn: accessoriesApi.getAll
  });

  const activeDealers = dealers.filter(dealer => dealer.isActive);
  
  const form = useForm<ReservationFormValues>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      dealerId: '',
      accessories: [],
    },
  });

  // Get compatible accessories for this vehicle model
  useEffect(() => {
    const fetchCompatibleAccessories = async () => {
      try {
        // In a real implementation, you'd get the modelId and trimId
        // Here we're simplifying by using all accessories
        setCompatibleAccessories(accessories);
      } catch (error) {
        console.error('Error fetching compatible accessories:', error);
      }
    };
    
    fetchCompatibleAccessories();
  }, [accessories]);

  const onSubmit = async (data: ReservationFormValues) => {
    try {
      // Get dealer name for display
      const selectedDealer = activeDealers.find(dealer => dealer.id === data.dealerId);
      const dealerDisplayName = selectedDealer ? selectedDealer.companyName : dealerName || 'Unknown';
      
      // Update vehicle status to reserved
      const updatedVehicle: Vehicle = {
        ...vehicle,
        status: 'reserved',
        reservedBy: dealerDisplayName,
        reservedAccessories: data.accessories || [],
      };
      
      await handleVehicleUpdate(updatedVehicle);
      
      toast({
        title: "Veicolo Prenotato",
        description: `${vehicle.model} ${vehicle.trim} è stato prenotato per ${dealerDisplayName}`,
      });
      
      onReservationComplete();
    } catch (error) {
      console.error('Error reserving vehicle:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la prenotazione del veicolo",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <h3 className="text-lg font-medium">Prenota {vehicle.model} {vehicle.trim}</h3>
        
        {isAdmin && (
          <FormField
            control={form.control}
            name="dealerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Concessionario</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona un concessionario" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {activeDealers.map(dealer => (
                      <SelectItem key={dealer.id} value={dealer.id}>
                        {dealer.companyName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        )}
        
        {compatibleAccessories.length > 0 && (
          <div className="space-y-2">
            <FormLabel>Optional Disponibili</FormLabel>
            <div className="grid grid-cols-2 gap-2 border rounded-md p-3">
              {compatibleAccessories.map((accessory) => (
                <FormField
                  key={accessory.id}
                  control={form.control}
                  name="accessories"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(accessory.name)}
                          onCheckedChange={(checked) => {
                            const currentValue = [...(field.value || [])];
                            if (checked) {
                              field.onChange([...currentValue, accessory.name]);
                            } else {
                              field.onChange(currentValue.filter(value => value !== accessory.name));
                            }
                          }}
                        />
                      </FormControl>
                      <FormLabel className="font-normal text-sm">
                        {accessory.name}
                      </FormLabel>
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </div>
        )}
        
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Annulla
          </Button>
          <Button type="submit">
            Conferma Prenotazione
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ReserveVehicleForm;
