
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from '@/components/ui/toaster';
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
      <AuthProvider>
        <ThemeProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
              <Route path="/quotes" element={<ProtectedRoute><Quotes /></ProtectedRoute>} />
              <Route path="/dealers" element={<ProtectedRoute><Dealers /></ProtectedRoute>} />
              <Route path="/contracts" element={<ProtectedRoute><Contracts /></ProtectedRoute>} />
              <Route path="/credentials" element={<ProtectedRoute><Credentials /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/dealer-stock" element={<ProtectedRoute><DealerStock /></ProtectedRoute>} />
              <Route path="/deliveries" element={<ProtectedRoute><Deliveries /></ProtectedRoute>} />
              <Route path="/defects" element={<ProtectedRoute><Defects /></ProtectedRoute>} />
              <Route path="/migration" element={<ProtectedRoute><Migration /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          <Toaster />
        </ThemeProvider>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
