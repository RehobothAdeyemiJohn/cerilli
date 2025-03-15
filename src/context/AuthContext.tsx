
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/api/authService';
import { AuthUser, LoginCredentials, AuthState } from '@/types/auth';
import { useToast } from '@/hooks/use-toast';

interface AuthContextProps extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Verifica se l'utente è già loggato
  useEffect(() => {
    const checkAuth = () => {
      try {
        const user = authService.getCurrentUser();
        
        // Assicurati che abbiamo un session ID
        authService.getOrCreateSessionId();
        
        setAuthState({
          user,
          isAuthenticated: !!user,
          isLoading: false,
          error: null
        });
      } catch (error) {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Errore nella verifica dell\'autenticazione'
        });
      }
    };
    
    checkAuth();
  }, []);
  
  const login = async (credentials: LoginCredentials) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const user = await authService.login(credentials);
      authService.saveUser(user);
      
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
      
      toast({
        title: "Login effettuato con successo",
        description: `Benvenuto, ${user.firstName} ${user.lastName}!`,
      });
      
      // Reindirizza in base al tipo di utente
      if (user.type === 'dealer' || user.type === 'vendor') {
        navigate('/inventory');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      let errorMessage = 'Errore durante il login';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage
      });
      
      toast({
        title: "Errore di autenticazione",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };
  
  const logout = () => {
    authService.clearUser();
    
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
    
    toast({
      title: "Logout effettuato con successo",
    });
    
    navigate('/');
  };

  // Determine if user is admin
  const isAdmin = authState.user?.type === 'admin' || authState.user?.role === 'admin' || authState.user?.role === 'superAdmin';
  
  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        isAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve essere utilizzato all\'interno di un AuthProvider');
  }
  return context;
};
