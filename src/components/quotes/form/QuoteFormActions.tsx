
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface QuoteFormActionsProps {
  onCancel: () => void;
  isSubmitting?: boolean;
}

const QuoteFormActions: React.FC<QuoteFormActionsProps> = ({ onCancel, isSubmitting = false }) => {
  return (
    <div className="flex justify-end gap-3 pt-2">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isSubmitting}
      >
        Annulla
      </Button>
      <Button
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creazione...
          </>
        ) : (
          'Crea Preventivo'
        )}
      </Button>
    </div>
  );
};

export default QuoteFormActions;
