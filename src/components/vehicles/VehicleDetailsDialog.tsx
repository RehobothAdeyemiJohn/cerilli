
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Vehicle } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { FileText, ShoppingCart, Package } from 'lucide-react';
import EditVehicleForm from './EditVehicleForm';
import ReserveVehicleForm from './ReserveVehicleForm';
import VirtualReservationForm from './virtualReservation/VirtualReservationForm';
import VehicleDetailsContent from './details/VehicleDetailsContent';
import { useVehicleDetailsDialog } from './details/useVehicleDetailsDialog';
import VehicleDialogHeader from './details/VehicleDialogHeader';

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
  requestedAction?: string;
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
  shouldReserve = false,
  requestedAction
}) => {
  const [currentView, setCurrentView] = React.useState<'details' | 'edit' | 'reserve' | 'virtualReserve'>('details');
  const { user } = useAuth();

  const isDealer = user?.type === 'dealer' || user?.type === 'vendor';
  const isAdmin = user?.type === 'admin';
  const canEdit = isAdmin;
  
  const { handleDuplicate } = useVehicleDetailsDialog(
    vehicle || {} as Vehicle, 
    onVehicleUpdated,
    (id: string) => onVehicleDeleted(id),
    () => onOpenChange(false),
    requestedAction
  );
  
  React.useEffect(() => {
    if (open && vehicle && shouldReserve) {
      if (vehicle.location === 'Stock Virtuale') {
        setCurrentView('virtualReserve');
      } else {
        setCurrentView('reserve');
      }
    }
    
    if (open && vehicle && requestedAction === 'duplicate') {
      console.log("Attempting to duplicate vehicle from dialog:", vehicle.id);
      handleDuplicate();
      onOpenChange(false);
    }
  }, [open, vehicle, shouldReserve, requestedAction, handleDuplicate]);
  
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
    if (onCreateQuote && vehicle) {
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

  const handleTransformToOrder = async () => {
    console.log("Transform to order button clicked for vehicle:", vehicle.id);
    
    try {
      const { vehiclesApi } = await import('@/api/supabase');
      await vehiclesApi.transformToOrder(vehicle.id);
      console.log("Vehicle successfully transformed into an order:", vehicle.id);
      onVehicleUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error("Error transforming vehicle to order:", error);
    }
  };

  const showActionButtons = vehicle.status === 'available';
  const showTransformOrderButton = vehicle.status === 'reserved';
  
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
              <VehicleDialogHeader 
                vehicle={vehicle}
                onEdit={canEdit ? handleEditClick : undefined}
                onDelete={canEdit ? handleDeleteClick : undefined}
                onDuplicate={canEdit ? handleDuplicate : undefined}
                onCreateQuote={onCreateQuote ? () => handleCreateQuoteClick() : undefined}
                onReserve={showActionButtons && onReserve ? handleReserveClick : undefined}
                onCancelReservation={undefined}
                onCreateOrder={undefined}
                isDealer={isDealer}
                isVirtualStock={isVirtualStock}
                isDealerStock={isDealerStock}
              />
            </DialogHeader>
            
            <VehicleDetailsContent 
              vehicle={vehicle} 
              onEdit={canEdit ? handleEditClick : undefined}
              onDelete={canEdit ? handleDeleteClick : undefined}
              onClose={() => onOpenChange(false)}
              isDealerStock={isDealerStock}
              isVirtualStock={isVirtualStock}
            />
            
            <DialogFooter className="mt-4 pt-4 border-t">
              <div className="flex w-full gap-3 justify-end">
                {showActionButtons && (
                  <>
                    {onCreateQuote && !isVirtualStock && (
                      <Button 
                        onClick={handleCreateQuoteClick}
                        variant="outline"
                      >
                        <FileText className="h-5 w-5 mr-2" />
                        Preventivo
                      </Button>
                    )}
                    
                    {onReserve && (
                      <Button 
                        onClick={handleReserveClick}
                      >
                        <ShoppingCart className="h-5 w-5 mr-2" />
                        Prenota
                      </Button>
                    )}
                  </>
                )}
                
                {showTransformOrderButton && (
                  <Button 
                    onClick={handleTransformToOrder}
                    variant="default"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Package className="h-5 w-5 mr-2" />
                    Trasforma in Ordine
                  </Button>
                )}
              </div>
            </DialogFooter>
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
