
import React from 'react';
import { Quote, Vehicle } from '@/types';
import QuotePrintContent from './QuotePrintContent';

interface QuotePrintSectionProps {
  quote: Quote;
  vehicle: Vehicle;
}

const QuotePrintSection = ({ quote, vehicle }: QuotePrintSectionProps) => {
  return (
    <div style={{ display: 'none' }} data-print-content="true">
      <div className="print-container">
        <QuotePrintContent quote={quote} vehicle={vehicle} />
      </div>
    </div>
  );
};

export default QuotePrintSection;
