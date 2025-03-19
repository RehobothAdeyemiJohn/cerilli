
import { useState, useCallback } from 'react';
import { useToast } from './use-toast';

type CopyFn = (text: string) => Promise<boolean>;

export function useCopyToClipboard(): [boolean, CopyFn] {
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const copy: CopyFn = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      
      toast({
        title: "Copiato negli appunti",
        description: "Testo copiato correttamente",
      });
      
      // Reset after 2 seconds
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
      
      return true;
    } catch (error) {
      console.error('Failed to copy:', error);
      
      toast({
        title: "Errore",
        description: "Impossibile copiare negli appunti",
        variant: "destructive"
      });
      
      setIsCopied(false);
      return false;
    }
  }, [toast]);

  return [isCopied, copy];
}

export default useCopyToClipboard;
