
import React, { useState } from 'react';
import { Vehicle } from '@/types';
import { Button } from '@/components/ui/button';
import { LoaderCircle, Plus, X, Upload, Image as ImageIcon } from 'lucide-react';
import VehicleDetailsContent from './VehicleDetailsContent';
import QuoteForm from '@/components/quotes/QuoteForm';
import ReserveVehicleForm from '../ReserveVehicleForm';
import ReserveVirtualVehicleForm from '../ReserveVirtualVehicleForm';
import CancelReservationForm from '../CancelReservationForm';
import { DialogFooter } from '@/components/ui/dialog';
import { supabase } from '@/api/supabase/client';
import { vehiclesApi } from '@/api/supabase';
import { toast } from '@/hooks/use-toast';

interface VehicleDialogContentProps {
  vehicle: Vehicle | null;
  onOpenChange?: (open: boolean) => void;
  showQuoteForm?: boolean;
  showReserveForm?: boolean;
  showVirtualReserveForm?: boolean;
  showCancelReservationForm?: boolean;
  isSubmitting?: boolean;
  onCreateQuote?: () => void;
  onCancel?: () => void;
  onSubmit?: () => void;
  onConfirm?: () => Promise<void>;
  userCanReserveVehicles?: boolean;
  userCanCreateQuotes?: boolean;
}

const VehicleDialogContent: React.FC<VehicleDialogContentProps> = ({ 
  vehicle, 
  onOpenChange,
  showQuoteForm,
  showReserveForm,
  showVirtualReserveForm,
  showCancelReservationForm,
  isSubmitting,
  onCreateQuote,
  onCancel,
  onSubmit,
  onConfirm,
  userCanReserveVehicles,
  userCanCreateQuotes
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState(vehicle?.customImageUrl || '');
  
  if (!vehicle) {
    return null;
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const file = e.target.files[0];
    const fileSize = file.size / 1024 / 1024; // Convert to MB
    if (fileSize > 5) {
      toast({
        title: "Errore",
        description: "L'immagine non può superare i 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${vehicle.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      console.log("Uploading to vehicle-images bucket:", filePath);

      // Upload the file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('vehicle-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error("Upload error:", error);
        throw error;
      }

      console.log("Upload successful:", data);

      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('vehicle-images')
        .getPublicUrl(filePath);

      if (!publicUrlData || !publicUrlData.publicUrl) {
        throw new Error("Impossibile ottenere l'URL pubblico dell'immagine");
      }

      console.log("Public URL obtained:", publicUrlData.publicUrl);

      // Update the vehicle with the new image URL
      await vehiclesApi.update(vehicle.id, {
        ...vehicle,
        customImageUrl: publicUrlData.publicUrl
      });

      setCustomImageUrl(publicUrlData.publicUrl);

      toast({
        title: "Successo",
        description: "Immagine caricata con successo",
      });

    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: "Errore",
        description: `Errore durante il caricamento dell'immagine: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <VehicleDetailsContent vehicle={{...vehicle, customImageUrl}} />
      
      {!showQuoteForm && !showReserveForm && !showVirtualReserveForm && !showCancelReservationForm && (
        <div className="mt-4">
          <div className="border rounded-md p-4 mb-4">
            <h3 className="font-medium mb-2">Immagine Personalizzata</h3>
            
            {customImageUrl ? (
              <div className="space-y-2">
                <div className="relative aspect-video w-full overflow-hidden rounded-md border">
                  <img 
                    src={customImageUrl} 
                    alt={`${vehicle.model} ${vehicle.trim}`} 
                    className="object-cover w-full h-full"
                  />
                </div>
                <input
                  type="file"
                  id="vehicle-image"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                />
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => document.getElementById('vehicle-image')?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                      Caricamento...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Cambia Immagine
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="border border-dashed rounded-md p-8 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800">
                  <ImageIcon className="h-10 w-10 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    Nessuna immagine personalizzata. Carica un'immagine per mostrare il veicolo.
                  </p>
                </div>
                <input
                  type="file"
                  id="vehicle-image"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                />
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => document.getElementById('vehicle-image')?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                      Caricamento...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Carica Immagine
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
      
      {showQuoteForm && vehicle && (
        <QuoteForm 
          vehicle={vehicle} 
          onSubmit={onCreateQuote}
          onCancel={onCancel}
        />
      )}
      
      {showReserveForm && vehicle && (
        <ReserveVehicleForm 
          vehicle={vehicle}
          onReservationComplete={onSubmit}
          onCancel={onCancel}
        />
      )}
      
      {showVirtualReserveForm && vehicle && (
        <ReserveVirtualVehicleForm 
          vehicle={vehicle}
          onReservationComplete={onSubmit}
          onCancel={onCancel}
        />
      )}
      
      {showCancelReservationForm && vehicle && (
        <CancelReservationForm 
          vehicle={vehicle}
          onCancel={onCancel}
          onConfirm={onConfirm}
          isSubmitting={isSubmitting}
        />
      )}
    </>
  );
};

export default VehicleDialogContent;
