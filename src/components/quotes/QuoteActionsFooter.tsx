
import React from 'react';
import { DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Quote } from '@/types';

interface QuoteActionsFooterProps {
  quote: Quote;
  onStatusChange: (id: string, status: Quote['status']) => void;
}

const QuoteActionsFooter = ({ quote, onStatusChange }: QuoteActionsFooterProps) => {
  return (
    <DialogFooter className="mt-3">
      {quote.status === 'pending' && (
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onStatusChange(quote.id, 'rejected')}
          >
            Rifiuta
          </Button>
          <Button 
            variant="default"
            size="sm"
            onClick={() => onStatusChange(quote.id, 'approved')}
          >
            Approva
          </Button>
        </div>
      )}
      
      {quote.status === 'approved' && (
        <div className="flex gap-2">
          <Button 
            variant="outline"
            size="sm"
            onClick={() => onStatusChange(quote.id, 'pending')}
          >
            Metti in Attesa
          </Button>
          <Button 
            variant="default"
            size="sm" 
            onClick={() => onStatusChange(quote.id, 'converted')}
          >
            Converti in Vendita
          </Button>
        </div>
      )}
    </DialogFooter>
  );
};

export default QuoteActionsFooter;
