
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { useFormContext } from 'react-hook-form';

interface QuoteFormActionsProps {
  onCancel: () => void;
  isSubmitting?: boolean;
  isEditing?: boolean;
}

const QuoteFormActions: React.FC<QuoteFormActionsProps> = ({ 
  onCancel, 
  isSubmitting = false,
  isEditing = false 
}) => {
  const form = useFormContext();
  
  return (
    <div className="space-y-4">
      {/* Notes field */}
      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Note</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Inserisci eventuali note"
                className="resize-none"
                {...field}
              />
            </FormControl>
          </FormItem>
        )}
      />
      
      {/* Action buttons */}
      <div className="flex justify-end space-x-2">
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
          {isEditing ? 'Aggiorna Preventivo' : 'Crea Preventivo'}
        </Button>
      </div>
    </div>
  );
};

export default QuoteFormActions;
