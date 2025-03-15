
import React, { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

interface HeaderProps {
  children?: ReactNode;
}

const Header = ({ children }: HeaderProps) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Determine the title to show in the header
  const headerTitle = isAdmin 
    ? "Cirelli Motor Company" 
    : user?.dealerName || "Cirelli Motor Company";

  return (
    <header className="border-b bg-background">
      <div className="flex h-16 items-center px-4 gap-4">
        {/* Left side - SidebarTrigger */}
        {children}

        {/* Center - Company/Dealer Name */}
        <div className="text-xl font-semibold flex-1 text-left">
          {headerTitle}
        </div>

        {/* Right side - User info and logout */}
        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <p className="font-medium">{user.firstName} {user.lastName}</p>
                <p className="text-muted-foreground">{user.role === 'admin' ? 'Amministratore' : 'Concessionario'}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
