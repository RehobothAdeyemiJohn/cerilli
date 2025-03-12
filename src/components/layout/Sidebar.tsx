
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
}

const Sidebar = ({ isOpen }: SidebarProps) => {
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
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <div 
      className={`${
        isOpen ? 'w-64' : 'w-16'
      } h-screen bg-white border-r border-gray-200 flex flex-col flex-shrink-0 transition-all duration-300 overflow-hidden`}
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
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center p-2 rounded-md transition-colors ${
                isActive(item.path)
                  ? 'bg-[#141c2e] text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive(item.path) ? 'text-white' : 'text-gray-500'}`} />
              {isOpen && (
                <span className="ml-3">{item.title}</span>
              )}
            </Link>
          ))}
        </nav>
        
        <div className="mt-2 border-t border-gray-200 pt-2 px-2">
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
                    : 'text-gray-700 hover:bg-gray-100'
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
      </div>
    </div>
  );
};

export default Sidebar;
