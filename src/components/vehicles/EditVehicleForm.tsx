import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Vehicle } from '@/types';

const vehicleSchema = z.object({
  model: z.string().min(2, { message: "Il modello deve avere almeno 2 caratteri." }),
  trim: z.string().min(1, { message: "L'allestimento è obbligatorio." }),
  fuelType: z.string().min(1, { message: "Il tipo di alimentazione è obbligatorio." }),
  exteriorColor: z.string().min(1, { message: "Il colore esterno è obbligatorio." }),
  price: z.coerce.number().positive({ message: "Il prezzo deve essere un numero positivo." }),
  location: z.string().min(1, { message: "La posizione è obbligatoria." }),
  accessories: z.string().optional(),
  transmission: z.string().min(1, { message: "Il tipo di cambio è obbligatorio." }),
  status: z.enum(["available", "reserved", "sold"]),
  telaio: z.string().min(5, { message: "Il numero di telaio deve avere almeno 5 caratteri." })
});

type VehicleFormValues = z.infer<typeof vehicleSchema>;

interface EditVehicleFormProps {
  vehicle: Vehicle;
  onComplete: (vehicle: Vehicle) => void;
  onCancel: () => void;
}

const EditVehicleForm = ({ vehicle, onComplete, onCancel }: EditVehicleFormProps) => {
  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      model: vehicle.model,
      trim: vehicle.trim,
      fuelType: vehicle.fuelType,
      exteriorColor: vehicle.exteriorColor,
      price: vehicle.price,
      location: vehicle.location,
      accessories: vehicle.accessories.join(', '),
      transmission: vehicle.transmission || 'Manuale',
      status: vehicle.status,
      telaio: vehicle.telaio || '',
    },
  });

  const onSubmit = (data: VehicleFormValues) => {
    const accessoriesArray = data.accessories ? 
      data.accessories.split(',').map(item => item.trim()) : 
      [];
    
    const updatedVehicle: Vehicle = {
      ...vehicle,
      ...data,
      accessories: accessoriesArray,
    };
    
    console.log('Vehicle updated:', updatedVehicle);
    onComplete(updatedVehicle);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Modello</FormLabel>
                <FormControl>
                  <Input placeholder="es. Cirelli 500" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="trim"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Allestimento</FormLabel>
                <FormControl>
                  <Input placeholder="es. Sport" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="telaio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Numero Telaio</FormLabel>
                <FormControl>
                  <Input placeholder="es. WBA12345678901234" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="fuelType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alimentazione</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona il tipo di alimentazione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Benzina">Benzina</SelectItem>
                    <SelectItem value="Gpl">Gpl</SelectItem>
                    <SelectItem value="Mhev">Mhev</SelectItem>
                    <SelectItem value="Mhev Gpl">Mhev Gpl</SelectItem>
                    <SelectItem value="Phev">Phev</SelectItem>
                    <SelectItem value="EV">EV</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="exteriorColor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Colore Esterno</FormLabel>
                <FormControl>
                  <Input placeholder="es. Rosso Racing" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prezzo (€)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="100" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Posizione</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona la posizione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Main Warehouse">Magazzino Principale</SelectItem>
                    <SelectItem value="North Branch">Filiale Nord</SelectItem>
                    <SelectItem value="South Branch">Filiale Sud</SelectItem>
                    <SelectItem value="East Branch">Filiale Est</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stato</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona lo stato" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="available">Disponibile</SelectItem>
                    <SelectItem value="reserved">Prenotato</SelectItem>
                    <SelectItem value="sold">Venduto</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="accessories"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Accessori (separati da virgola)</FormLabel>
              <FormControl>
                <Input placeholder="es. Sistema di Navigazione, Sedili in Pelle, Audio Premium" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-4 pt-4">
          <button 
            type="button" 
            onClick={onCancel}
            className="px-4 py-2 border border-gray-200 rounded-md hover:bg-gray-50"
          >
            Annulla
          </button>
          <button 
            type="submit"
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Aggiorna Veicolo
          </button>
        </div>
      </form>
    </Form>
  );
};

export default EditVehicleForm;
