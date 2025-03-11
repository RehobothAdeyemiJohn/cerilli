
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
  const printContentRef = useRef<HTMLDivElement | null>(null);
  
  // When component mounts, set the ref to point to the printable content
  React.useEffect(() => {
    if (printContentRef.current === null) {
      const element = document.querySelector('[data-print-content="true"]');
      if (element) {
        printContentRef.current = element as HTMLDivElement;
      }
    }
  }, []);

  // Setup the print handler with the correct options
  const handlePrint = useReactToPrint({
    documentTitle: `Preventivo_${quote?.id || 'auto'}`,
    onAfterPrint: () => console.log('Print completed'),
    pageStyle: '@page { size: auto; margin: 10mm }',
    // Use content function instead of contentRef
    content: () => printContentRef.current,
  });

  return (
    <DialogHeader className="pb-2 flex flex-row justify-between items-center">
      <DialogTitle>Dettagli Preventivo</DialogTitle>
      <Button 
        variant="outline" 
        size="sm" 
        // Wrap the handlePrint in a function to match the expected MouseEventHandler type
        onClick={() => {
          if (handlePrint) {
            handlePrint();
          }
        }}
        className="flex items-center gap-2"
      >
        <Printer className="h-4 w-4" />
        Stampa PDF
      </Button>
    </DialogHeader>
  );
};

export default QuoteDetailsHeader;
