
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  FileText, 
  ClipboardList, 
  Truck, 
  Settings, 
  KeyRound,
  Database,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar = ({ isOpen, toggleSidebar }: SidebarProps) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  
  const menuItems = [
    { title: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { title: 'Inventario', icon: ShoppingBag, path: '/inventory' },
    { title: 'Preventivi', icon: FileText, path: '/quotes' },
    { title: 'Ordini', icon: ClipboardList, path: '/orders' },
    { title: 'Dealers', icon: Truck, path: '/dealers' },
  ];
  
  const adminItems = [
    { title: 'Credenziali', icon: KeyRound, path: '/credentials' },
    { title: 'Impostazioni', icon: Settings, path: '/settings' },
    { title: 'Migrazione Dati', icon: Database, path: '/migration' },
  ];
  
  const getLinkClasses = (path: string) => {
    const baseClasses = "flex items-center p-2 rounded-lg transition-colors";
    const activeClasses = location.pathname === path
      ? "bg-primary text-white hover:bg-primary/90"
      : "text-gray-900 hover:bg-gray-100";
    return `${baseClasses} ${activeClasses}`;
  };
  
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && isMobile && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
      
      <aside
        className={`fixed top-0 left-0 z-30 h-screen w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">Cirelli Motor</h2>
            {isMobile && (
              <button 
                onClick={toggleSidebar}
                className="p-2 text-gray-500 rounded-md hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto py-4 px-3">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={getLinkClasses(item.path)}
                    onClick={isMobile ? toggleSidebar : undefined}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    <span>{item.title}</span>
                  </Link>
                </li>
              ))}
              
              <li className="pt-4 mt-4 border-t border-gray-200">
                <p className="px-2 text-xs font-semibold text-gray-400 uppercase">
                  Amministrazione
                </p>
              </li>
              
              {adminItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={getLinkClasses(item.path)}
                    onClick={isMobile ? toggleSidebar : undefined}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    <span>{item.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
