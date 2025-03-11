
import React from 'react';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { Quote } from '@/types';
import { useReactToPrint } from 'react-to-print';

interface QuoteDetailsHeaderProps {
  quote: Quote;
}

const QuoteDetailsHeader = ({ quote }: QuoteDetailsHeaderProps) => {
  const handlePrint = useReactToPrint({
    documentTitle: `Preventivo_${quote?.id || 'auto'}`,
    onAfterPrint: () => console.log('Print completed'),
    // Use a simple page style with auto margins
    pageStyle: '@page { size: auto; margin: 10mm }',
    content: () => document.querySelector('[data-print-content="true"]'),
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
