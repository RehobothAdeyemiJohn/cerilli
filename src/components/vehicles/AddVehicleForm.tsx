
import React, { useEffect, useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Vehicle } from '@/types';
import { vehiclesApi, modelsApi, trimsApi, fuelTypesApi, colorsApi, transmissionsApi } from '@/api/localStorage';
import { useQuery } from '@tanstack/react-query';

const vehicleSchema = z.object({
  model: z.string().min(1, { message: "Il modello è obbligatorio." }),
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

interface AddVehicleFormProps {
  onComplete: (newVehicle: Vehicle | null) => void;
}

const AddVehicleForm = ({ onComplete }: AddVehicleFormProps) => {
  const { data: models = [] } = useQuery({
    queryKey: ['models'],
    queryFn: modelsApi.getAll
  });

  const { data: trims = [] } = useQuery({
    queryKey: ['trims'],
    queryFn: trimsApi.getAll
  });

  const { data: fuelTypes = [] } = useQuery({
    queryKey: ['fuelTypes'],
    queryFn: fuelTypesApi.getAll
  });

  const { data: colors = [] } = useQuery({
    queryKey: ['colors'],
    queryFn: colorsApi.getAll
  });

  const { data: transmissions = [] } = useQuery({
    queryKey: ['transmissions'],
    queryFn: transmissionsApi.getAll
  });

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
      telaio: '',
    },
  });

  const onSubmit = async (data: VehicleFormValues) => {
    const accessoriesArray = data.accessories ? 
      data.accessories.split(',').map(item => item.trim()) : 
      [];
    
    try {
      const newVehicleData: Omit<Vehicle, 'id'> = {
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
        telaio: data.telaio,
      };
      
      console.log('Dati veicolo da salvare:', newVehicleData);
      
      // Salva il veicolo utilizzando l'API
      const savedVehicle = await vehiclesApi.create(newVehicleData);
      console.log('Veicolo salvato con successo:', savedVehicle);
      
      // Passa il veicolo salvato al gestore di completamento
      onComplete(savedVehicle);
    } catch (error) {
      console.error('Errore durante il salvataggio del veicolo:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il salvataggio del veicolo.",
        variant: "destructive",
      });
    }
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona il modello" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {models.map((model) => (
                      <SelectItem key={model.id} value={model.name}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona l'allestimento" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {trims.map((trim) => (
                      <SelectItem key={trim.id} value={trim.name}>
                        {trim.name}
                      </SelectItem>
                    ))}
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
                    {fuelTypes.map((fuelType) => (
                      <SelectItem key={fuelType.id} value={fuelType.name}>
                        {fuelType.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona il colore" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {colors.map((color) => (
                      <SelectItem key={color.id} value={`${color.name} (${color.type})`}>
                        {color.name} ({color.type})
                      </SelectItem>
                    ))}
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
                    {transmissions.map((transmission) => (
                      <SelectItem key={transmission.id} value={transmission.name}>
                        {transmission.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prezzo di Listino (€)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="100" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
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
        </div>
        
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
