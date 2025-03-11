
import React, { useRef } from 'react';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { Quote } from '@/types';
import { useReactToPrint } from 'react-to-print';

interface QuoteDetailsHeaderProps {
  quote: Quote;
}

const QuoteDetailsHeader = ({ quote }: QuoteDetailsHeaderProps) => {
  // We need to properly use useReactToPrint according to its type definition
  const handlePrint = useReactToPrint({
    documentTitle: `Preventivo_${quote?.id || 'auto'}`,
    onAfterPrint: () => console.log('Print completed'),
    pageStyle: '@page { size: auto; margin: 0mm }',
    // The content property should return the element to be printed
    // Use a function that returns the element with the data-print-content attribute
    contentRef: null, // We're not using a ref directly
    // Instead we'll use a function in onBeforeGetContent
    onBeforeGetContent: () => {
      return document.querySelector('[data-print-content="true"]') as HTMLElement;
    },
    onPrintError: (errorLocation, error) => {
      console.error(`Print error: ${errorLocation}`, error);
    },
  });

  return (
    <DialogHeader className="pb-2 flex flex-row justify-between items-center">
      <DialogTitle>Dettagli Preventivo</DialogTitle>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => handlePrint()}
        className="flex items-center gap-2"
      >
        <Printer className="h-4 w-4" />
        Stampa PDF
      </Button>
    </DialogHeader>
  );
};

export default QuoteDetailsHeader;
