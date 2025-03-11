
import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, User, ShoppingBag, Search, LogOut, BarChart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';

const Header = () => {
  const { user, logout } = useAuth();
  
  const getUserRoleLabel = () => {
    if (!user) return '';
    
    if (user.type === 'admin') {
      switch (user.role) {
        case 'superAdmin': return 'Super Amministratore';
        case 'admin': return 'Amministratore';
        case 'supervisor': return 'Supervisore';
        case 'operator': return 'Operatore';
        default: return 'Amministratore';
      }
    } else if (user.type === 'dealer') {
      return 'Dealer';
    } else if (user.type === 'vendor') {
      return 'Venditore';
    }
    
    return '';
  };
  
  return (
    <header className="w-full h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <Link to="/dashboard" className="items-center hidden md:flex">
          <ShoppingBag className="h-6 w-6 text-primary" />
          <span className="text-xl font-semibold ml-2">Gestionale CMC</span>
        </Link>
      </div>
      
      <div className="hidden sm:block flex-1 max-w-md mx-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input 
            type="search" 
            placeholder="Cerca veicoli, ordini..." 
            className="pl-9 bg-gray-50 w-full"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="text-gray-500 hover:text-gray-700 relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 flex items-center justify-center text-xs text-white">
            3
          </span>
        </button>
        
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-2 cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium">{`${user.firstName} ${user.lastName}`}</p>
                  <p className="text-xs text-gray-500">
                    {user.type === 'admin' ? getUserRoleLabel() : user.dealerName}
                  </p>
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                Account
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {user.type === 'admin' && (
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profilo
                </DropdownMenuItem>
              )}
              <DropdownMenuItem>
                <BarChart className="mr-2 h-4 w-4" />
                Dashboard
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
};

export default Header;
