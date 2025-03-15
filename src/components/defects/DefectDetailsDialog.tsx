
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { defectReportsApi } from '@/api/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Loader2 } from 'lucide-react';
import DefectStatusBadge from './DefectStatusBadge';

type DefectDetailsDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  defectId: string;
};

const DefectDetailsDialog = ({ isOpen, onClose, defectId }: DefectDetailsDialogProps) => {
  const { data: defect, isLoading } = useQuery({
    queryKey: ['defect', defectId],
    queryFn: () => defectReportsApi.getById(defectId),
    enabled: isOpen && !!defectId,
  });

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!defect) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>Segnalazione Difformità #{defect.caseNumber}</DialogTitle>
            <DefectStatusBadge status={defect.status} />
          </div>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Dealer</h3>
              <p className="text-base">{defect.dealerName}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Motivo</h3>
              <p className="text-base">{defect.reason}</p>
            </div>
            
            {defect.email && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Email di riferimento</h3>
                <p className="text-base">{defect.email}</p>
              </div>
            )}
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Data ricevimento veicolo</h3>
              <p className="text-base">
                {format(new Date(defect.vehicleReceiptDate), 'dd MMMM yyyy', { locale: it })}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Costo riparazione stimato</h3>
              <p className="text-base">€{defect.repairCost.toLocaleString('it-IT')}</p>
            </div>

            {defect.approvedRepairValue > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Valore riparazione approvata</h3>
                <p className="text-base">€{defect.approvedRepairValue.toLocaleString('it-IT')}</p>
              </div>
            )}
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Data apertura pratica</h3>
              <p className="text-base">
                {format(new Date(defect.createdAt), 'dd MMMM yyyy', { locale: it })}
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            {defect.transportDocumentUrl && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Documento di trasporto</h3>
                <a 
                  href={defect.transportDocumentUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Visualizza documento
                </a>
              </div>
            )}
            
            {defect.repairQuoteUrl && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Preventivo riparazione</h3>
                <a 
                  href={defect.repairQuoteUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Visualizza preventivo
                </a>
              </div>
            )}
            
            {defect.sparePartsRequest && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Richiesta ricambio</h3>
                <p className="text-base whitespace-pre-wrap">{defect.sparePartsRequest}</p>
              </div>
            )}
            
            {defect.paymentDate && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Data pagamento</h3>
                <p className="text-base">
                  {format(new Date(defect.paymentDate), 'dd MMMM yyyy', { locale: it })}
                </p>
              </div>
            )}
            
            {defect.adminNotes && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Note amministrative</h3>
                <p className="text-base whitespace-pre-wrap">{defect.adminNotes}</p>
              </div>
            )}
          </div>
        </div>
        
        <Separator />
        
        <div className="py-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Descrizione difformità</h3>
          <p className="text-base whitespace-pre-wrap">{defect.description}</p>
        </div>
        
        {defect.photoReportUrls && defect.photoReportUrls.length > 0 && (
          <div className="py-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Report fotografico</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {defect.photoReportUrls.map((url, index) => (
                <a 
                  key={index} 
                  href={url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="block"
                >
                  <img 
                    src={url} 
                    alt={`Photo ${index + 1}`} 
                    className="w-full h-48 object-cover rounded shadow-md hover:shadow-lg transition-shadow"
                  />
                </a>
              ))}
            </div>
          </div>
        )}
        
        <DialogFooter>
          <Button onClick={onClose}>Chiudi</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DefectDetailsDialog;
