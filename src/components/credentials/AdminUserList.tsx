
import React, { useState } from 'react';
import { 
  Edit,
  Trash,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';
import { AdminUser } from '@/types/admin';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { adminUsersApi } from '@/api/supabase/adminUsersApi';
import AdminUserDeleteDialog from './AdminUserDeleteDialog';

interface AdminUserListProps {
  users: AdminUser[];
  onEdit: (user: AdminUser) => void;
  onRefetch: () => void;
}

const getRoleBadge = (role: string) => {
  switch (role) {
    case 'superAdmin':
      return <Badge className="bg-purple-500">Super Admin</Badge>;
    case 'admin':
      return <Badge className="bg-blue-500">Admin</Badge>;
    case 'supervisor':
      return <Badge className="bg-yellow-500">Supervisore</Badge>;
    case 'operator':
      return <Badge className="bg-green-500">Operatore</Badge>;
    default:
      return <Badge>{role}</Badge>;
  }
};

const AdminUserList: React.FC<AdminUserListProps> = ({ users, onEdit, onRefetch }) => {
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  
  const handleToggleActive = async (user: AdminUser) => {
    try {
      await adminUsersApi.update(user.id, { active: !user.active });
      onRefetch();
      toast({
        title: user.active ? "Utente disattivato" : "Utente attivato",
        description: `${user.first_name} ${user.last_name} è stato ${user.active ? 'disattivato' : 'attivato'}.`,
      });
    } catch (error) {
      console.error("Errore durante l'aggiornamento dello stato:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'aggiornamento dello stato dell'utente.",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteClick = (userId: string) => {
    setDeleteUserId(userId);
  };
  
  const handleDeleteCancel = () => {
    setDeleteUserId(null);
  };
  
  const handleDeleteConfirm = async () => {
    if (deleteUserId) {
      try {
        await adminUsersApi.delete(deleteUserId);
        onRefetch();
        toast({
          title: "Utente eliminato",
          description: "L'utente è stato eliminato con successo.",
        });
      } catch (error) {
        console.error("Errore durante l'eliminazione:", error);
        toast({
          title: "Errore",
          description: "Si è verificato un errore durante l'eliminazione dell'utente.",
          variant: "destructive",
        });
      } finally {
        setDeleteUserId(null);
      }
    }
  };
  
  if (users.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-md">
        <p className="text-gray-500">Nessun utente trovato.</p>
      </div>
    );
  }
  return (
    <>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Ruolo</TableHead>
              <TableHead>Stato</TableHead>
              <TableHead>Ultimo accesso</TableHead>
              <TableHead className="text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  {user.first_name} {user.last_name}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{getRoleBadge(user.role)}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={user.active}
                      onCheckedChange={() => handleToggleActive(user)}
                    />
                    <span className="text-sm text-muted-foreground">
                      {user.active ? 'Attivo' : 'Disattivato'}
                    </span>
                    {user.active ? 
                      <ShieldCheck className="h-4 w-4 text-green-500" /> : 
                      <ShieldAlert className="h-4 w-4 text-red-500" />
                    }
                  </div>
                </TableCell>
                <TableCell>
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleString('it-IT') : 'Mai'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(user)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(user.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <AdminUserDeleteDialog
        isOpen={deleteUserId !== null}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
};

export default AdminUserList;
