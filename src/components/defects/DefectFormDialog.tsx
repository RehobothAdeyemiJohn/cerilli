import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { DefectReport } from '@/types';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { format, parseISO } from 'date-fns';
import { CalendarIcon, Loader2, X, Upload, Camera } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { defectReportsApi } from '@/api/supabase';
import { dealersApi } from '@/api/supabase';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

type DefectFormDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  defectId?: string;
  onSuccess: () => void;
  onError?: (error: any) => void;
  setIsSubmitting?: React.Dispatch<React.SetStateAction<boolean>>;
  isSubmitting?: boolean;
};

const formSchema = z.object({
  dealerId: z.string().min(1, 'Seleziona un dealer'),
  dealerName: z.string().min(1, 'Nome dealer richiesto'),
  vehicleId: z.string().optional(),
  email: z.string().email('Email non valida').min(1, 'Email di riferimento obbligatoria'),
  status: z.enum(['Aperta', 'Approvata', 'Approvata Parzialmente', 'Respinta']),
  reason: z.enum(['Danni da trasporto', 'Difformità Pre-Garanzia Tecnica', 'Carrozzeria']),
  description: z.string().min(1, 'Descrizione richiesta'),
  vehicleReceiptDate: z.date({
    required_error: "Data ricevimento richiesta",
  }),
  repairCost: z.number().min(0, 'Il costo deve essere un numero positivo'),
  approvedRepairValue: z.number().min(0, 'Il valore deve essere un numero positivo').optional(),
  sparePartsRequest: z.string().optional(),
  adminNotes: z.string().optional(),
  paymentDate: z.date().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

const DefectFormDialog = ({ 
  isOpen, 
  onClose, 
  defectId, 
  onSuccess,
  onError,
  setIsSubmitting: externalSetIsSubmitting,
  isSubmitting: externalIsSubmitting 
}: DefectFormDialogProps) => {
  const { user } = useAuth();
  const isAdmin = user?.type === 'admin';
  const isDealer = user?.type === 'dealer';
  const { toast } = useToast();
  
  const [internalIsSubmitting, setInternalIsSubmitting] = useState(false);
  const isSubmitting = externalIsSubmitting !== undefined ? externalIsSubmitting : internalIsSubmitting;
  const setIsSubmitting = externalSetIsSubmitting || setInternalIsSubmitting;
  
  const [transportDoc, setTransportDoc] = useState<File | null>(null);
  const [uploadingTransportDoc, setUploadingTransportDoc] = useState(false);
  const [transportDocUrl, setTransportDocUrl] = useState<string>('');
  
  const [repairQuote, setRepairQuote] = useState<File | null>(null);
  const [uploadingRepairQuote, setUploadingRepairQuote] = useState(false);
  const [repairQuoteUrl, setRepairQuoteUrl] = useState<string>('');
  
  const [photos, setPhotos] = useState<File[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);
  
  const [uploadStatus, setUploadStatus] = useState<string>('');

  const { data: dealers = [], isLoading: loadingDealers } = useQuery({
    queryKey: ['dealers'],
    queryFn: dealersApi.getAll,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dealerId: user?.dealerId || '',
      dealerName: user?.dealerName || '',
      status: 'Aperta',
      reason: 'Danni da trasporto',
      description: '',
      vehicleReceiptDate: new Date(),
      repairCost: 0,
      approvedRepairValue: 0,
      sparePartsRequest: '',
      adminNotes: '',
      email: '',
      paymentDate: null,
    }
  });

  const { data: defect, isLoading } = useQuery({
    queryKey: ['defect', defectId],
    queryFn: () => defectId ? defectReportsApi.getById(defectId) : null,
    enabled: !!defectId && isOpen,
  });

  useEffect(() => {
    if (defect) {
      console.log("Loading defect data into form:", defect);
      
      const vehicleReceiptDate = defect.vehicleReceiptDate ? 
        (typeof defect.vehicleReceiptDate === 'string' ? 
          new Date(defect.vehicleReceiptDate) : defect.vehicleReceiptDate) : 
        new Date();
        
      const paymentDate = defect.paymentDate ? 
        (typeof defect.paymentDate === 'string' ? 
          new Date(defect.paymentDate) : defect.paymentDate) : 
        null;
      
      form.reset({
        dealerId: defect.dealerId,
        dealerName: defect.dealerName,
        vehicleId: defect.vehicleId || '',
        email: defect.email || '',
        status: defect.status,
        reason: defect.reason,
        description: defect.description,
        vehicleReceiptDate: vehicleReceiptDate,
        repairCost: defect.repairCost,
        approvedRepairValue: defect.approvedRepairValue || 0,
        sparePartsRequest: defect.sparePartsRequest || '',
        adminNotes: defect.adminNotes || '',
        paymentDate: paymentDate,
      });

      setTransportDocUrl(defect.transportDocumentUrl || '');
      setRepairQuoteUrl(defect.repairQuoteUrl || '');
      setPhotoUrls(defect.photoReportUrls || []);
      
      console.log("Form reset with defect data:", {
        dealerId: defect.dealerId,
        dealerName: defect.dealerName,
        status: defect.status,
        vehicleReceiptDate: vehicleReceiptDate,
        paymentDate: paymentDate
      });
    }
  }, [defect, form]);

  const handleTransportDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setTransportDoc(e.target.files[0]);
    }
  };

  const handleRepairQuoteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setRepairQuote(e.target.files[0]);
    }
  };

  const handlePhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setPhotos(prev => [...prev, ...newFiles]);
      
      const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
      setPhotoPreviewUrls(prev => [...prev, ...newPreviewUrls]);
      
      console.log('Added new photos:', newFiles.length, 'Total photos:', photos.length + newFiles.length);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    
    URL.revokeObjectURL(photoPreviewUrls[index]);
    setPhotoPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const uploadTransportDoc = async () => {
    if (!transportDoc) return '';
    setUploadingTransportDoc(true);
    setUploadStatus('Caricamento documento di trasporto...');
    
    try {
      const fileName = `${Date.now()}-${transportDoc.name}`;
      console.log('Uploading transport document:', fileName);
      
      const { data, error } = await supabase.storage
        .from('defect-documents')
        .upload(fileName, transportDoc);
      
      if (error) {
        console.error('Error uploading transport document:', error);
        throw error;
      }
      
      const { data: urlData } = supabase.storage
        .from('defect-documents')
        .getPublicUrl(fileName);
      
      console.log('Transport document uploaded successfully, URL:', urlData.publicUrl);
      setTransportDocUrl(urlData.publicUrl);
      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading transport document:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare il documento di trasporto: " + (error as Error).message,
        variant: "destructive",
      });
      return '';
    } finally {
      setUploadingTransportDoc(false);
    }
  };

  const uploadRepairQuote = async () => {
    if (!repairQuote) return '';
    setUploadingRepairQuote(true);
    setUploadStatus('Caricamento preventivo...');
    
    try {
      const fileName = `${Date.now()}-${repairQuote.name}`;
      console.log('Uploading repair quote:', fileName);
      
      const { data, error } = await supabase.storage
        .from('defect-quotes')
        .upload(fileName, repairQuote);
      
      if (error) {
        console.error('Error uploading repair quote:', error);
        throw error;
      }
      
      const { data: urlData } = supabase.storage
        .from('defect-quotes')
        .getPublicUrl(fileName);
      
      console.log('Repair quote uploaded successfully, URL:', urlData.publicUrl);
      setRepairQuoteUrl(urlData.publicUrl);
      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading repair quote:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare il preventivo: " + (error as Error).message,
        variant: "destructive",
      });
      return '';
    } finally {
      setUploadingRepairQuote(false);
    }
  };

  const uploadPhotos = async () => {
    if (photos.length === 0) return photoUrls;
    setUploadingPhotos(true);
    setUploadStatus(`Caricamento foto (0/${photos.length})...`);
    
    try {
      console.log(`Starting upload of ${photos.length} photos...`);
      
      const newPhotoUrls: string[] = [];
      
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        const fileName = `${Date.now()}-${photo.name}`;
        
        setUploadStatus(`Caricamento foto (${i+1}/${photos.length})...`);
        console.log(`Uploading photo ${i+1}/${photos.length}: ${fileName}`);
        
        const { data, error } = await supabase.storage
          .from('defect-photos')
          .upload(fileName, photo);
        
        if (error) {
          console.error(`Error uploading photo ${i+1}:`, error);
          toast({
            title: "Avviso",
            description: `Errore durante il caricamento della foto ${i+1}: ${error.message}`,
            variant: "destructive",
          });
          continue;
        }
        
        const { data: urlData } = supabase.storage
          .from('defect-photos')
          .getPublicUrl(fileName);
        
        console.log(`Photo ${i+1} uploaded successfully, URL:`, urlData.publicUrl);
        newPhotoUrls.push(urlData.publicUrl);
      }
      
      const allPhotoUrls = [...photoUrls, ...newPhotoUrls];
      setPhotoUrls(allPhotoUrls);
      
      photoPreviewUrls.forEach(url => URL.revokeObjectURL(url));
      setPhotoPreviewUrls([]);
      setPhotos([]);
      
      console.log(`Successfully uploaded ${newPhotoUrls.length} photos out of ${photos.length}`);
      return allPhotoUrls;
    } catch (error) {
      console.error('Error uploading photos:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare le fotografie: " + (error as Error).message,
        variant: "destructive",
      });
      return photoUrls;
    } finally {
      setUploadingPhotos(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      console.log("Form submission started with values:", values);
      setIsSubmitting(true);
      
      if (!values.dealerId) {
        toast({
          title: "Errore",
          description: "Seleziona un dealer",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      if (!photoUrls.length && !photos.length && !defectId) {
        toast({
          title: "Attenzione",
          description: "È obbligatorio allegare almeno una fotografia",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      let newTransportDocUrl = transportDocUrl;
      let newRepairQuoteUrl = repairQuoteUrl;
      let newPhotoUrls = photoUrls;
      
      try {
        if (transportDoc) {
          newTransportDocUrl = await uploadTransportDoc();
        }
        
        if (repairQuote) {
          newRepairQuoteUrl = await uploadRepairQuote();
        }
        
        if (photos.length > 0) {
          newPhotoUrls = await uploadPhotos();
        }
      } catch (error) {
        console.error('Error during file uploads:', error);
        toast({
          title: "Errore di caricamento",
          description: "Si è verificato un errore durante il caricamento dei file. Verifica la tua connessione e riprova.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      if (!newPhotoUrls.length && !defectId) {
        toast({
          title: "Attenzione",
          description: "È obbligatorio allegare almeno una fotografia. Caricamento non riuscito.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      setUploadStatus('Salvataggio della segnalazione...');
      
      const formattedVehicleReceiptDate = values.vehicleReceiptDate instanceof Date
        ? values.vehicleReceiptDate.toISOString().split('T')[0]
        : typeof values.vehicleReceiptDate === 'string'
          ? values.vehicleReceiptDate
          : null;

      const formattedPaymentDate = values.paymentDate instanceof Date
        ? values.paymentDate.toISOString().split('T')[0]
        : values.paymentDate;
      
      const approvedValue = typeof values.approvedRepairValue === 'string' 
        ? parseFloat(values.approvedRepairValue) 
        : values.approvedRepairValue || 0;
      
      const repairCost = typeof values.repairCost === 'string'
        ? parseFloat(values.repairCost)
        : values.repairCost || 0;
      
      console.log("Processing numeric values:", {
        approvedRepairValue: values.approvedRepairValue,
        parsedApprovedValue: approvedValue,
        repairCost: values.repairCost,
        parsedRepairCost: repairCost
      });
      
      const submissionData = {
        dealerId: values.dealerId,
        dealerName: values.dealerName,
        email: values.email,
        status: values.status,
        reason: values.reason,
        description: values.description,
        repairCost: repairCost,
        approvedRepairValue: approvedValue,
        sparePartsRequest: values.sparePartsRequest || '',
        vehicleReceiptDate: formattedVehicleReceiptDate,
        paymentDate: formattedPaymentDate,
        vehicleId: values.vehicleId || '',
        transportDocumentUrl: newTransportDocUrl || '',
        photoReportUrls: newPhotoUrls,
        repairQuoteUrl: newRepairQuoteUrl || '',
        adminNotes: values.adminNotes || ''
      };
      
      console.log("Submitting data to API:", JSON.stringify(submissionData, null, 2));
      
      try {
        if (defectId) {
          console.log(`Updating defect report with ID: ${defectId}`);
          const updatedReport = await defectReportsApi.update(defectId, submissionData);
          console.log("Update API response:", updatedReport);
          
          toast({
            title: "Difformità aggiornata",
            description: "La segnalazione di difformità è stata aggiornata con successo",
          });
          
          if (onSuccess) {
            onSuccess();
          }
        } else {
          const newReport = await defectReportsApi.create(submissionData);
          console.log("Created new report:", newReport);
          toast({
            title: "Difformità creata",
            description: "La segnalazione di difformità è stata creata con successo",
          });
          
          if (onSuccess) {
            onSuccess();
          }
        }
      } catch (error: any) {
        console.error('Error submitting defect report:', error);
        
        let errorMessage = "Si è verificato un errore durante il salvataggio";
        
        if (error.message) {
          errorMessage += ": " + error.message;
        }
        
        toast({
          title: "Errore",
          description: errorMessage,
          variant: "destructive",
        });
        
        if (onError) {
          onError(error);
        }
      }
    } catch (error) {
      console.error('Unexpected error during form submission:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore imprevisto. Riprova più tardi.",
        variant: "destructive",
      });
      
      if (onError) {
        onError(error);
      }
    } finally {
      setIsSubmitting(false);
      setUploadStatus('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {defectId ? 'Modifica Segnalazione Difformità' : 'Nuova Segnalazione Difformità'}
          </DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          disabled={!isAdmin && defect?.status !== 'Aperta'}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleziona lo stato" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Aperta">Aperta</SelectItem>
                            <SelectItem value="Approvata">Approvata</SelectItem>
                            <SelectItem value="Approvata Parzialmente">Approvata Parzialmente</SelectItem>
                            <SelectItem value="Respinta">Respinta</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dealerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dealer *</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          disabled={isDealer}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleziona dealer" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {loadingDealers ? (
                              <SelectItem value="loading" disabled>Caricamento...</SelectItem>
                            ) : dealers && dealers.length > 0 ? (
                              dealers.map((dealer) => (
                                <SelectItem key={dealer.id} value={dealer.id}>
                                  {dealer.companyName}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-dealers" disabled>Nessun dealer disponibile</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email di riferimento (service) *</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Email per comunicazioni"
                            disabled={!isAdmin && defect?.status !== 'Aperta'}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrizione difformità *</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Descrivi la difformità in dettaglio"
                            rows={5}
                            disabled={!isAdmin && defect?.status !== 'Aperta'}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="repairCost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Costo Riparazione Stimato (€) *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            step="0.01"
                            {...field}
                            value={field.value}
                            onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                            disabled={!isAdmin && defect?.status !== 'Aperta'}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <FormLabel>Carica Documento trasporto</FormLabel>
                    <div className="flex items-center gap-3">
                      <Input
                        type="file"
                        onChange={handleTransportDocChange}
                        disabled={uploadingTransportDoc || (!isAdmin && defect?.status !== 'Aperta')}
                        className="flex-1"
                      />
                      {uploadingTransportDoc && <Loader2 className="h-4 w-4 animate-spin" />}
                    </div>
                    {transportDocUrl && (
                      <a 
                        href={transportDocUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <span>Documento caricato</span>
                      </a>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <FormLabel>Allegare report fotografico *</FormLabel>
                    <div className="flex items-center gap-3">
                      <Input
                        type="file"
                        onChange={handlePhotosChange}
                        disabled={uploadingPhotos || (!isAdmin && defect?.status !== 'Aperta')}
                        className="flex-1"
                        accept="image/*"
                        multiple
                      />
                      {uploadingPhotos && <Loader2 className="h-4 w-4 animate-spin" />}
                    </div>
                    
                    {photoUrls.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600 mb-2">
                          {photoUrls.length} foto già caricate
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          {photoUrls.map((url, index) => (
                            <div key={`existing-${index}`} className="relative rounded overflow-hidden h-20">
                              <img 
                                src={url} 
                                alt={`Photo ${index}`} 
                                className="w-full h-full object-cover" 
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {photoPreviewUrls.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600 mb-2">
                          {photoPreviewUrls.length} nuove foto da caricare
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          {photoPreviewUrls.map((url, index) => (
                            <div key={`new-${index}`} className="relative rounded overflow-hidden h-20">
                              <img 
                                src={url} 
                                alt={`New photo ${index}`} 
                                className="w-full h-full object-cover" 
                              />
                              <button
                                type="button"
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                                onClick={() => removePhoto(index)}
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <FormLabel>Allegare Preventivo</FormLabel>
                    <div className="flex items-center gap-3">
                      <Input
                        type="file"
                        onChange={handleRepairQuoteChange}
                        disabled={uploadingRepairQuote || (!isAdmin && defect?.status !== 'Aperta')}
                        className="flex-1"
                      />
                      {uploadingRepairQuote && <Loader2 className="h-4 w-4 animate-spin" />}
                    </div>
                    {repairQuoteUrl && (
                      <a 
                        href={repairQuoteUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <span>Preventivo caricato</span>
                      </a>
                    )}
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="sparePartsRequest"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Richiesta Ricambio</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Dettagli sulla richiesta di ricambi"
                            rows={3}
                            disabled={!isAdmin && defect?.status !== 'Aperta'}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {isAdmin && (
                    <>
                      <FormField
                        control={form.control}
                        name="adminNotes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Note amministrative</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field} 
                                placeholder="Note interne per amministratori"
                                rows={3}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="approvedRepairValue"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Valore Riparazione Approvata (€)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="0" 
                                step="0.01"
                                {...field}
                                value={field.value || 0}
                                onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </div>
              </div>
              
              {uploadStatus && (
                <div className="bg-blue-50 border border-blue-200 rounded px-4 py-3 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                  <p className="text-blue-700 text-sm">{uploadStatus}</p>
                </div>
              )}
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Annulla
                </Button>
                <Button 
                  type="submit"
                  disabled={isSubmitting || (!isAdmin && defect?.status !== 'Aperta')}
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {defectId ? 'Aggiorna' : 'Salva'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DefectFormDialog;
