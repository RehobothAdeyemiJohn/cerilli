
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';

interface PdfPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  pdfData: Uint8Array | null;
}

export function PdfPreviewDialog({ isOpen, onClose, pdfData }: PdfPreviewDialogProps) {
  const handleDownload = () => {
    if (!pdfData) return;
    
    const blob = new Blob([pdfData], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ordini_${new Date().toISOString().slice(0, 10)}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const getPdfUrl = () => {
    if (!pdfData) return '';
    
    const blob = new Blob([pdfData], { type: 'application/pdf' });
    return URL.createObjectURL(blob);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-4 border-b">
          <div className="flex items-center justify-between w-full">
            <DialogTitle>Anteprima PDF</DialogTitle>
            <div className="flex items-center gap-2">
              <Button 
                onClick={handleDownload} 
                disabled={!pdfData}
                variant="outline"
                size="sm"
              >
                <Download className="mr-2 h-4 w-4" />
                Scarica
              </Button>
              <Button 
                onClick={onClose} 
                variant="ghost"
                size="sm"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          {pdfData ? (
            <iframe 
              src={getPdfUrl()}
              title="PDF Preview" 
              className="w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              Caricamento PDF...
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
