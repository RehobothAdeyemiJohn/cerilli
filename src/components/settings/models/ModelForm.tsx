
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { VehicleModel } from '@/types';
import { Button } from '@/components/ui/button';
import { ImagePlus, LoaderCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/api/supabase/client';

interface ModelFormProps {
  model: Partial<VehicleModel>;
  onChange: (field: keyof VehicleModel, value: any) => void;
  onImageUpload?: (file: File) => void;
}

const ModelForm: React.FC<ModelFormProps> = ({ model, onChange, onImageUpload }) => {
  const imageInputRef = React.useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = React.useState(false);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      setIsUploading(true);
      try {
        // Create a unique file name
        const fileExt = file.name.split('.').pop();
        const fileName = `model-${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `${fileName}`;
        
        console.log("Uploading image to vehicle-images bucket:", filePath);
        
        // Upload file to Supabase Storage
        const { data, error } = await supabase.storage
          .from('vehicle-images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (error) {
          console.error("Upload error:", error);
          throw error;
        }
        
        console.log("Upload successful:", data);
        
        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('vehicle-images')
          .getPublicUrl(filePath);
        
        if (!publicUrlData || !publicUrlData.publicUrl) {
          throw new Error("Failed to get public URL for uploaded image");
        }
        
        console.log("Public URL obtained:", publicUrlData.publicUrl);
        
        // Update model with image URL
        onChange('imageUrl', publicUrlData.publicUrl);
        
        toast({
          title: "Immagine Caricata",
          description: "L'immagine è stata caricata con successo.",
        });
        
        // If onImageUpload is provided, call it with the file
        if (onImageUpload) {
          onImageUpload(file);
        }
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
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome Modello</Label>
        <Input
          id="name"
          value={model.name || ''}
          onChange={(e) => onChange('name', e.target.value)}
          placeholder="es. Cirelli 1"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="basePrice">Prezzo Base (€)</Label>
        <Input
          id="basePrice"
          type="number"
          value={model.basePrice || ''}
          onChange={(e) => onChange('basePrice', Number(e.target.value))}
          placeholder="es. 15000"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="modelImage">Immagine Modello</Label>
        <div className="flex items-center gap-2">
          <input
            type="file"
            id="modelImage"
            ref={imageInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleImageChange}
          />
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => imageInputRef.current?.click()}
            className="w-full flex items-center justify-center"
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                Caricamento...
              </>
            ) : (
              <>
                <ImagePlus className="h-4 w-4 mr-2" />
                {model.imageUrl ? 'Cambia Immagine' : 'Carica Immagine'}
              </>
            )}
          </Button>
        </div>
        {model.imageUrl && (
          <div className="mt-2">
            <img 
              src={model.imageUrl} 
              alt={model.name || 'Modello'} 
              className="h-24 object-contain border rounded"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ModelForm;
