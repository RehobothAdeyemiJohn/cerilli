
import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Vehicle } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { FileText, ShoppingCart } from 'lucide-react';
import EditVehicleForm from './EditVehicleForm';
import ReserveVehicleForm from './ReserveVehicleForm';
import VirtualReservationForm from './virtualReservation/VirtualReservationForm';

// Import the vehicle details content component
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
  
  const handleDialogClose = () => {
    onOpenChange(false);
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
  // This ensures the button visibility is determined by both user permissions and available callbacks
  const showReserveButton = Boolean(onReserve) && canReserve;
  const showCreateQuoteButton = Boolean(onCreateQuote) && canReserve && !isVirtualStock;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        {currentView === 'details' && (
          <div className="space-y-4">
            {/* PROMINENT ACTION BUTTONS AT THE TOP */}
            {(showReserveButton || showCreateQuoteButton) && (
              <div className="flex flex-wrap gap-3 mb-6">
                {showCreateQuoteButton && (
                  <Button 
                    onClick={handleCreateQuoteClick}
                    className="bg-green-600 hover:bg-green-700 text-white"
                    size="lg"
                  >
                    <FileText className="h-5 w-5 mr-2" />
                    Crea Preventivo
                  </Button>
                )}
                
                {showReserveButton && (
                  <Button 
                    onClick={handleReserveClick}
                    className="bg-blue-700 hover:bg-blue-800 text-white"
                    size="lg"
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Prenota
                  </Button>
                )}
              </div>
            )}
            
            {/* Vehicle details content */}
            <VehicleDetailsContent 
              vehicle={vehicle} 
              onEdit={canEdit ? handleEditClick : undefined}
              onDelete={canEdit ? handleDeleteClick : undefined}
              onClose={handleDialogClose}
              isDealerStock={isDealerStock}
              isVirtualStock={isVirtualStock}
            />
          </div>
        )}

        {currentView === 'edit' && (
          <EditVehicleForm 
            vehicle={vehicle}
            onComplete={() => {
              onVehicleUpdated();
              setCurrentView('details');
              onOpenChange(false);
            }}
            onCancel={() => setCurrentView('details')}
          />
        )}
        
        {currentView === 'reserve' && (
          <ReserveVehicleForm
            vehicle={vehicle}
            onReservationComplete={handleReservationComplete}
            onCancel={() => setCurrentView('details')}
          />
        )}
        
        {currentView === 'virtualReserve' && (
          <VirtualReservationForm
            vehicle={vehicle}
            onReservationComplete={handleReservationComplete}
            onCancel={() => setCurrentView('details')}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default VehicleDetailsDialog;
