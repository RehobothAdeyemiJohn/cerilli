
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Vehicle } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { FileText, ShoppingCart } from 'lucide-react';
import EditVehicleForm from './EditVehicleForm';
import ReserveVehicleForm from './ReserveVehicleForm';
import VirtualReservationForm from './virtualReservation/VirtualReservationForm';
import VehicleDetailsContent from './details/VehicleDetailsContent';

interface VehicleDetailsDialogProps {
  vehicle: Vehicle | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVehicleUpdated: () => void;
  onVehicleDeleted: (id: string) => Promise<void>;
  onCreateQuote?: (vehicle: Vehicle) => void; 
  onReserve?: (vehicle: Vehicle) => void;
  isDealerStock?: boolean;
  isVirtualStock?: boolean;
  shouldReserve?: boolean;
}

const VehicleDetailsDialog: React.FC<VehicleDetailsDialogProps> = ({
  vehicle,
  open,
  onOpenChange,
  onVehicleUpdated,
  onVehicleDeleted,
  onCreateQuote,
  onReserve,
  isDealerStock = false,
  isVirtualStock = false,
  shouldReserve = false
}) => {
  // State for different dialog modes
  const [currentView, setCurrentView] = React.useState<'details' | 'edit' | 'reserve' | 'virtualReserve'>('details');
  const { user } = useAuth();

  // Determine if the user is a dealer and can reserve vehicles
  const isDealer = user?.type === 'dealer' || user?.type === 'vendor';
  const canReserve = isDealer && vehicle?.status === 'available';
  const canEdit = user?.type === 'admin';
  
  // Effect to handle the shouldReserve prop
  React.useEffect(() => {
    if (open && vehicle && shouldReserve) {
      if (vehicle.location === 'Stock Virtuale') {
        setCurrentView('virtualReserve');
      } else {
        setCurrentView('reserve');
      }
    }
  }, [open, vehicle, shouldReserve]);
  
  // Reset state when dialog closes
  React.useEffect(() => {
    if (!open) {
      setCurrentView('details');
    }
  }, [open]);
  
  if (!vehicle) {
    return null;
  }
  
  const handleEditClick = () => {
    setCurrentView('edit');
  };
  
  const handleReserveClick = () => {
    console.log("Reserve button clicked in dialog for vehicle:", vehicle.id, vehicle.location);
    if (vehicle.location === 'Stock Virtuale') {
      setCurrentView('virtualReserve');
    } else {
      setCurrentView('reserve');
    }
  };
  
  const handleCreateQuoteClick = () => {
    console.log("Create quote button clicked for vehicle:", vehicle.id);
    if (onCreateQuote) {
      onCreateQuote(vehicle);
      onOpenChange(false);
    }
  };
  
  const handleDeleteClick = async () => {
    try {
      await onVehicleDeleted(vehicle.id);
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting vehicle from dialog:', error);
    }
  };
  
  const handleReservationComplete = () => {
    console.log("Reservation completed, refreshing data");
    onVehicleUpdated();
    setCurrentView('details');
    onOpenChange(false);
  };
  
  // IMPORTANT: Determine which actions are available
  const showReserveButton = Boolean(onReserve) && canReserve;
  const showCreateQuoteButton = Boolean(onCreateQuote) && canReserve && !isVirtualStock;
  
  // Dialog content based on current view
  const renderDialogContent = () => {
    switch(currentView) {
      case 'edit':
        return (
          <EditVehicleForm 
            vehicle={vehicle}
            onComplete={() => {
              onVehicleUpdated();
              setCurrentView('details');
              onOpenChange(false);
            }}
            onCancel={() => setCurrentView('details')}
          />
        );
      case 'reserve':
        return (
          <ReserveVehicleForm
            vehicle={vehicle}
            onReservationComplete={handleReservationComplete}
            onCancel={() => setCurrentView('details')}
          />
        );
      case 'virtualReserve':
        return (
          <VirtualReservationForm
            vehicle={vehicle}
            onReservationComplete={handleReservationComplete}
            onCancel={() => setCurrentView('details')}
          />
        );
      case 'details':
      default:
        return (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl">
                {vehicle.model} {vehicle.trim}
              </DialogTitle>
              <DialogDescription>
                Dettagli del veicolo e azioni disponibili
              </DialogDescription>
            </DialogHeader>
            
            <VehicleDetailsContent 
              vehicle={vehicle} 
              onEdit={canEdit ? handleEditClick : undefined}
              onDelete={canEdit ? handleDeleteClick : undefined}
              onClose={() => onOpenChange(false)}
              isDealerStock={isDealerStock}
              isVirtualStock={isVirtualStock}
            />
            
            {/* Footer with action buttons */}
            {(showReserveButton || showCreateQuoteButton) && (
              <DialogFooter className="mt-4 pt-4 border-t">
                <div className="flex w-full gap-3 justify-between">
                  {showCreateQuoteButton && (
                    <Button 
                      onClick={handleCreateQuoteClick}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300"
                    >
                      <FileText className="h-5 w-5 mr-2" />
                      Crea Preventivo
                    </Button>
                  )}
                  
                  {showReserveButton && (
                    <Button 
                      onClick={handleReserveClick}
                      className="flex-1 bg-blue-700 hover:bg-blue-800 text-white"
                    >
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Prenota
                    </Button>
                  )}
                </div>
              </DialogFooter>
            )}
          </>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        {renderDialogContent()}
      </DialogContent>
    </Dialog>
  );
};

export default VehicleDetailsDialog;
