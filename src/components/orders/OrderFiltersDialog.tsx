
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useQuery } from '@tanstack/react-query';
import { OrderFilters } from '@/types';
import { ordersApi } from '@/api/supabase';

interface OrderFiltersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: OrderFilters;
  setFilters: (filters: OrderFilters) => void;
}

export function OrderFiltersDialog({ 
  open, 
  onOpenChange,
  filters,
  setFilters
}: OrderFiltersDialogProps) {
  const [localFilters, setLocalFilters] = useState<OrderFilters>(filters);
  
  // Reset local filters when dialog opens
  useEffect(() => {
    if (open) {
      setLocalFilters(filters);
    }
  }, [open, filters]);
  
  // Get unique models and dealers for filters
  const { data: orders = [] } = useQuery({
    queryKey: ['orders'],
    queryFn: ordersApi.getAll,
    staleTime: 60000, // 1 minute
  });
  
  const models = [...new Set(orders.map(order => order.modelName).filter(Boolean))];
  const dealers = [...new Set(orders.map(order => order.dealerName).filter(Boolean))];
  
  const handleApplyFilters = () => {
    setFilters(localFilters);
    onOpenChange(false);
  };
  
  const handleReset = () => {
    const resetFilters: OrderFilters = {
      searchText: '',
      dateRange: undefined,
      models: [],
      dealers: [],
      status: [],
      isLicensable: null,
      hasProforma: null,
      isPaid: null,
      isInvoiced: null,
      hasConformity: null,
      dealerId: null,
      model: null
    };
    
    setLocalFilters(resetFilters);
    setFilters(resetFilters);
    onOpenChange(false);
  };
  
  const toggleModel = (modelName: string) => {
    if (localFilters.models.includes(modelName)) {
      setLocalFilters({
        ...localFilters,
        models: localFilters.models.filter(m => m !== modelName)
      });
    } else {
      setLocalFilters({
        ...localFilters,
        models: [...localFilters.models, modelName]
      });
    }
  };
  
  const toggleDealer = (dealerName: string) => {
    if (localFilters.dealers.includes(dealerName)) {
      setLocalFilters({
        ...localFilters,
        dealers: localFilters.dealers.filter(d => d !== dealerName)
      });
    } else {
      setLocalFilters({
        ...localFilters,
        dealers: [...localFilters.dealers, dealerName]
      });
    }
  };
  
  const toggleStatus = (status: string) => {
    if (localFilters.status.includes(status)) {
      setLocalFilters({
        ...localFilters,
        status: localFilters.status.filter(s => s !== status)
      });
    } else {
      setLocalFilters({
        ...localFilters,
        status: [...localFilters.status, status]
      });
    }
  };
  
  const toggleBooleanFilter = (field: keyof OrderFilters) => {
    setLocalFilters({
      ...localFilters,
      [field]: localFilters[field] === true ? null : true
    });
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Filtri ordini</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Stato ordine</h3>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="status-processing" 
                  checked={localFilters.status.includes('processing')}
                  onCheckedChange={() => toggleStatus('processing')}
                />
                <Label htmlFor="status-processing">In Lavorazione</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="status-delivered" 
                  checked={localFilters.status.includes('delivered')}
                  onCheckedChange={() => toggleStatus('delivered')}
                />
                <Label htmlFor="status-delivered">Consegnato</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="status-cancelled" 
                  checked={localFilters.status.includes('cancelled')}
                  onCheckedChange={() => toggleStatus('cancelled')}
                />
                <Label htmlFor="status-cancelled">Annullato</Label>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-sm font-medium mb-2">Proprietà</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="is-licensable" 
                  checked={localFilters.isLicensable === true}
                  onCheckedChange={() => toggleBooleanFilter('isLicensable')}
                />
                <Label htmlFor="is-licensable">Immatricolabile</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="has-proforma" 
                  checked={localFilters.hasProforma === true}
                  onCheckedChange={() => toggleBooleanFilter('hasProforma')}
                />
                <Label htmlFor="has-proforma">Ha proforma</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="is-paid" 
                  checked={localFilters.isPaid === true}
                  onCheckedChange={() => toggleBooleanFilter('isPaid')}
                />
                <Label htmlFor="is-paid">Pagato</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="is-invoiced" 
                  checked={localFilters.isInvoiced === true}
                  onCheckedChange={() => toggleBooleanFilter('isInvoiced')}
                />
                <Label htmlFor="is-invoiced">Fatturato</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="has-conformity" 
                  checked={localFilters.hasConformity === true}
                  onCheckedChange={() => toggleBooleanFilter('hasConformity')}
                />
                <Label htmlFor="has-conformity">Ha conformità</Label>
              </div>
            </div>
          </div>
          
          <Separator />
          
          {models.length > 0 && (
            <>
              <div>
                <h3 className="text-sm font-medium mb-2">Modelli</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {models.map(model => (
                    <div key={model} className="flex items-center gap-2">
                      <Checkbox 
                        id={`model-${model}`} 
                        checked={localFilters.models.includes(model)}
                        onCheckedChange={() => toggleModel(model)}
                      />
                      <Label htmlFor={`model-${model}`}>{model}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
            </>
          )}
          
          {dealers.length > 0 && (
            <>
              <div>
                <h3 className="text-sm font-medium mb-2">Concessionari</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {dealers.map(dealer => (
                    <div key={dealer} className="flex items-center gap-2">
                      <Checkbox 
                        id={`dealer-${dealer}`} 
                        checked={localFilters.dealers.includes(dealer)}
                        onCheckedChange={() => toggleDealer(dealer)}
                      />
                      <Label htmlFor={`dealer-${dealer}`}>{dealer}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleReset}>Reset</Button>
          <Button onClick={handleApplyFilters}>Applica filtri</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
