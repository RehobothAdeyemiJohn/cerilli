
import React from 'react';
import { Order } from '@/types';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface OrderPrintContentProps {
  order: Order;
  orderNumber: string;
}

const OrderPrintContent: React.FC<OrderPrintContentProps> = ({ order, orderNumber }) => {
  const formattedDate = (date: string | undefined) => {
    if (!date) return '-';
    return format(new Date(date), 'dd MMMM yyyy', { locale: it });
  };

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto bg-white text-black print:w-full">
      <div className="text-center mb-6">
        <h1 className="text-xl md:text-2xl font-bold">Dettagli dell'ordine n° {orderNumber}</h1>
        <p className="text-xs md:text-sm text-gray-600">Eseguito il: {formattedDate(order.orderDate)}</p>
      </div>

      {/* Sezione Dealer */}
      <div className="mb-6 border-b pb-4">
        <h2 className="text-lg md:text-xl font-semibold mb-2">Informazioni Dealer</h2>
        <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-500 inline mr-2">Email:</p>
            <p className="inline">{order.dealer?.email || '-'}</p>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-500 inline mr-2">Cliente:</p>
            <p className="inline">{order.customerName || '-'}</p>
          </div>
        </div>
      </div>

      {/* Sezione Auto */}
      <div className="mb-6 border-b pb-4">
        <h2 className="text-lg md:text-xl font-semibold mb-2">Informazioni Veicolo</h2>
        
        {(order.vehicle?.imageUrl || '/placeholder.svg') && (
          <div className="mb-4 flex justify-center">
            <img 
              src={order.vehicle?.imageUrl || '/placeholder.svg'} 
              alt={`${order.vehicle?.model || 'Veicolo'} ${order.vehicle?.trim || ''}`} 
              className="max-h-36 md:max-h-48 object-contain" 
            />
          </div>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <div>
            <p className="text-sm font-medium text-gray-500">Modello</p>
            <p className="break-words">{order.vehicle?.model || '-'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Motore</p>
            <p className="break-words">{order.vehicle?.fuelType || '-'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Allestimento</p>
            <p className="break-words">{order.vehicle?.trim || '-'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Cambio</p>
            <p className="break-words">{order.vehicle?.transmission || '-'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Colore</p>
            <p className="break-words">{order.vehicle?.exteriorColor || '-'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Telaio</p>
            <p className="break-words">{order.vehicle?.telaio || order.chassis || '-'}</p>
          </div>
        </div>

        {/* Optional */}
        {order.vehicle?.accessories && order.vehicle.accessories.length > 0 && (
          <div className="mt-3">
            <p className="text-sm font-medium text-gray-500">Optional:</p>
            <ul className="list-disc pl-5 text-sm">
              {order.vehicle.accessories.map((accessory, index) => (
                <li key={index} className="break-words">{accessory}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Sezione Dettagli Amministrativi */}
      <div className="mb-6 border-b pb-4">
        <h2 className="text-lg md:text-xl font-semibold mb-2">Dettagli Amministrativi</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <p className="text-sm font-medium text-gray-500">Stato:</p>
            <p>{order.status === 'processing' ? 'In Lavorazione' : 
                order.status === 'delivered' ? 'Consegnato' : 
                order.status === 'cancelled' ? 'Cancellato' : order.status}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Data Consegna:</p>
            <p>{formattedDate(order.deliveryDate)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Telaio:</p>
            <p>{order.chassis || '-'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Finanziamento:</p>
            <p>{order.fundingType || '-'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Pagato:</p>
            <p>{order.isPaid ? 'Sì' : 'No'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Fatturato:</p>
            <p>{order.isInvoiced ? 'Sì' : 'No'}</p>
          </div>
          {order.invoiceNumber && (
            <div>
              <p className="text-sm font-medium text-gray-500">Numero Fattura:</p>
              <p>{order.invoiceNumber}</p>
            </div>
          )}
          {order.invoiceDate && (
            <div>
              <p className="text-sm font-medium text-gray-500">Data Fattura:</p>
              <p>{formattedDate(order.invoiceDate)}</p>
            </div>
          )}
        </div>
      </div>

      <div className="text-center text-xs text-gray-500 mt-6 md:mt-8">
        <p>Documento generato automaticamente dal sistema DMS Cirelli</p>
        <p className="mt-1">Data stampa: {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: it })}</p>
      </div>
    </div>
  );
};

export default OrderPrintContent;
