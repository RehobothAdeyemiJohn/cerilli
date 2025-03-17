
import React from 'react';
import { Quote } from '@/types';

interface QuoteStatusBadgeProps {
  status: Quote['status'];
}

const QuoteStatusBadge = ({ status }: QuoteStatusBadgeProps) => {
  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'pending': return 'In attesa';
      case 'converted': return 'Convertito in contratto';
      case 'rejected': return 'Rifiutato';
      default: return status;
    }
  };
  
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'converted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(status)}`}>
      {getStatusLabel(status)}
    </span>
  );
};

export default QuoteStatusBadge;
