
import React from 'react';
import { Card } from '@/components/ui/card';
import AdminUserList from '@/components/credentials/AdminUserList';

const Credentials = () => {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Gestione Credenziali</h1>
      <Card className="p-6">
        <AdminUserList />
      </Card>
    </div>
  );
};

export default Credentials;
