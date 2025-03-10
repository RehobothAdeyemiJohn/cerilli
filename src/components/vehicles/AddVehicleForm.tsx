import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
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
  status: z.enum(["available", "reserved", "sold"])
});

type VehicleFormValues = z.infer<typeof vehicleSchema>;

interface AddVehicleFormProps {
  onComplete: (newVehicle: Vehicle | null) => void;
}

const AddVehicleForm = ({ onComplete }: AddVehicleFormProps) => {
  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      model: '',
      trim: '',
      fuelType: '',
      exteriorColor: '',
      price: 0,
      location: '',
      accessories: '',
      transmission: '',
      status: 'available',
    },
  });

  const onSubmit = (data: VehicleFormValues) => {
    const accessoriesArray = data.accessories ? 
      data.accessories.split(',').map(item => item.trim()) : 
      [];
    
    const newVehicle: Vehicle = {
      id: String(Date.now()),
      model: data.model,
      trim: data.trim,
      fuelType: data.fuelType,
      exteriorColor: data.exteriorColor,
      price: data.price,
      location: data.location,
      accessories: accessoriesArray,
      status: data.status,
      dateAdded: new Date().toISOString().split('T')[0],
      transmission: data.transmission,
    };
    
    console.log('Nuovo veicolo creato:', newVehicle);
    toast({ 
      title: "Veicolo Aggiunto", 
      description: `${data.model} ${data.trim} è stato aggiunto all'inventario.`,
    });
    
    onComplete(newVehicle);
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
          
          <FormField
            control={form.control}
            name="transmission"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cambio</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona il tipo di cambio" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Manuale">Manuale</SelectItem>
                    <SelectItem value="Automatico CVT 6">Automatico CVT 6</SelectItem>
                    <SelectItem value="Automatico DCT 7">Automatico DCT 7</SelectItem>
                    <SelectItem value="Automatico DCT 8">Automatico DCT 8</SelectItem>
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
            onClick={() => onComplete(null)}
            className="px-4 py-2 border border-gray-200 rounded-md hover:bg-gray-50"
          >
            Annulla
          </button>
          <button 
            type="submit"
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Aggiungi Veicolo
          </button>
        </div>
      </form>
    </Form>
  );
};

export default AddVehicleForm;
