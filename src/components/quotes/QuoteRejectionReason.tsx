
import React from 'react';

interface QuoteRejectionReasonProps {
  reason: string;
}

const QuoteRejectionReason = ({ reason }: QuoteRejectionReasonProps) => {
  return (
    <div className="border-t pt-2">
      <p className="text-xs text-gray-500">Motivo Rifiuto</p>
      <p className="font-medium">{reason}</p>
    </div>
  );
};

export default QuoteRejectionReason;
