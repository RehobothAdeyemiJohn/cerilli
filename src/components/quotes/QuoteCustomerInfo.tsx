
import React from 'react';
import { Quote } from '@/types';
import { formatCurrency } from '@/lib/utils';
import QuoteStatusBadge from './QuoteStatusBadge';

interface QuoteCustomerInfoProps {
  quote: Quote;
}

const QuoteCustomerInfo = ({ quote }: QuoteCustomerInfoProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="grid grid-cols-4 gap-2">
      <div>
        <p className="text-xs text-gray-500">Cliente</p>
        <p className="font-medium">{quote.customerName}</p>
      </div>
      <div>
        <p className="text-xs text-gray-500">Email</p>
        <p className="font-medium">{quote.customerEmail}</p>
      </div>
      <div>
        <p className="text-xs text-gray-500">Telefono</p>
        <p className="font-medium">{quote.customerPhone}</p>
      </div>
      <div>
        <p className="text-xs text-gray-500">Data Creazione</p>
        <p className="font-medium">{formatDate(quote.createdAt)}</p>
      </div>
      <div>
        <p className="text-xs text-gray-500">Stato</p>
        <p className="font-medium">
          <QuoteStatusBadge status={quote.status} />
        </p>
      </div>
      <div>
        <p className="text-xs text-gray-500">Sconto</p>
        <p className="font-medium">{formatCurrency(quote.discount || 0)}</p>
      </div>
      
      {quote.accessories && quote.accessories.length > 0 && (
        <div className="col-span-2">
          <p className="text-xs text-gray-500">Optional Aggiunti</p>
          <div className="font-medium flex flex-wrap gap-1">
            {quote.accessories.map((acc, idx) => (
              <span key={idx} className="text-xs bg-gray-100 px-1 py-0.5 rounded">
                {acc}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuoteCustomerInfo;
