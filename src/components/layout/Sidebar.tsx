
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag,
  Store,
  ClipboardList, 
  Truck,
  Users,
  KeyRound,
  Settings,
  Database,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

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
    { title: 'Preventivi', icon: FileText, path: '/quotes', showForDealer: true, showForAdmin: true },
    { title: 'Stock', icon: ShoppingBag, path: '/inventory', showForDealer: true },
    { title: 'Stock Dealer', icon: Store, path: '/dealer-stock', showForDealer: true, showForAdmin: true },
    { title: 'Ordini', icon: ClipboardList, path: '/orders', showForDealer: true },
    { title: 'Difformità', icon: AlertTriangle, path: '/defects', showForDealer: true, showForAdmin: true },
    { title: 'Consegne', icon: Truck, path: '/deliveries', showForDealer: false, showForAdmin: true },
    { title: 'Dealers', icon: Users, path: '/dealers', showForAdmin: true, showForDealer: true },
  ];
  
  const footerItems = [
    { title: 'Impostazioni', icon: Settings, path: '/settings', showForDealer: false, showForAdmin: true },
  ];
  
  const adminItems = [
    { title: 'Credenziali', icon: KeyRound, path: '/credentials' },
    { title: 'Migrazione Dati', icon: Database, path: '/migration' },
  ];
  
  const isActive = (path: string) => {
    if (location.pathname === path) return true;
    
    if (path === '/inventory' && location.pathname.startsWith('/inventory/')) return true;
    
    return false;
  };
  
  return (
    <div 
      className={`${
        isOpen ? 'w-64' : 'w-16'
      } h-screen bg-[#141c2e] text-white flex flex-col flex-shrink-0 transition-all duration-300 overflow-hidden`}
    >
      <div className="flex items-center justify-center h-16 p-4 flex-shrink-0">
        {isOpen ? (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white font-bold">
            CN
          </div>
        ) : (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white font-bold">
            CN
          </div>
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
                className={cn(
                  "flex items-center p-2 rounded-md transition-colors my-1",
                  isActive(item.path)
                    ? "bg-white text-[#141c2e]"
                    : "text-gray-300 hover:bg-gray-700"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive(item.path) ? "text-[#141c2e]" : "text-gray-300")} />
                {isOpen && (
                  <span className="ml-3 text-sm">{item.title}</span>
                )}
              </Link>
            ))}
        </nav>
        
        {isAdmin && (
          <div className="pt-2 px-2">
            <nav className="space-y-1">
              {adminItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center p-2 rounded-md transition-colors my-1",
                    isActive(item.path)
                      ? "bg-white text-[#141c2e]"
                      : "text-gray-300 hover:bg-gray-700"
                  )}
                >
                  <item.icon className={cn("h-5 w-5", isActive(item.path) ? "text-[#141c2e]" : "text-gray-300")} />
                  {isOpen && (
                    <span className="ml-3 text-sm">{item.title}</span>
                  )}
                </Link>
              ))}
            </nav>
          </div>
        )}
        
        {/* Footer Navigation */}
        <div className="mt-auto px-2 pb-4">
          <nav className="space-y-1">
            {footerItems
              .filter(item => (isAdmin && (item.showForAdmin !== false)) || (isDealer && item.showForDealer))
              .map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center p-2 rounded-md transition-colors my-1",
                    isActive(item.path)
                      ? "bg-white text-[#141c2e]"
                      : "text-gray-300 hover:bg-gray-700"
                  )}
                >
                  <item.icon className={cn("h-5 w-5", isActive(item.path) ? "text-[#141c2e]" : "text-gray-300")} />
                  {isOpen && (
                    <span className="ml-3 text-sm">{item.title}</span>
                  )}
                </Link>
              ))}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
