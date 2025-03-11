
import React from 'react';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';

interface FormActionsProps {
  onClose: () => void;
  isEditing: boolean;
}

const FormActions: React.FC<FormActionsProps> = ({ onClose, isEditing }) => {
  return (
    <DialogFooter>
      <Button type="button" variant="outline" onClick={onClose}>
        Annulla
      </Button>
      <Button type="submit">
        {isEditing ? "Salva modifiche" : "Crea utente"}
      </Button>
    </DialogFooter>
  );
};

export default FormActions;
