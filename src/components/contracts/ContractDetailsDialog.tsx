
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DealerContract } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface ContractDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  contract: DealerContract | null;
}

const ContractDetailsDialog = ({ isOpen, onClose, contract }: ContractDetailsDialogProps) => {
  if (!contract) return null;

  const vehicleInfo = contract.vehicle 
    ? `${contract.vehicle.model} ${contract.vehicle.trim || ''} - ${contract.vehicle.exteriorColor || ''}`
    : 'Dettagli veicolo non disponibili';
  
  const dealerInfo = contract.dealer
    ? `${contract.dealer.companyName} (${contract.dealer.city}, ${contract.dealer.province})`
    : 'Dettagli concessionario non disponibili';
  
  const price = contract.vehicle ? contract.vehicle.price : 0;
  
  // Extract details from saved JSON
  const detailsObj = contract.contract_details || {};
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Dettagli Contratto</DialogTitle>
          <DialogDescription>
            Contratto {contract.id.substring(0, 8)}... creato il {new Date(contract.contract_date).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500">Informazioni Concessionario</h3>
            <p className="text-base">{dealerInfo}</p>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500">Informazioni Veicolo</h3>
            <p className="text-base">{vehicleInfo}</p>
            <p className="text-base font-medium">
              Prezzo: {formatCurrency(price)}
            </p>
          </div>
          
          <div className="space-y-2 col-span-1 md:col-span-2">
            <h3 className="text-sm font-medium text-gray-500">Stato Contratto</h3>
            <p className={`text-base ${
              contract.status === 'attivo' ? 'text-green-600' : 
              contract.status === 'completato' ? 'text-blue-600' : 'text-gray-600'
            }`}>
              {contract.status === 'attivo' ? 'Attivo' : 
               contract.status === 'completato' ? 'Completato' : contract.status}
            </p>
          </div>
          
          <div className="space-y-2 col-span-1 md:col-span-2">
            <h3 className="text-sm font-medium text-gray-500">Termini e Condizioni</h3>
            <div className="border p-4 rounded-md bg-gray-50 h-48 overflow-y-auto text-sm">
              {Object.entries(detailsObj).map(([key, value]) => (
                <div key={key} className="mb-2">
                  <span className="font-medium">{key}: </span>
                  <span>{JSON.stringify(value)}</span>
                </div>
              ))}
              {Object.keys(detailsObj).length === 0 && (
                <p className="text-gray-400 italic">Nessun dettaglio aggiuntivo specificato</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Chiudi</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ContractDetailsDialog;
