
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { orderDetailsApi } from '@/api/orderDetailsApiSwitch';
import { dealersApi } from '@/api/supabase/dealersApi';
import { vehiclesApi } from '@/api/supabase/vehiclesApi';
import { Order, OrderDetails, Vehicle, Dealer } from '@/types';
import OrderDetailsForm from './OrderDetailsForm';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { calculateAvailableCredit } from '@/utils/dealerUtils';

interface OrderDetailsDialogProps {
  order: Order;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  onGenerateODL?: (details: OrderDetails) => void;
}

const OrderDetailsDialog = ({
  order,
  open,
  onOpenChange,
  onSuccess,
  onGenerateODL,
}: OrderDetailsDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [vehicleData, setVehicleData] = useState<Vehicle | null>(null);
  const [dealerData, setDealerData] = useState<Dealer | null>(null);

  const {
    data: orderDetails,
    isLoading: isLoadingDetails,
    error: detailsError,
    refetch,
  } = useQuery({
    queryKey: ['orderDetails', order.id],
    queryFn: () => orderDetailsApi.getByOrderId(order.id),
    enabled: !!order.id && open,
    staleTime: 0, // Always fetch fresh data
  });

  const fetchVehicleDetails = async () => {
    try {
      if (order.vehicleId) {
        const vehicle = await vehiclesApi.getById(order.vehicleId);
        setVehicleData(vehicle);
      }
    } catch (error) {
      console.error('Error fetching vehicle details:', error);
      toast({
        title: "Errore",
        description: "Impossibile recuperare i dettagli del veicolo",
        variant: "destructive",
      });
    }
  };

  const fetchDealerDetails = async () => {
    try {
      if (order.dealerId) {
        const dealer = await dealersApi.getById(order.dealerId);
        setDealerData(dealer);
      }
    } catch (error) {
      console.error('Error fetching dealer details:', error);
      toast({
        title: "Errore",
        description: "Impossibile recuperare i dettagli del dealer",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (open && order) {
      fetchVehicleDetails();
      fetchDealerDetails();
      // Force refetch of order details when dialog opens
      refetch();
    }
  }, [open, order, refetch]);

  const getAvailableCreditColor = (availableCredit: number | null) => {
    if (availableCredit === null) return "bg-gray-100 text-gray-800";
    if (availableCredit > 50000) return "bg-green-100 text-green-800";
    if (availableCredit > 10000) return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return "N/A";
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  const availableCredit = dealerData ? calculateAvailableCredit(dealerData, order) : null;
  const orderCost = vehicleData?.price || 0;

  const handleGenerateODL = (details: OrderDetails) => {
    if (onGenerateODL) {
      onGenerateODL(details);
    }
    
    // Update local state to reflect changes
    refetch();
    
    // Invalidate all related queries to ensure UI updates correctly
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    queryClient.invalidateQueries({ queryKey: ['orderDetails'] });
    queryClient.invalidateQueries({ queryKey: ['ordersWithDetails'] });
    
    toast({
      title: "ODL generato con successo",
      description: "L'Ordine Di Lavorazione è stato generato correttamente",
    });
  };

  const handleSuccess = () => {
    console.log('OrderDetailsForm reported success, notifying parent component');
    
    // Refresh form data
    refetch();
    
    // Force an immediate refetch of all orders to update the UI
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    queryClient.invalidateQueries({ queryKey: ['orderDetails'] });
    queryClient.invalidateQueries({ queryKey: ['ordersWithDetails'] });
    
    if (onSuccess) {
      onSuccess();
    }
    
    // Close the dialog when save is successful
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Dettagli Ordine</DialogTitle>
          <DialogDescription>
            Gestisci i dettagli amministrativi dell'ordine
          </DialogDescription>
        </DialogHeader>
        
        {isLoadingDetails ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-500">Caricamento dettagli...</span>
          </div>
        ) : detailsError ? (
          <div className="py-10 text-center text-red-500">
            Si è verificato un errore durante il caricamento dei dettagli.
          </div>
        ) : (
          <div className="space-y-6">
            {dealerData && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Informazioni Dealer</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Dealer</p>
                      <p>{dealerData.companyName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Plafond Totale</p>
                      <p>{formatCurrency(dealerData.creditLimit)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Importo Ordine</p>
                      <p>{formatCurrency(orderCost)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Plafond Disponibile</p>
                      <div className="flex items-center">
                        <Badge className={getAvailableCreditColor(availableCredit)}>
                          {formatCurrency(availableCredit)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <OrderDetailsForm
              orderId={order.id}
              orderDetails={orderDetails}
              vehicle={vehicleData || undefined}
              onGenerateODL={handleGenerateODL}
              onSuccess={handleSuccess}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsDialog;
