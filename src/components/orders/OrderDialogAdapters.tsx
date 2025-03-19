
import React from 'react';
import OrderDetailsDialog from './OrderDetailsDialog';
import OrderDetailsForm from './OrderDetailsForm';
import { Order } from '@/types';

interface OrderDetailsDialogAdapterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order;
  onGenerateODL?: (orderId: string) => void;
}

export const OrderDetailsDialogAdapter: React.FC<OrderDetailsDialogAdapterProps> = ({
  open,
  onOpenChange,
  order,
  onGenerateODL
}) => {
  return (
    <OrderDetailsDialog
      open={open}
      onOpenChange={onOpenChange}
      order={order}
      onGenerateODL={onGenerateODL}
    />
  );
};

interface OrderDetailsFormAdapterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order;
}

export const OrderDetailsFormAdapter: React.FC<OrderDetailsFormAdapterProps> = ({
  open,
  onOpenChange,
  order
}) => {
  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <OrderDetailsForm
      open={open}
      onOpenChange={onOpenChange}
      order={order}
    />
  );
};
