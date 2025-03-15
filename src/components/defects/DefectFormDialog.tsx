
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
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { defectReportsApi } from '@/api/supabase';
import { useToast } from '@/hooks/use-toast';

type DefectFormDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  defectId?: string;
  onSuccess: () => void;
};

const formSchema = z.object({
  dealerId: z.string().min(1, 'Seleziona un dealer'),
  dealerName: z.string().min(1, 'Nome dealer richiesto'),
  vehicleId: z.string().optional(),
  email: z.string().email('Email non valida').optional().or(z.literal('')),
  status: z.enum(['Aperta', 'Approvata', 'Approvata Parzialmente', 'Respinta']),
  reason: z.enum(['Danni da trasporto', 'Difformità Pre-Garanzia Tecnica', 'Carrozzeria']),
  description: z.string().min(1, 'Descrizione richiesta'),
  vehicleReceiptDate: z.date({
    required_error: "Data ricevimento richiesta",
  }),
  repairCost: z.number().min(0, 'Il costo deve essere un numero positivo'),
  transportDocumentUrl: z.string().optional().or(z.literal('')),
  photoReportUrls: z.array(z.string()).optional(),
  repairQuoteUrl: z.string().optional().or(z.literal('')),
  adminNotes: z.string().optional().or(z.literal('')),
  paymentDate: z.date().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

const DefectFormDialog = ({ isOpen, onClose, defectId, onSuccess }: DefectFormDialogProps) => {
  const { user } = useAuth();
  const isAdmin = user?.type === 'admin';
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      photoReportUrls: [],
      paymentDate: null,
    }
  });

  // Fetch defect data if editing
  const { data: defect, isLoading } = useQuery({
    queryKey: ['defect', defectId],
    queryFn: () => defectId ? defectReportsApi.getById(defectId) : null,
    enabled: !!defectId && isOpen,
  });

  // Set form values when editing an existing defect
  useEffect(() => {
    if (defect) {
      form.reset({
        dealerId: defect.dealerId,
        dealerName: defect.dealerName,
        vehicleId: defect.vehicleId,
        email: defect.email || '',
        status: defect.status,
        reason: defect.reason,
        description: defect.description,
        vehicleReceiptDate: new Date(defect.vehicleReceiptDate),
        repairCost: defect.repairCost,
        transportDocumentUrl: defect.transportDocumentUrl || '',
        photoReportUrls: defect.photoReportUrls || [],
        repairQuoteUrl: defect.repairQuoteUrl || '',
        adminNotes: defect.adminNotes || '',
        paymentDate: defect.paymentDate ? new Date(defect.paymentDate) : null,
      });
    }
  }, [defect, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      
      if (defectId) {
        // Update existing defect
        await defectReportsApi.update(defectId, {
          ...values,
          vehicleReceiptDate: format(values.vehicleReceiptDate, 'yyyy-MM-dd'),
          paymentDate: values.paymentDate ? format(values.paymentDate, 'yyyy-MM-dd') : undefined,
        });
        toast({
          title: "Difformità aggiornata",
          description: "La segnalazione di difformità è stata aggiornata con successo",
        });
      } else {
        // Create new defect
        await defectReportsApi.create({
          ...values,
          vehicleReceiptDate: format(values.vehicleReceiptDate, 'yyyy-MM-dd'),
          paymentDate: values.paymentDate ? format(values.paymentDate, 'yyyy-MM-dd') : undefined,
        });
        toast({
          title: "Difformità creata",
          description: "La segnalazione di difformità è stata creata con successo",
        });
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error submitting defect report:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il salvataggio",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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
                {/* First column */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Motivo della segnalazione *</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          disabled={!isAdmin && defect?.status !== 'Aperta'}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleziona il motivo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Danni da trasporto">Danni da trasporto</SelectItem>
                            <SelectItem value="Difformità Pre-Garanzia Tecnica">Difformità Pre-Garanzia Tecnica</SelectItem>
                            <SelectItem value="Carrozzeria">Carrozzeria</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="vehicleReceiptDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Data ricevimento veicolo *</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                                disabled={!isAdmin && defect?.status !== 'Aperta'}
                              >
                                {field.value ? (
                                  format(field.value, "dd/MM/yyyy")
                                ) : (
                                  <span>Seleziona data</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date > new Date()}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrizione *</FormLabel>
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
                        <FormLabel>Costo riparazione (€) *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            step="0.01"
                            {...field}
                            value={field.value}
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                            disabled={!isAdmin && defect?.status !== 'Aperta'}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Second column */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email di riferimento</FormLabel>
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
                    name="transportDocumentUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Link documento di trasporto</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="URL del documento"
                            disabled={!isAdmin && defect?.status !== 'Aperta'}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="repairQuoteUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Link preventivo riparazione</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="URL del preventivo"
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
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Stato</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
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
                        name="paymentDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Data pagamento</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "dd/MM/yyyy")
                                    ) : (
                                      <span>Seleziona data di pagamento</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value || undefined}
                                  onSelect={field.onChange}
                                  disabled={(date) => date > new Date()}
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
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
                    </>
                  )}
                </div>
              </div>
              
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
