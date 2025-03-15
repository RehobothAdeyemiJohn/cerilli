
import React, { useState } from 'react';
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
import { Loader2 } from 'lucide-react';
import { defectReportsApi } from '@/api/supabase';
import { useToast } from '@/hooks/use-toast';

type DefectDeleteDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  defectId: string;
  caseNumber?: number;
  onSuccess: () => void;
};

const DefectDeleteDialog = ({ 
  isOpen, 
  onClose, 
  defectId, 
  caseNumber,
  onSuccess 
}: DefectDeleteDialogProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await defectReportsApi.delete(defectId);
      toast({
        title: "Difformità eliminata",
        description: "La segnalazione di difformità è stata eliminata con successo",
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error deleting defect report:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'eliminazione",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
          <AlertDialogDescription>
            Sei sicuro di voler eliminare la segnalazione di difformità 
            {caseNumber ? ` #${caseNumber}` : ''}? Questa azione non può essere annullata.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Annulla</AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Elimina
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DefectDeleteDialog;
