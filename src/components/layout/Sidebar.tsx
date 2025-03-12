
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  FileText, 
  ClipboardList, 
  Users, 
  Settings, 
  KeyRound,
  Database,
  Truck,
  Store
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar = ({ isOpen }: SidebarProps) => {
  const location = useLocation();
  const { user } = useAuth();
  const isAdmin = user?.type === 'admin';
  const isDealer = user?.type === 'dealer' || user?.type === 'vendor';
  
  const menuItems = [
    { title: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', showForDealer: true },
    { title: 'Stock', icon: ShoppingBag, path: '/inventory', showForDealer: true },
    { title: 'Preventivi', icon: FileText, path: '/quotes', showForDealer: true },
    { title: 'Ordini', icon: ClipboardList, path: '/orders', showForDealer: true },
    { title: 'Consegne', icon: Truck, path: '/deliveries', showForDealer: false, showForAdmin: true },
    { title: 'Stock Dealer', icon: Store, path: '/dealer-stock', showForDealer: false, showForAdmin: true },
    { title: 'Dealers', icon: Users, path: '/dealers', showForAdmin: true, showForDealer: true },
  ];
  
  const adminItems = [
    { title: 'Credenziali', icon: KeyRound, path: '/credentials' },
    { title: 'Impostazioni', icon: Settings, path: '/settings' },
    { title: 'Migrazione Dati', icon: Database, path: '/migration' },
  ];
  
  const isActive = (path: string) => {
    // For exact matches
    if (location.pathname === path) return true;
    
    // For the inventory path with routes like /inventory/123
    if (path === '/inventory' && location.pathname.startsWith('/inventory/')) return true;
    
    return false;
  };
  
  return (
    <div 
      className={`${
        isOpen ? 'w-64' : 'w-16'
      } h-screen bg-gray-100 border-r border-gray-200 flex flex-col flex-shrink-0 transition-all duration-300 overflow-hidden`}
    >
      <div className="flex items-center justify-center h-16 border-b border-gray-200 p-4 flex-shrink-0">
        {isOpen ? (
          <h2 className="text-xl font-bold text-gray-800">Cirelli Motor</h2>
        ) : (
          <span className="text-xl font-bold text-gray-800">CM</span>
        )}
      </div>
      
      <div className="flex flex-col flex-1 py-2 overflow-y-auto">
        <nav className="flex-1 px-2 space-y-1">
          {menuItems
            .filter(item => (isAdmin && (item.showForAdmin !== false)) || (isDealer && item.showForDealer))
            .map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center p-2 rounded-md transition-colors ${
                  isActive(item.path)
                    ? 'bg-[#141c2e] text-white'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                <item.icon className={`h-5 w-5 ${isActive(item.path) ? 'text-white' : 'text-gray-500'}`} />
                {isOpen && (
                  <span className="ml-3">{item.title}</span>
                )}
              </Link>
            ))}
        </nav>
        
        {isAdmin && (
          <div className="pt-2 px-2">
            {isOpen && (
              <p className="px-2 text-xs font-semibold text-gray-500 uppercase mb-1">
                AMMINISTRAZIONE
              </p>
            )}
            
            <nav className="space-y-1">
              {adminItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center p-2 rounded-md transition-colors ${
                    isActive(item.path)
                      ? 'bg-[#141c2e] text-white'
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <item.icon className={`h-5 w-5 ${isActive(item.path) ? 'text-white' : 'text-gray-500'}`} />
                  {isOpen && (
                    <span className="ml-3">{item.title}</span>
                  )}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
