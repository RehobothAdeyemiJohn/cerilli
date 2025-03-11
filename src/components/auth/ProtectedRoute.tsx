
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Permission } from '@/types/admin';

interface ProtectedRouteProps {
  children: React.ReactNode;
  permissions?: Permission[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  permissions = []
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check permissions if provided
  if (permissions.length > 0 && user?.type === 'admin') {
    const hasPermission = permissions.some(permission => 
      user.permissions?.includes(permission)
    );

    if (!hasPermission) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};
