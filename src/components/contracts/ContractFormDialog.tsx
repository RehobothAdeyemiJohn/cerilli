
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Order } from '@/types';
import { useForm } from 'react-hook-form';

interface ContractFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => void;
  order: Order | null;
  isSubmitting: boolean;
}

const ContractFormDialog = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  order, 
  isSubmitting 
}: ContractFormDialogProps) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      terminiPagamento: '',
      clausoleSpeciali: '',
      tempiConsegna: '30',
      garanzia: '24 mesi'
    }
  });

  if (!order) return null;

  const vehicleInfo = order.vehicle 
    ? `${order.vehicle.model} ${order.vehicle.trim || ''} - ${order.vehicle.exteriorColor || ''}`
    : 'Dettagli veicolo non disponibili';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Crea Contratto</DialogTitle>
          <DialogDescription>
            Trasforma l'ordine in un contratto formale.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 gap-4 py-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500">Informazioni Veicolo</h3>
              <p className="text-base">{vehicleInfo}</p>
              <p className="text-base font-medium">
                Cliente: {order.customerName}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="terminiPagamento">Termini di Pagamento</Label>
              <Textarea 
                id="terminiPagamento" 
                placeholder="Specificare i termini di pagamento" 
                className="resize-none" 
                {...register('terminiPagamento', { required: "I termini di pagamento sono obbligatori" })}
              />
              {errors.terminiPagamento && (
                <p className="text-red-500 text-sm">{errors.terminiPagamento.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tempiConsegna">Tempi di Consegna (giorni)</Label>
              <Input 
                id="tempiConsegna" 
                type="number" 
                {...register('tempiConsegna', { required: "I tempi di consegna sono obbligatori" })}
              />
              {errors.tempiConsegna && (
                <p className="text-red-500 text-sm">{errors.tempiConsegna.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="garanzia">Garanzia</Label>
              <Input 
                id="garanzia" 
                {...register('garanzia', { required: "La garanzia è obbligatoria" })}
              />
              {errors.garanzia && (
                <p className="text-red-500 text-sm">{errors.garanzia.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="clausoleSpeciali">Clausole Speciali</Label>
              <Textarea 
                id="clausoleSpeciali" 
                placeholder="Inserire eventuali clausole speciali" 
                className="resize-none" 
                {...register('clausoleSpeciali')}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Annulla</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creazione...' : 'Crea Contratto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ContractFormDialog;
