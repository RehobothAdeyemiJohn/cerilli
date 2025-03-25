
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import AdminUserList from '@/components/credentials/AdminUserList';
import AdminUserFormDialog from '@/components/credentials/AdminUserFormDialog';
import { adminUsersApi } from '@/api/supabase/adminUsersApi';
import { AdminUser } from '@/types/admin';
import { Button } from '@/components/ui/button';

const Credentials = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  
  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: adminUsersApi.getAll,
  });
  
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
    <div className="container mx-auto py-6">
      <div className='flex justify-between '>
      <h1 className="text-2xl font-bold mb-6">Gestione Credenziali</h1>
      <Button 
       variant="secondary"
        className="mt-4 md:mt-0 "
        onClick={()=>{
          setIsAddDialogOpen(true)
          setEditUser(null)
        }}
      >creare un utente</Button>

      </div>
      <Card className="p-6">
        {isLoading ? (
          <div className="text-center py-12">Caricamento in corso...</div>
        ) : (
          <AdminUserList
            users={users}
            onEdit={handleEditUser}
            onRefetch={refetch}
          />
        )}
      </Card>
      
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
