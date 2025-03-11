
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface QuoteDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
  quoteId?: string;
}

const QuoteDeleteDialog = ({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  quoteId,
}: QuoteDeleteDialogProps) => {
  // Generate a shorter ID for display (first 6 characters) if available
  const shortId = quoteId ? quoteId.substring(0, 6).toUpperCase() : '';
  
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {quoteId ? `Elimina preventivo #${shortId}` : 'Elimina preventivo'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Sei sicuro di voler eliminare questo preventivo? Questa azione non può essere annullata.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Annulla</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-red-600 hover:bg-red-700">
            Elimina
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default QuoteDeleteDialog;
