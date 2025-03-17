
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Quote } from '@/types';

interface ManualQuoteFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  editQuote?: Quote | null;
}

const ManualQuoteForm = ({ 
  onSubmit, 
  onCancel, 
  isSubmitting = false,
  editQuote = null
}: ManualQuoteFormProps) => {
  // Set up form with default values
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      customerName: editQuote?.customerName || '',
      customerEmail: editQuote?.customerEmail || '',
      customerPhone: editQuote?.customerPhone || '',
      model: editQuote?.vehicleData?.model || '',
      trim: editQuote?.vehicleData?.trim || '',
      exteriorColor: editQuote?.vehicleData?.exteriorColor || '',
      fuelType: editQuote?.vehicleData?.fuelType || '',
      price: editQuote?.price?.toString() || '0',
      discount: editQuote?.discount?.toString() || '0',
      finalPrice: editQuote?.finalPrice?.toString() || '0',
      notes: editQuote?.notes || '',
      manualEntry: true
    }
  });
  
  // Watch price and discount to calculate final price
  const watchPrice = watch('price');
  const watchDiscount = watch('discount');
  
  // Update final price when price or discount changes
  React.useEffect(() => {
    const price = parseFloat(watchPrice) || 0;
    const discount = parseFloat(watchDiscount) || 0;
    const finalPrice = price - discount;
    setValue('finalPrice', finalPrice > 0 ? finalPrice.toString() : '0');
  }, [watchPrice, watchDiscount, setValue]);
  
  // Handle form submission
  const handleFormSubmit = (data: any) => {
    const formData = {
      ...data,
      price: parseFloat(data.price) || 0,
      discount: parseFloat(data.discount) || 0,
      finalPrice: parseFloat(data.finalPrice) || 0,
      vehicleData: {
        model: data.model,
        trim: data.trim,
        exteriorColor: data.exteriorColor,
        fuelType: data.fuelType,
        price: parseFloat(data.price) || 0
      }
    };
    
    // If editing, include the original ID
    if (editQuote) {
      formData.id = editQuote.id;
    }
    
    onSubmit(formData);
  };
  
  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Customer Information */}
        <div className="space-y-4 bg-gray-50 p-4 rounded-md">
          <h3 className="text-md font-semibold">Informazioni Cliente</h3>
          
          <div>
            <Label htmlFor="customerName">Nome Cliente</Label>
            <Input 
              id="customerName" 
              {...register('customerName', { required: true })}
              className={errors.customerName ? 'border-red-500' : ''}
            />
            {errors.customerName && <p className="text-red-500 text-xs mt-1">Campo obbligatorio</p>}
          </div>
          
          <div>
            <Label htmlFor="customerEmail">Email</Label>
            <Input 
              id="customerEmail" 
              type="email"
              {...register('customerEmail')}
            />
          </div>
          
          <div>
            <Label htmlFor="customerPhone">Telefono</Label>
            <Input 
              id="customerPhone" 
              {...register('customerPhone')}
            />
          </div>
        </div>
        
        {/* Vehicle Information */}
        <div className="space-y-4 bg-gray-50 p-4 rounded-md">
          <h3 className="text-md font-semibold">Informazioni Veicolo</h3>
          
          <div>
            <Label htmlFor="model">Modello</Label>
            <Input 
              id="model" 
              {...register('model', { required: true })}
              className={errors.model ? 'border-red-500' : ''}
            />
            {errors.model && <p className="text-red-500 text-xs mt-1">Campo obbligatorio</p>}
          </div>
          
          <div>
            <Label htmlFor="trim">Allestimento</Label>
            <Input 
              id="trim" 
              {...register('trim')}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="exteriorColor">Colore</Label>
              <Input 
                id="exteriorColor" 
                {...register('exteriorColor')}
              />
            </div>
            
            <div>
              <Label htmlFor="fuelType">Alimentazione</Label>
              <Input 
                id="fuelType" 
                {...register('fuelType')}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Price Information */}
      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="text-md font-semibold mb-4">Prezzo</h3>
        
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="price">Prezzo Base</Label>
            <Input 
              id="price" 
              type="number"
              {...register('price', { required: true, min: 0 })}
              className={errors.price ? 'border-red-500' : ''}
            />
            {errors.price && <p className="text-red-500 text-xs mt-1">Prezzo non valido</p>}
          </div>
          
          <div>
            <Label htmlFor="discount">Sconto</Label>
            <Input 
              id="discount" 
              type="number"
              {...register('discount', { min: 0 })}
              className={errors.discount ? 'border-red-500' : ''}
            />
            {errors.discount && <p className="text-red-500 text-xs mt-1">Sconto non valido</p>}
          </div>
          
          <div>
            <Label htmlFor="finalPrice">Prezzo Finale</Label>
            <Input 
              id="finalPrice" 
              type="number"
              {...register('finalPrice')}
              readOnly
              className="bg-gray-100"
            />
          </div>
        </div>
      </div>
      
      {/* Notes */}
      <div>
        <Label htmlFor="notes">Note</Label>
        <Input 
          id="notes" 
          {...register('notes')}
        />
      </div>
      
      {/* Form Actions */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annulla
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {editQuote ? 'Aggiorna Preventivo' : 'Crea Preventivo'}
        </Button>
      </div>
    </form>
  );
};

export default ManualQuoteForm;
