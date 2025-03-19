
import React from 'react';
import OrderDetailsDialog from './OrderDetailsDialog';
import OrderDetailsForm from './OrderDetailsForm';
import { Order } from '@/types';

interface OrderDetailsDialogAdapterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order;
}

export const OrderDetailsDialogAdapter: React.FC<OrderDetailsDialogAdapterProps> = ({
  open,
  onOpenChange,
  order
}) => {
  return (
    <OrderDetailsDialog
      open={open}
      onOpenChange={onOpenChange}
      order={order}
    />
  );
};

interface OrderDetailsFormAdapterProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
}

export const OrderDetailsFormAdapter: React.FC<OrderDetailsFormAdapterProps> = ({
  isOpen,
  onClose,
  order
}) => {
  return (
    <OrderDetailsForm
      isOpen={isOpen}
      onClose={onClose}
      order={order}
    />
  );
};
