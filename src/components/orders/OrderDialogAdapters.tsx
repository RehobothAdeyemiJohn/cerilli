
import React from 'react';
import OrderDetailsDialog from './OrderDetailsDialog';
import OrderDetailsForm from './OrderDetailsForm';
import { Order } from '@/types';

interface OrderDetailsDialogAdapterProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export const OrderDetailsDialogAdapter: React.FC<OrderDetailsDialogAdapterProps> = ({
  isOpen,
  onClose,
  order
}) => {
  if (!order) return null;
  
  return (
    <OrderDetailsDialog
      open={isOpen} // Map 'isOpen' to 'open'
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      order={order}
    />
  );
};

interface OrderDetailsFormAdapterProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export const OrderDetailsFormAdapter: React.FC<OrderDetailsFormAdapterProps> = ({
  isOpen,
  onClose,
  order
}) => {
  if (!order) return null;
  
  return (
    <OrderDetailsForm
      open={isOpen} // Map 'isOpen' to 'open'
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      order={order}
    />
  );
};
