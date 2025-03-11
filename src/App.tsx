
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Quotes from './pages/Quotes';
import Orders from './pages/Orders';
import Dealers from './pages/Dealers';
import Settings from './pages/Settings';
import Credentials from './pages/Credentials';
import NotFound from './pages/NotFound';
import Login from './pages/Login';
import Index from './pages/Index';
import Migration from './pages/Migration';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        
        {/* Rotte protette */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/quotes" element={<Quotes />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/dealers" element={<Dealers />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/credentials" element={<Credentials />} />
            <Route path="/migration" element={<Migration />} />
          </Route>
        </Route>
        
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </AuthProvider>
  );
}

export default App;
