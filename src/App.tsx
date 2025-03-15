
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

// Pages
import Index from './pages/Index';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import DealerStock from './pages/DealerStock';
import Quotes from './pages/Quotes';
import Orders from './pages/Orders';
import Deliveries from './pages/Deliveries';
import Dealers from './pages/Dealers';
import Credentials from './pages/Credentials';
import Settings from './pages/Settings';
import Migration from './pages/Migration';
import Defects from './pages/Defects';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/inventory" 
              element={
                <ProtectedRoute>
                  <Inventory />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/dealer-stock" 
              element={
                <ProtectedRoute>
                  <DealerStock />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/quotes" 
              element={
                <ProtectedRoute>
                  <Quotes />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/orders" 
              element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/defects" 
              element={
                <ProtectedRoute>
                  <Defects />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/deliveries" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <Deliveries />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/dealers" 
              element={
                <ProtectedRoute>
                  <Dealers />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/credentials" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <Credentials />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <Settings />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/migration" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <Migration />
                </ProtectedRoute>
              } 
            />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
          <SonnerToaster position="top-right" closeButton />
          <Toaster />
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
