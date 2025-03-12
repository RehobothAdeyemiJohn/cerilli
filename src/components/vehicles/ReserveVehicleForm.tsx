
import React, { useState, useEffect } from 'react';
import { Vehicle, Accessory } from '@/types';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { accessoriesApi } from '@/api/localStorage';
import { toast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { useInventory } from '@/hooks/useInventory';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency } from '@/lib/utils';
import { dealersApi } from '@/api/supabase/dealersApi';

// Dynamic schema based on user type (admin or dealer)
const createReservationSchema = (isAdmin: boolean) => {
  const baseSchema = {
    accessories: z.array(z.string()).optional(),
    destination: z.string({
      required_error: "La destinazione è obbligatoria",
    }),
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
  destination: string;
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

  // Fetch active dealers from Supabase
  const { data: supabaseDealers = [], isLoading: isLoadingDealers } = useQuery({
    queryKey: ['dealers'],
    queryFn: dealersApi.getAll
  });

  // Filter active dealers
  const activeDealers = supabaseDealers.filter(dealer => dealer.isActive);
  
  // Create schema based on user type
  const reservationSchema = createReservationSchema(isAdmin);
  
  // Default form values
  const defaultValues: ReservationFormValues = {
    accessories: [],
    destination: '',
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
          
          // Filter out accessories that are already included in the vehicle
          const filteredAccessories = compatibles.filter(accessory => 
            !vehicle.accessories.includes(accessory.name)
          );
          
          setCompatibleAccessories(filteredAccessories);
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
        reservationDestination: data.destination,
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
        
        {/* Vehicle details section */}
        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <h4 className="text-sm font-medium mb-2">Dettagli del veicolo e optional inclusi</h4>
          <div className="grid grid-cols-3 gap-2 mb-2">
            <div>
              <p className="text-xs text-gray-500">Modello</p>
              <p className="font-medium">{vehicle.model}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Allestimento</p>
              <p className="font-medium">{vehicle.trim}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Colore</p>
              <p className="font-medium">{vehicle.exteriorColor}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Prezzo</p>
              <p className="font-medium text-primary">{formatCurrency(vehicle.price)}</p>
            </div>
            {vehicle.transmission && (
              <div>
                <p className="text-xs text-gray-500">Cambio</p>
                <p className="font-medium">{vehicle.transmission}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-500">Carburante</p>
              <p className="font-medium">{vehicle.fuelType}</p>
            </div>
            {vehicle.telaio && (
              <div>
                <p className="text-xs text-gray-500">Telaio</p>
                <p className="font-medium">{vehicle.telaio}</p>
              </div>
            )}
            {vehicle.year && (
              <div>
                <p className="text-xs text-gray-500">Anno</p>
                <p className="font-medium">{vehicle.year}</p>
              </div>
            )}
          </div>
          
          {vehicle.accessories && vehicle.accessories.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-gray-500 mb-1">Optional Inclusi</p>
              <div className="grid grid-cols-2 gap-1">
                {vehicle.accessories.map((accessory, idx) => (
                  <div key={idx} className="text-xs flex items-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary mr-1"></span>
                    {accessory}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
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
        
        {/* Destination field */}
        <FormField
          control={form.control}
          name="destination"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Destinazione</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona destinazione" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="contratto_abbinato">Contratto Abbinato</SelectItem>
                  <SelectItem value="stock_dealer">Stock Dealer</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        
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
                        {accessory.priceWithVAT > 0 && (
                          <span className="ml-1 text-xs text-gray-500">
                            (+{formatCurrency(accessory.priceWithVAT)})
                          </span>
                        )}
                      </FormLabel>
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </div>
        )}
        
        <div className="flex justify-end gap-2 pt-4 border-t">
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
