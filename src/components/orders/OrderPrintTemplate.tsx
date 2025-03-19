
import React, { forwardRef } from 'react';
import { Order } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface OrderPrintTemplateProps {
  order: Order;
  getOrderNumber: (order: Order) => string;
}

const OrderPrintTemplate = forwardRef<HTMLDivElement, OrderPrintTemplateProps>(
  ({ order, getOrderNumber }, ref) => {
    const formattedDate = new Date(order.orderDate).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    const vehicleInfo = order.vehicle ? (
      <>
        <p className="mb-1">Modello: {order.vehicle.model}</p>
        <p className="mb-1">Telaio: {order.vehicle.telaio || 'N/A'}</p>
        <p className="mb-1">Colore: {order.vehicle.exteriorColor}</p>
        <p className="mb-1">Prezzo: {formatCurrency(order.vehicle.price)}</p>
      </>
    ) : (
      <p>Informazioni veicolo non disponibili</p>
    );

    const dealerInfo = order.dealer ? (
      <>
        <p className="mb-1">{order.dealer.companyName}</p>
        <p className="mb-1">{order.dealer.address}</p>
        <p className="mb-1">{order.dealer.city}, {order.dealer.province} {order.dealer.zipCode}</p>
      </>
    ) : (
      <p>Informazioni dealer non disponibili</p>
    );

    return (
      <div ref={ref} className="p-8 max-w-2xl mx-auto bg-white">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold mb-2">CIRELLI MOTOR COMPANY</h1>
          <p className="text-gray-500">Via dell'Industria 22 - 80147 Napoli (NA)</p>
          <p className="text-gray-500">P.IVA 07969450633</p>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold mb-2 border-b pb-2">ORDINE N. {getOrderNumber(order)}</h2>
          <p className="text-gray-700">Data: {formattedDate}</p>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-bold mb-3">Concessionario:</h3>
            {dealerInfo}
          </div>
          <div>
            <h3 className="font-bold mb-3">Veicolo:</h3>
            {vehicleInfo}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="font-bold mb-3">Cliente:</h3>
          <p>{order.customerName}</p>
        </div>

        <div className="mb-8">
          <h3 className="font-bold mb-3">Dettagli:</h3>
          <div className="border-t border-b py-4">
            <div className="grid grid-cols-2 gap-4">
              <p>Targabile: {order.isLicensable ? 'Sì' : 'No'}</p>
              <p>Pagato: {order.isPaid ? 'Sì' : 'No'}</p>
              <p>Ha Proforma: {order.hasProforma ? 'Sì' : 'No'}</p>
              <p>Fatturato: {order.isInvoiced ? 'Sì' : 'No'}</p>
              <p>N. Fattura: {order.invoiceNumber || 'N/A'}</p>
              <p>Data Pagamento: {order.paymentDate ? new Date(order.paymentDate).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center text-sm text-gray-500">
          <p>Questo documento non ha valore fiscale</p>
        </div>
      </div>
    );
  }
);

OrderPrintTemplate.displayName = 'OrderPrintTemplate';

export default OrderPrintTemplate;
