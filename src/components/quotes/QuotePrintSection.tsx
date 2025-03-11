
import React, { useRef } from 'react';
import { Quote, Vehicle } from '@/types';
import QuotePrintContent from './QuotePrintContent';

interface QuotePrintSectionProps {
  quote: Quote;
  vehicle: Vehicle;
}

const QuotePrintSection = ({ quote, vehicle }: QuotePrintSectionProps) => {
  const printRef = useRef<HTMLDivElement>(null);
  
  return (
    <div style={{ display: 'none' }} data-print-content="true">
      <QuotePrintContent ref={printRef} quote={quote} vehicle={vehicle} />
    </div>
  );
};

export default QuotePrintSection;
