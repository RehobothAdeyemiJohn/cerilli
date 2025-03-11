
import React from 'react';
import { AdminUser } from '@/types/admin';
import UserFormDialog from './dialog/UserFormDialog';

interface AdminUserFormDialogProps {
  isOpen: boolean;
  user: AdminUser | null;
  onClose: () => void;
  onSaved: () => void;
}

const AdminUserFormDialog: React.FC<AdminUserFormDialogProps> = (props) => {
  return <UserFormDialog {...props} />;
};

export default AdminUserFormDialog;
