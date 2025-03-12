
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const Index = () => {
  const { isAuthenticated, user } = useAuth();
  
  // Verifica se l'utente è già autenticato
  if (isAuthenticated) {
    // Se è un dealer, lo reindirizziamo automaticamente alla pagina dell'inventario
    if (user?.type === 'dealer' || user?.type === 'vendor') {
      return <Navigate to="/inventory" replace />;
    }
    
    // Altrimenti, indirizziamo alla dashboard (per admin)
    return <Navigate to="/dashboard" replace />;
  }
  
  // Se non è autenticato, lo indirizziamo alla pagina di login
  return <Navigate to="/login" replace />;
};

export default Index;
