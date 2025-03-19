
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
  order: Order;
  onSubmit?: (data: any) => Promise<void>;
  isLoading?: boolean;
}

export const OrderDetailsFormAdapter: React.FC<OrderDetailsFormAdapterProps> = ({
  order,
  onSubmit = async () => {},
  isLoading = false
}) => {
  return (
    <OrderDetailsForm
      order={order}
      onSubmit={onSubmit}
      isLoading={isLoading}
    />
  );
};
