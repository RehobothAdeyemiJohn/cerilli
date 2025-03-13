
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
    <div className="p-8 max-w-3xl mx-auto bg-white text-black print:w-full">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">Dettagli dell'ordine n° {orderNumber}</h1>
        <p className="text-sm text-gray-600">Eseguito il: {formattedDate(order.orderDate)}</p>
      </div>

      {/* Sezione Dealer */}
      <div className="mb-6 border-b pb-4">
        <h2 className="text-xl font-semibold mb-3">Informazioni Dealer</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-sm font-medium text-gray-500">Azienda:</p>
            <p>{order.dealer?.companyName || '-'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Nome Contatto:</p>
            <p>{order.dealer?.contactName || '-'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Email:</p>
            <p>{order.dealer?.email || '-'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Cliente:</p>
            <p>{order.customerName || '-'}</p>
          </div>
        </div>
      </div>

      {/* Sezione Auto */}
      <div className="mb-6 border-b pb-4">
        <h2 className="text-xl font-semibold mb-3">Informazioni Veicolo</h2>
        
        {(order.vehicle?.imageUrl || '/placeholder.svg') && (
          <div className="mb-4 flex justify-center">
            <img 
              src={order.vehicle?.imageUrl || '/placeholder.svg'} 
              alt={`${order.vehicle?.model || 'Veicolo'} ${order.vehicle?.trim || ''}`} 
              className="max-h-48 object-contain" 
            />
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-sm font-medium text-gray-500">Modello:</p>
            <p>{order.vehicle?.model || '-'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Allestimento:</p>
            <p>{order.vehicle?.trim || '-'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Colore:</p>
            <p>{order.vehicle?.exteriorColor || '-'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Cambio:</p>
            <p>{order.vehicle?.transmission || '-'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Carburante:</p>
            <p>{order.vehicle?.fuelType || '-'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Destinazione:</p>
            <p>{order.vehicle?.location || '-'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Telaio:</p>
            <p>{order.vehicle?.telaio || order.details?.chassis || '-'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Anno:</p>
            <p>{order.vehicle?.year || '-'}</p>
          </div>
        </div>

        {/* Optional */}
        {order.vehicle?.accessories && order.vehicle.accessories.length > 0 && (
          <div className="mt-3">
            <p className="text-sm font-medium text-gray-500">Optional:</p>
            <ul className="list-disc pl-5">
              {order.vehicle.accessories.map((accessory, index) => (
                <li key={index}>{accessory}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Sezione Dettagli Amministrativi */}
      <div className="mb-6 border-b pb-4">
        <h2 className="text-xl font-semibold mb-3">Dettagli Amministrativi</h2>
        <div className="grid grid-cols-2 gap-3">
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
            <p>{order.details?.chassis || '-'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Finanziamento:</p>
            <p>{order.details?.fundingType || '-'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Pagato:</p>
            <p>{order.details?.isPaid ? 'Sì' : 'No'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Fatturato:</p>
            <p>{order.details?.isInvoiced ? 'Sì' : 'No'}</p>
          </div>
          {order.details?.invoiceNumber && (
            <div>
              <p className="text-sm font-medium text-gray-500">Numero Fattura:</p>
              <p>{order.details.invoiceNumber}</p>
            </div>
          )}
          {order.details?.invoiceDate && (
            <div>
              <p className="text-sm font-medium text-gray-500">Data Fattura:</p>
              <p>{formattedDate(order.details.invoiceDate)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Costi Aggiuntivi */}
      {(order.details?.transportCosts > 0 || order.details?.restorationCosts > 0) && (
        <div className="mb-6 border-b pb-4">
          <h2 className="text-xl font-semibold mb-3">Costi Aggiuntivi</h2>
          <div className="grid grid-cols-2 gap-3">
            {order.details?.transportCosts > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-500">Costi di Trasporto:</p>
                <p>{new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(order.details.transportCosts)}</p>
              </div>
            )}
            {order.details?.restorationCosts > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-500">Costi di Ripristino:</p>
                <p>{new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(order.details.restorationCosts)}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notes - Only display if order has details with notes */}
      {order.details?.notes && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Note</h2>
          <p className="border p-3 rounded bg-gray-50">{order.details.notes}</p>
        </div>
      )}

      <div className="text-center text-xs text-gray-500 mt-8">
        <p>Documento generato automaticamente dal sistema DMS Cirelli</p>
        <p className="mt-1">Data stampa: {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: it })}</p>
      </div>
    </div>
  );
};

export default OrderPrintContent;
