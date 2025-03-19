
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from '@/components/ui/toaster';
import Layout from './components/layout/Layout';
import Index from './pages/Index';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Orders from './pages/Orders';
import Quotes from './pages/Quotes';
import Dealers from './pages/Dealers';
import Credentials from './pages/Credentials';
import Settings from './pages/Settings';
import DealerStock from './pages/DealerStock';
import Deliveries from './pages/Deliveries';
import Defects from './pages/Defects';
import Migration from './pages/Migration';
import NotFound from './pages/NotFound';
import Contracts from './pages/Contracts';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
    },
  },
});

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              
              {/* Protected routes with Layout */}
              <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/quotes" element={<Quotes />} />
                <Route path="/dealers" element={<Dealers />} />
                <Route path="/contracts" element={<Contracts />} />
                <Route path="/credentials" element={<Credentials />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/dealer-stock" element={<DealerStock />} />
                <Route path="/deliveries" element={<Deliveries />} />
                <Route path="/defects" element={<Defects />} />
                <Route path="/migration" element={<Migration />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
