
import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/layout/Layout';

// Pages
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import NotFound from '@/pages/NotFound';
import Inventory from '@/pages/Inventory';
import Quotes from '@/pages/Quotes';
import Orders from '@/pages/Orders';
import Dealers from '@/pages/Dealers';
import Settings from '@/pages/Settings';
import Credentials from '@/pages/Credentials';
import Migration from '@/pages/Migration';
import Deliveries from './pages/Deliveries';
import DealerStock from './pages/DealerStock';

// Utilities
import { createDefaultAdmin } from '@/utils/createDefaultAdmin';

import './App.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  useEffect(() => {
    // Create default admin user on app startup if needed
    createDefaultAdmin();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
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
                <Route path="/deliveries" element={<Deliveries />} />
                <Route path="/dealer-stock" element={<DealerStock />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
