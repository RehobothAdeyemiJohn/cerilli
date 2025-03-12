
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { AdminUser } from '@/types/admin';
import { adminUsersApi } from '@/api/supabase/adminUsersApi';
import AdminUserList from '@/components/credentials/AdminUserList';
import AdminUserFormDialog from '@/components/credentials/AdminUserFormDialog';

const Credentials = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: adminUsersApi.getAll,
  });
  
  const filteredUsers = users.filter(user => {
    const searchLower = searchQuery.toLowerCase();
    return (
      user.firstName.toLowerCase().includes(searchLower) ||
      user.lastName.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.role.toLowerCase().includes(searchLower)
    );
  });
  
  const handleAddUser = () => {
    setEditUser(null);
    setIsAddDialogOpen(true);
  };
  
  const handleEditUser = (user: AdminUser) => {
    setEditUser(user);
    setIsAddDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setIsAddDialogOpen(false);
    setEditUser(null);
  };
  
  const handleUserSaved = () => {
    refetch();
    handleCloseDialog();
  };
  
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestione Credenziali</h1>
        <Button onClick={handleAddUser}>
          <Plus className="mr-2 h-4 w-4" />
          Aggiungi Utente
        </Button>
      </div>
      
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cerca per nome, email o ruolo..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {isLoading ? (
        <div className="text-center py-12">Caricamento in corso...</div>
      ) : (
        <AdminUserList
          users={filteredUsers}
          onEdit={handleEditUser}
          onRefetch={refetch}
        />
      )}
      
      <AdminUserFormDialog
        isOpen={isAddDialogOpen}
        user={editUser}
        onClose={handleCloseDialog}
        onSaved={handleUserSaved}
      />
    </div>
  );
};

export default Credentials;
