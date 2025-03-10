
import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const vehicleSchema = z.object({
  model: z.string().min(2, { message: "Model must be at least 2 characters." }),
  trim: z.string().min(1, { message: "Trim is required." }),
  fuelType: z.string().min(1, { message: "Fuel type is required." }),
  exteriorColor: z.string().min(1, { message: "Exterior color is required." }),
  price: z.coerce.number().positive({ message: "Price must be a positive number." }),
  location: z.string().min(1, { message: "Location is required." }),
  accessories: z.string().optional(),
  status: z.enum(["available", "reserved", "sold"])
});

type VehicleFormValues = z.infer<typeof vehicleSchema>;

interface AddVehicleFormProps {
  onComplete: () => void;
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
      status: 'available',
    },
  });

  const onSubmit = (data: VehicleFormValues) => {
    // In a real application, this would send data to an API
    console.log('Submitting vehicle:', data);
    
    // Process accessories string into an array
    const accessoriesArray = data.accessories ? 
      data.accessories.split(',').map(item => item.trim()) : 
      [];
    
    const newVehicle = {
      ...data,
      id: String(Date.now()), // Simple ID generation for demo
      accessories: accessoriesArray,
      dateAdded: new Date().toISOString().split('T')[0],
    };
    
    console.log('New vehicle created:', newVehicle);
    toast({ 
      title: "Vehicle Added", 
      description: `${data.model} ${data.trim} has been added to inventory.`,
    });
    
    onComplete();
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
                <FormLabel>Model</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Cirelli 500" {...field} />
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
                <FormLabel>Trim</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Sport" {...field} />
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
                <FormLabel>Fuel Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select fuel type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Gasoline">Gasoline</SelectItem>
                    <SelectItem value="Diesel">Diesel</SelectItem>
                    <SelectItem value="Electric">Electric</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
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
                <FormLabel>Exterior Color</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Rosso Racing" {...field} />
                </FormControl>
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
                <FormLabel>Price (€)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="100" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Main Warehouse">Main Warehouse</SelectItem>
                    <SelectItem value="North Branch">North Branch</SelectItem>
                    <SelectItem value="South Branch">South Branch</SelectItem>
                    <SelectItem value="East Branch">East Branch</SelectItem>
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
              <FormLabel>Accessories (comma separated)</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Navigation System, Leather Seats, Premium Audio" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-4 pt-4">
          <button 
            type="button" 
            onClick={onComplete}
            className="px-4 py-2 border border-gray-200 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            type="submit"
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Add Vehicle
          </button>
        </div>
      </form>
    </Form>
  );
};

export default AddVehicleForm;
