
import React from 'react';
import { DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Quote } from '@/types';
import { Edit } from 'lucide-react';

interface QuoteActionsFooterProps {
  quote: Quote;
  onStatusChange: (id: string, status: Quote['status']) => void;
  onConvert?: () => void;
  onEdit?: () => void;
}

const QuoteActionsFooter = ({ quote, onStatusChange, onConvert, onEdit }: QuoteActionsFooterProps) => {
  return (
    <DialogFooter className="mt-3">
      <div className="flex gap-2 w-full justify-end">
        {onEdit && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onEdit}
          >
            <Edit className="h-4 w-4 mr-1" />
            Modifica
          </Button>
        )}
        
        {quote.status === 'pending' && (
          <>
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
              onClick={onConvert}
            >
              Converti in Contratto
            </Button>
          </>
        )}
        
        {quote.status === 'converted' && (
          <Button 
            variant="outline"
            size="sm"
            onClick={() => onStatusChange(quote.id, 'pending')}
          >
            Metti in Attesa
          </Button>
        )}
      </div>
    </DialogFooter>
  );
};

export default QuoteActionsFooter;
