
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  FileText, 
  ClipboardList, 
  Truck, 
  Settings, 
  KeyRound,
  Database
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar = ({ isOpen, toggleSidebar }: SidebarProps) => {
  const location = useLocation();
  
  const menuItems = [
    { title: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { title: 'Stock', icon: ShoppingBag, path: '/inventory' },
    { title: 'Preventivi', icon: FileText, path: '/quotes' },
    { title: 'Ordini', icon: ClipboardList, path: '/orders' },
    { title: 'Dealers', icon: Truck, path: '/dealers' },
  ];
  
  const adminItems = [
    { title: 'Credenziali', icon: KeyRound, path: '/credentials' },
    { title: 'Impostazioni', icon: Settings, path: '/settings' },
    { title: 'Migrazione Dati', icon: Database, path: '/migration' },
  ];
  
  return (
    <div 
      className={`${
        isOpen ? 'w-64' : 'w-16'
      } h-screen bg-sidebar text-sidebar-foreground transition-all duration-300 border-r border-border fixed z-20`}
    >
      <div className="flex items-center justify-between p-4 h-16 border-b border-border">
        <h2 className={`text-xl font-bold text-foreground transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 hidden'
        }`}>
          Cirelli Motor
        </h2>
        {!isOpen && (
          <div className="mx-auto">
            <span className="text-xl font-bold">CM</span>
          </div>
        )}
      </div>
      
      <div className="flex flex-col h-[calc(100%-4rem)] overflow-y-auto py-4">
        <nav className="flex-1 px-2 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center p-2 rounded-md transition-colors ${
                location.pathname === item.path
                  ? 'bg-accent text-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className={`ml-3 transition-opacity duration-300 ${
                isOpen ? 'opacity-100' : 'opacity-0 hidden'
              }`}>
                {item.title}
              </span>
            </Link>
          ))}
        </nav>
        
        <div className="pt-4 mt-4 border-t border-border px-2">
          <p className={`px-2 text-xs font-semibold text-muted-foreground uppercase mb-2 transition-opacity duration-300 ${
            isOpen ? 'opacity-100' : 'opacity-0 hidden'
          }`}>
            Amministrazione
          </p>
          
          <nav className="space-y-1">
            {adminItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center p-2 rounded-md transition-colors ${
                  location.pathname === item.path
                    ? 'bg-accent text-accent-foreground'
                    : 'text-sidebar-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className={`ml-3 transition-opacity duration-300 ${
                  isOpen ? 'opacity-100' : 'opacity-0 hidden'
                }`}>
                  {item.title}
                </span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
