
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDeleteDialogProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  itemName: string;
  pending?: boolean;
}

export function ConfirmDeleteDialog({ 
  isOpen, 
  onCancel, 
  onConfirm, 
  itemName,
  pending = false 
}: ConfirmDeleteDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <span>Conferma eliminazione</span>
          </DialogTitle>
          <DialogDescription>
            {`Sei sicuro di voler eliminare questo ${itemName}? Questa azione non può essere annullata.`}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onCancel}
            disabled={pending}
          >
            Annulla
          </Button>
          <Button 
            variant="destructive" 
            onClick={onConfirm}
            disabled={pending}
          >
            {pending ? 'Eliminazione in corso...' : `Elimina ${itemName}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
