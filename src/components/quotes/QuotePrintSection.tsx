
import React from 'react';
import { Quote, Vehicle } from '@/types';
import QuotePrintContent from './QuotePrintContent';

interface QuotePrintSectionProps {
  quote: Quote;
  vehicle: Vehicle;
}

const QuotePrintSection = ({ quote, vehicle }: QuotePrintSectionProps) => {
  return (
    <div data-print-content="true">
      <QuotePrintContent quote={quote} vehicle={vehicle} />
    </div>
  );
};

export default QuotePrintSection;
