
import React, { useState, useEffect } from 'react';
import { Vehicle } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Trash2, Pencil } from 'lucide-react';
import VehicleDialogHeader from './VehicleDialogHeader';
import VehicleDialogContent from './VehicleDialogContent';
import { useVehicleDetailsDialog } from './useVehicleDetailsDialog';

interface VehicleDetailsContentProps {
  vehicle: Vehicle;
  onEdit?: () => void;
  onDelete?: () => void;
  isDealerStock?: boolean;
  isVirtualStock?: boolean;
  onCreateQuote?: ((vehicle: Vehicle) => void) | undefined;
  onReserve?: ((vehicle: Vehicle) => void) | undefined;
  onTransformToOrder?: () => void;
  shouldReserve?: boolean;
}

const VehicleDetailsContent: React.FC<VehicleDetailsContentProps> = ({ 
  vehicle,
  onEdit,
  onDelete,
  isDealerStock,
  isVirtualStock,
  onCreateQuote,
  onReserve,
  onTransformToOrder,
  shouldReserve
}) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'superAdmin';
  const canDeleteVehicle = isAdmin && !isDealerStock;
  
  // Determine if the user can create quotes and reserve vehicles
  const userCanCreateQuotes = isAdmin || user?.permissions?.includes('quotes');
  const userCanReserveVehicles = isAdmin || user?.permissions?.includes('inventory');
  
  // State for forms visibility
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [showReserveForm, setShowReserveForm] = useState(false);
  const [showVirtualReserveForm, setShowVirtualReserveForm] = useState(false);
  const [showCancelReservationForm, setShowCancelReservationForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Auto-open reservation form if shouldReserve is true
  useEffect(() => {
    if (shouldReserve && vehicle && vehicle.status === 'available') {
      console.log("Auto-opening reservation form based on shouldReserve flag in VehicleDetailsContent");
      if (vehicle.location === 'Stock Virtuale') {
        setShowVirtualReserveForm(true);
      } else {
        setShowReserveForm(true);
      }
    }
  }, [shouldReserve, vehicle]);
  
  // Define handlers for quote and reservation actions
  const handleShowQuoteForm = () => setShowQuoteForm(true);
  const handleCancelQuote = () => setShowQuoteForm(false);
  
  const handleCreateQuote = async () => {
    setIsSubmitting(true);
    // Implementation would go here
    setIsSubmitting(false);
    setShowQuoteForm(false);
  };
  
  const handleReserveVehicle = () => {
    console.log("Opening standard reservation form");
    setShowReserveForm(true);
  };
  
  const handleReserveVirtualVehicle = () => {
    console.log("Opening virtual reservation form");
    setShowVirtualReserveForm(true);
  };
  
  const handleCancelReservation = () => {
    setShowReserveForm(false);
    setShowVirtualReserveForm(false);
    setShowCancelReservationForm(false);
  };
  
  const handleShowCancelReservationForm = () => setShowCancelReservationForm(true);
  const handleCancelReservationSubmit = async () => {
    setIsSubmitting(true);
    // Implementation would go here
    setIsSubmitting(false);
    setShowCancelReservationForm(false);
  };
  
  // Handle quote creation
  const handleCreateQuoteClick = () => {
    console.log("Create quote button clicked in VehicleDetailsContent", { onCreateQuote, vehicle });
    if (onCreateQuote) {
      onCreateQuote(vehicle);
    } else {
      handleShowQuoteForm();
    }
  };
  
  // Handle reserve click
  const handleReserveClick = () => {
    console.log("Reserve button clicked in VehicleDetailsContent");
    if (onReserve) {
      onReserve(vehicle);
    } else {
      if (vehicle.location === 'Stock Virtuale') {
        handleReserveVirtualVehicle();
      } else {
        handleReserveVehicle();
      }
    }
  };
  
  // We determine if the duplicate button should be shown
  const showDuplicateButton = isVirtualStock || vehicle.location === 'Stock Virtuale';
  
  // Create a simple duplicate handler
  const handleDuplicate = () => {
    console.log("Duplicate button clicked for vehicle:", vehicle.id);
    // Implementation would go here
  };
  
  return (
    <div className="space-y-6">
    
      <VehicleDialogHeader 
        vehicle={vehicle}
        onDuplicate={showDuplicateButton ? handleDuplicate : undefined}
        onCreateQuote={userCanCreateQuotes ? handleCreateQuoteClick : undefined}
        onReserve={
          userCanReserveVehicles && vehicle.status === 'available' 
            ? handleReserveClick 
            : undefined
        }
        onCancelReservation={
          isAdmin && vehicle.status === 'reserved' 
            ? handleShowCancelReservationForm 
            : undefined
        }
        onTransformToOrder={
          isAdmin && vehicle.status === 'reserved' 
            ? onTransformToOrder 
            : undefined
        }
        isAdmin={isAdmin}
        isVirtualStock={isVirtualStock}
        isDealerStock={isDealerStock}
      />
      
      <VehicleDialogContent
        vehicle={vehicle}
        showQuoteForm={showQuoteForm}
        showReserveForm={showReserveForm}
        showVirtualReserveForm={showVirtualReserveForm}
        showCancelReservationForm={showCancelReservationForm}
        isSubmitting={isSubmitting}
        onCreateQuote={handleCreateQuote}
        onCancel={handleCancelReservation}
        onSubmit={handleCancelReservation}
        onConfirm={handleCancelReservationSubmit}
        userCanReserveVehicles={userCanReserveVehicles}
        userCanCreateQuotes={userCanCreateQuotes}
      />
      
      {/* Action buttons */}
      <div className="flex justify-between items-center mt-4">
        <div className="space-x-2">
          {onEdit && isAdmin && !isVirtualStock && (
            <Button 
              variant="outline" 
              onClick={onEdit} 
              className="flex items-center gap-1"
            >
              <Pencil className="h-4 w-4" /> Modifica
            </Button>
          )}
        </div>
        
        <div>
          {onDelete && canDeleteVehicle && (
            <Button 
              variant="destructive" 
              onClick={onDelete}
              className="flex items-center gap-1"
            >
              <Trash2 className="h-4 w-4" /> Elimina
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleDetailsContent;
