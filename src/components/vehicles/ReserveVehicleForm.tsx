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
import { useAuth } from '@/context/AuthContext';

// Dynamic schema based on user type (admin or dealer)
const createReservationSchema = (isAdmin: boolean) => {
  const baseSchema = {
    accessories: z.array(z.string()).optional(),
  };
  
  // Only admins need to select the dealer
  if (isAdmin) {
    return z.object({
      ...baseSchema,
      dealerId: z.string().min(1, { message: "È necessario selezionare un concessionario" }),
    });
  }
  
  return z.object(baseSchema);
};

// This type definition now explicitly allows for both base fields and optional dealerId
type ReservationFormValues = z.infer<ReturnType<typeof createReservationSchema>> & {
  dealerId?: string;
  accessories?: string[];
};

interface ReserveVehicleFormProps {
  vehicle: Vehicle;
  onCancel: () => void;
  onReservationComplete: () => void;
}

const ReserveVehicleForm = ({ vehicle, onCancel, onReservationComplete }: ReserveVehicleFormProps) => {
  const [compatibleAccessories, setCompatibleAccessories] = useState<Accessory[]>([]);
  const { user } = useAuth();
  const isAdmin = user?.type === 'admin';
  const dealerId = user?.dealerId || '';
  const dealerName = user?.dealerName || '';
  const queryClient = useQueryClient();
  const { handleVehicleUpdate } = useInventory();
  
  // Get all accessories
  const { data: accessories = [] } = useQuery({
    queryKey: ['accessories'],
    queryFn: accessoriesApi.getAll
  });

  // Get vehicle model and trim from models and trims data
  const { data: models = [] } = useQuery({
    queryKey: ['models'],
    queryFn: () => import('@/api/localStorage').then(api => api.modelsApi.getAll())
  });

  const { data: trims = [] } = useQuery({
    queryKey: ['trims'],
    queryFn: () => import('@/api/localStorage').then(api => api.trimsApi.getAll())
  });

  const activeDealers = dealers.filter(dealer => dealer.isActive);
  
  // Create schema based on user type
  const reservationSchema = createReservationSchema(isAdmin);
  
  // Default form values
  const defaultValues: any = {
    accessories: [],
  };
  
  // If dealer, no need to select a dealerId
  if (isAdmin) {
    defaultValues.dealerId = '';
  }
  
  const form = useForm<ReservationFormValues>({
    resolver: zodResolver(reservationSchema),
    defaultValues,
  });

  // Get compatible accessories for this vehicle model/trim
  useEffect(() => {
    const fetchCompatibleAccessories = async () => {
      try {
        if (!vehicle.model || !vehicle.trim) {
          setCompatibleAccessories([]);
          return;
        }

        // Find model and trim IDs
        const modelObj = models.find(m => m.name === vehicle.model);
        const trimObj = trims.find(t => t.name === vehicle.trim);

        if (modelObj && trimObj) {
          const compatibles = await accessoriesApi.getCompatible(modelObj.id, trimObj.id);
          setCompatibleAccessories(compatibles);
        } else {
          setCompatibleAccessories([]);
        }
      } catch (error) {
        console.error('Error fetching compatible accessories:', error);
        setCompatibleAccessories([]);
      }
    };
    
    fetchCompatibleAccessories();
  }, [vehicle, accessories, models, trims]);

  const onSubmit = async (data: ReservationFormValues) => {
    try {
      // Determine dealer ID and name based on user role
      let selectedDealerId = '';
      let selectedDealerName = '';
      
      if (isAdmin) {
        // For admin, use selected dealer from dropdown
        selectedDealerId = data.dealerId as string;
        const selectedDealer = activeDealers.find(dealer => dealer.id === selectedDealerId);
        selectedDealerName = selectedDealer ? selectedDealer.companyName : 'Unknown';
      } else {
        // For dealer, use authenticated user's dealer info
        selectedDealerId = dealerId;
        selectedDealerName = dealerName;
      }
      
      // Update vehicle status to reserved
      const updatedVehicle: Vehicle = {
        ...vehicle,
        status: 'reserved',
        reservedBy: selectedDealerName,
        reservedAccessories: data.accessories || [],
      };
      
      await handleVehicleUpdate(updatedVehicle);
      
      toast({
        title: "Veicolo Prenotato",
        description: `${vehicle.model} ${vehicle.trim} è stato prenotato per ${selectedDealerName}`,
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
            name={"dealerId" as any}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Concessionario</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value as string}
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
