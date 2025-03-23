import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Order } from '@/types';
import { ordersApi } from '@/api/apiClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { formatDate, formatCurrency } from '@/lib/utils';

interface OrderDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order;
  onGenerateODL?: (orderId: string) => void;
}

const OrderDetailsDialog = ({ 
  open, 
  onOpenChange, 
  order,
  onGenerateODL 
}: OrderDetailsDialogProps) => {
  const queryClient = useQueryClient();
  
  const [localOrder, setLocalOrder] = React.useState<Order>(order);
  
  React.useEffect(() => {
    setLocalOrder(order);
  }, [order]);
  
  const updateOrderMutation = useMutation({
    mutationFn: (updatedOrder: Partial<Order>) => {
      return ordersApi.update(order.id, updatedOrder);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({
        title: "Dettagli ordine aggiornati",
        description: "I dettagli dell'ordine sono stati aggiornati con successo",
      });
    },
    onError: (error) => {
      console.error('Error updating order details:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'aggiornamento dei dettagli dell'ordine",
        variant: "destructive"
      });
    }
  });
  
  const handleCheckboxChange = (field: keyof Order) => {
    setLocalOrder({
      ...localOrder,
      [field]: !localOrder[field]
    });
  };
  
  const handleInputChange = (field: keyof Order, value: string) => {
    setLocalOrder({
      ...localOrder,
      [field]: value
    });
  };

  const handleDateChange = (field: keyof Order, value: string) => {
    setLocalOrder({
      ...localOrder,
      [field]: value
    });
  };
  
  const handleSave = () => {
    updateOrderMutation.mutate(localOrder);
  };
  
  const handleGenerateODL = () => {
    if (onGenerateODL) {
      onGenerateODL(order.id);
    }
  };

  const isStockCMC = order.vehicle?.location !== 'Stock Virtuale';
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1200px] w-full h-screen py-8 overflow-y-scroll">
        <DialogHeader>
          <DialogTitle>Dettagli Ordine #{order.progressiveNumber?.toString().padStart(3, '0')}</DialogTitle>
          <DialogDescription>
            Veicolo: {order.modelName || (order.vehicle ? `${order.vehicle.model} ${order.vehicle.trim || ''}` : 'Non disponibile')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-4 gap-4 py-4">
          <div className="col-span-4">
            <p className="text-sm font-medium">Informazioni di base</p>
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="dealer">Concessionario</Label>
            <p className="text-sm">{order.dealerName || 'Non specificato'}</p>
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="orderDate">Data Ordine</Label>
            <p className="text-sm">{formatDate(new Date(order.orderDate))}</p>
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="status">Stato</Label>
            <p className="text-sm capitalize">{
              order.status === 'processing' ? 'In Lavorazione' :
              order.status === 'delivered' ? 'Consegnato' : 'Cancellato'
            }</p>
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="price">Prezzo</Label>
            <p className="text-sm">{formatCurrency(order.price || 0)}</p>
          </div>

          <div className="col-span-4 border-t mt-2 pt-2">
            <p className="text-sm font-medium">Configurazione Veicolo</p>
          </div>
          
          {order.vehicle && (
            <>
              <div className="space-y-1">
                <Label htmlFor="model">Modello</Label>
                <p className="text-sm">{order.vehicle.model || 'Non specificato'}</p>
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="trim">Allestimento</Label>
                <p className="text-sm">{order.vehicle.trim || 'Non specificato'}</p>
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="fuelType">Alimentazione</Label>
                <p className="text-sm">{order.vehicle.fuelType || 'Non specificato'}</p>
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="exteriorColor">Colore Esterno</Label>
                <p className="text-sm">{order.vehicle.exteriorColor || 'Non specificato'}</p>
              </div>
              
              {order.vehicle.accessories && order.vehicle.accessories.length > 0 && (
                <div className="space-y-1 col-span-4">
                  <Label htmlFor="accessories">Accessori</Label>
                  <ul className="text-sm list-disc pl-5">
                    {order.vehicle.accessories.map((acc, index) => (
                      <li key={index}>{acc}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
          
          <div className="col-span-4 border-t mt-2 pt-2">
            <p className="text-sm font-medium">Dettagli Ordine</p>
          </div>
          
          <div className="space-y-2 col-span-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="is-licensable" 
                checked={localOrder.isLicensable}
                onCheckedChange={() => handleCheckboxChange('isLicensable')}
              />
              <Label htmlFor="is-licensable">Targabile</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="has-proforma" 
                checked={localOrder.hasProforma}
                onCheckedChange={() => handleCheckboxChange('hasProforma')}
              />
              <Label htmlFor="has-proforma">Proforma</Label>
            </div>
            
            {localOrder.hasProforma && (
              <div className="pl-6 space-y-2 border-l-2 border-gray-200">
                <div className="space-y-1">
                  <Label htmlFor="proforma-number">Numero Proforma</Label>
                  <Input 
                    id="proforma-number" 
                    value={localOrder.proformaNumber || ''} 
                    onChange={(e) => handleInputChange('proformaNumber', e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="proforma-date">Data Proforma</Label>
                  <Input 
                    id="proforma-date" 
                    type="date" 
                    value={localOrder.proformaDate ? new Date(localOrder.proformaDate).toISOString().split('T')[0] : ''} 
                    onChange={(e) => handleDateChange('proformaDate', e.target.value)}
                  />
                </div>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="is-paid" 
                checked={localOrder.isPaid}
                onCheckedChange={() => handleCheckboxChange('isPaid')}
              />
              <Label htmlFor="is-paid">Pagato</Label>
            </div>
            
            {localOrder.isPaid && (
              <div className="pl-6 space-y-2 border-l-2 border-gray-200">
                <div className="space-y-1">
                  <Label htmlFor="payment-date">Data di Pagamento</Label>
                  <Input 
                    id="payment-date" 
                    type="date" 
                    value={localOrder.paymentDate ? new Date(localOrder.paymentDate).toISOString().split('T')[0] : ''} 
                    onChange={(e) => handleDateChange('paymentDate', e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-2 col-span-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="is-invoiced" 
                checked={localOrder.isInvoiced}
                onCheckedChange={() => handleCheckboxChange('isInvoiced')}
              />
              <Label htmlFor="is-invoiced">Fatturato</Label>
            </div>
            
            {localOrder.isInvoiced && (
              <div className="pl-6 space-y-2 border-l-2 border-gray-200">
                <div className="space-y-1">
                  <Label htmlFor="invoice-number">Numero Fattura</Label>
                  <Input 
                    id="invoice-number" 
                    value={localOrder.invoiceNumber || ''} 
                    onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="invoice-date">Data Fattura</Label>
                  <Input 
                    id="invoice-date" 
                    type="date" 
                    value={localOrder.invoiceDate ? new Date(localOrder.invoiceDate).toISOString().split('T')[0] : ''} 
                    onChange={(e) => handleDateChange('invoiceDate', e.target.value)}
                  />
                </div>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="has-conformity" 
                checked={localOrder.hasConformity}
                onCheckedChange={() => handleCheckboxChange('hasConformity')}
              />
              <Label htmlFor="has-conformity">Conformità</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="odl-generated" 
                checked={localOrder.odlGenerated}
                disabled={true}
              />
              <Label htmlFor="odl-generated">ODL Generato</Label>
            </div>
          </div>
          
          <div className="space-y-2 col-span-1">
            <Label htmlFor="chassis">Telaio</Label>
            <Input 
              id="chassis" 
              value={isStockCMC ? (order.vehicle?.telaio || localOrder.chassis || '') : ''} 
              onChange={(e) => handleInputChange('chassis', e.target.value)}
              readOnly={!isStockCMC}
              placeholder={!isStockCMC ? "Non disponibile per Stock Virtuale" : ""}
              className={!isStockCMC ? "bg-gray-100" : ""}
            />
          </div>
          
          <div className="space-y-2 col-span-1">
            <Label htmlFor="prev-chassis">Telaio Precedente</Label>
            <Input 
              id="prev-chassis" 
              value={localOrder.previousChassis || ''} 
              onChange={(e) => handleInputChange('previousChassis', e.target.value)}
            />
          </div>
          
          <div className="space-y-2 col-span-1">
            <Label htmlFor="transport-costs">Costi di Trasporto (€)</Label>
            <Input 
              id="transport-costs" 
              type="number" 
              value={localOrder.transportCosts} 
              onChange={(e) => handleInputChange('transportCosts', e.target.value)}
            />
          </div>
          
          <div className="space-y-2 col-span-1">
            <Label htmlFor="restoration-costs">Costi di Ripristino (€)</Label>
            <Input 
              id="restoration-costs" 
              type="number" 
              value={localOrder.restorationCosts} 
              onChange={(e) => handleInputChange('restorationCosts', e.target.value)}
            />
          </div>
        </div>
        
        <DialogFooter className="flex justify-between">
          <div>
            {!localOrder.odlGenerated && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleGenerateODL}
                className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
              >
                Genera ODL
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annulla
            </Button>
            <Button type="button" onClick={handleSave} disabled={updateOrderMutation.isPending}>
              {updateOrderMutation.isPending ? 'Salvataggio...' : 'Salva Modifiche'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsDialog;
