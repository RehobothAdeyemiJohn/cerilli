
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface QuoteFormActionsProps {
  onCancel: () => void;
  isSubmitting?: boolean;
}

const QuoteFormActions: React.FC<QuoteFormActionsProps> = ({ onCancel, isSubmitting = false }) => {
  return (
    <div className="flex justify-end gap-3 pt-4 border-t">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isSubmitting}
        className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
      >
        Annulla
      </Button>
      <Button
        type="submit"
        disabled={isSubmitting}
        className="bg-green-600 hover:bg-green-700 text-white"
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
