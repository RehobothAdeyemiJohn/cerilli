
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AdminUser } from '@/types/admin';
import UserForm from './UserForm';

interface UserFormDialogProps {
  isOpen: boolean;
  user: AdminUser | null;
  onClose: () => void;
  onSaved: () => void;
}

const UserFormDialog: React.FC<UserFormDialogProps> = ({
  isOpen, 
  user,
  onClose,
  onSaved,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[800px] w-[95%] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-2">
          <DialogTitle>
            {user ? "Modifica utente" : "Crea nuovo utente"}
          </DialogTitle>
        </DialogHeader>
        
        <UserForm 
          user={user} 
          onClose={onClose} 
          onSaved={onSaved}
        />
      </DialogContent>
    </Dialog>
  );
};

export default UserFormDialog;
