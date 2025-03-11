
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
  // Create a ref to store the printable content reference
  const printContentRef = useRef(null);
  
  // When component mounts, set the ref to point to the printable content
  React.useEffect(() => {
    if (printContentRef.current === null) {
      printContentRef.current = document.querySelector('[data-print-content="true"]');
    }
  }, []);

  const handlePrint = useReactToPrint({
    documentTitle: `Preventivo_${quote?.id || 'auto'}`,
    onAfterPrint: () => console.log('Print completed'),
    pageStyle: '@page { size: auto; margin: 10mm }',
    contentRef: printContentRef,
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
