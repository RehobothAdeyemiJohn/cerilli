
import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

const formSchema = z.object({
  reason: z.string().min(10, {
    message: "Il motivo deve contenere almeno 10 caratteri.",
  }),
});

interface QuoteRejectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}

const QuoteRejectDialog = ({ 
  open, 
  onOpenChange, 
  onConfirm, 
  onCancel 
}: QuoteRejectDialogProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reason: "",
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onConfirm(values.reason);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rifiuta Preventivo</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo del Rifiuto</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Inserisci il motivo del rifiuto..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="flex justify-end gap-2 pt-4">
              <Button 
                variant="outline"
                type="button"
                onClick={() => {
                  form.reset();
                  onCancel();
                }}
              >
                Annulla
              </Button>
              <Button
                variant="destructive"
                type="submit"
              >
                Conferma Rifiuto
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default QuoteRejectDialog;
