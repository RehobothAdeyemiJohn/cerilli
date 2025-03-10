
import React from 'react';
import { orders, vehicles } from '@/data/mockData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Orders = () => {
  const processingOrders = orders.filter(o => o.status === 'processing');
  const deliveredOrders = orders.filter(o => o.status === 'delivered');
  const cancelledOrders = orders.filter(o => o.status === 'cancelled');
  
  const getVehicleById = (id: string) => {
    return vehicles.find(v => v.id === id);
  };
  
  const getStatusBadgeClass = (status: string) => {
    switch(status) {
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const renderOrderTable = (filteredOrders: typeof orders) => (
    <div className="rounded-md border">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="p-3 text-left font-medium">Customer</th>
              <th className="p-3 text-left font-medium">Vehicle</th>
              <th className="p-3 text-left font-medium">Status</th>
              <th className="p-3 text-left font-medium">Order Date</th>
              <th className="p-3 text-left font-medium">Delivery Date</th>
              <th className="p-3 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => {
                const vehicle = getVehicleById(order.vehicleId);
                return (
                  <tr key={order.id} className="border-b">
                    <td className="p-3">{order.customerName}</td>
                    <td className="p-3">{vehicle ? `${vehicle.model} ${vehicle.trim}` : 'Unknown'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="p-3">{new Date(order.orderDate).toLocaleDateString()}</td>
                    <td className="p-3">{order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : '-'}</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded">
                          View
                        </button>
                        {order.status === 'processing' && (
                          <>
                            <button className="text-xs bg-green-100 hover:bg-green-200 px-2 py-1 rounded text-green-800">
                              Mark Delivered
                            </button>
                            <button className="text-xs bg-red-100 hover:bg-red-200 px-2 py-1 rounded text-red-800">
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="p-3 text-center text-gray-500">
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
  
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <div className="mt-4 md:mt-0">
          <button className="px-4 py-2 bg-primary text-white rounded-md">
            Create New Order
          </button>
        </div>
      </div>
      
      <Tabs defaultValue="processing">
        <TabsList className="mb-6">
          <TabsTrigger value="processing">Processing ({processingOrders.length})</TabsTrigger>
          <TabsTrigger value="delivered">Delivered ({deliveredOrders.length})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({cancelledOrders.length})</TabsTrigger>
          <TabsTrigger value="all">All Orders ({orders.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="processing">
          {renderOrderTable(processingOrders)}
        </TabsContent>
        
        <TabsContent value="delivered">
          {renderOrderTable(deliveredOrders)}
        </TabsContent>
        
        <TabsContent value="cancelled">
          {renderOrderTable(cancelledOrders)}
        </TabsContent>
        
        <TabsContent value="all">
          {renderOrderTable(orders)}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Orders;
