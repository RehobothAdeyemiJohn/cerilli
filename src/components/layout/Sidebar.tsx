
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
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
  MenuIcon,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar = ({ isOpen, toggleSidebar }: SidebarProps) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
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
        className={`fixed top-0 left-0 z-30 h-screen transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 w-64 bg-white border-r border-gray-200 pt-16 shadow-md`}
      >
        <div className="absolute top-4 right-4 lg:hidden">
          <button 
            onClick={toggleSidebar}
            className="p-2 text-gray-500 rounded-md hover:bg-gray-100"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="h-full px-3 py-4 overflow-y-auto">
          <div className="mb-6 px-4">
            <h2 className="text-xl font-bold text-gray-800">Cirelli Motor</h2>
            <p className="text-sm text-gray-500">Management System</p>
          </div>
          
          <ul className="space-y-2 font-medium">
            {/* Dashboard */}
            <li>
              <Link
                to="/dashboard"
                className={`flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors ${
                  location.pathname === '/dashboard' ? 'bg-primary text-white hover:bg-primary/90' : 'text-gray-900'
                }`}
                onClick={isMobile ? toggleSidebar : undefined}
              >
                <LayoutDashboard className="w-5 h-5 mr-3" />
                <span>Dashboard</span>
              </Link>
            </li>
            
            {/* Inventory */}
            <li>
              <Link
                to="/inventory"
                className={`flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors ${
                  location.pathname === '/inventory' ? 'bg-primary text-white hover:bg-primary/90' : 'text-gray-900'
                }`}
                onClick={isMobile ? toggleSidebar : undefined}
              >
                <ShoppingBag className="w-5 h-5 mr-3" />
                <span>Inventario</span>
              </Link>
            </li>
            
            {/* Quotes */}
            <li>
              <Link
                to="/quotes"
                className={`flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors ${
                  location.pathname === '/quotes' ? 'bg-primary text-white hover:bg-primary/90' : 'text-gray-900'
                }`}
                onClick={isMobile ? toggleSidebar : undefined}
              >
                <FileText className="w-5 h-5 mr-3" />
                <span>Preventivi</span>
              </Link>
            </li>
            
            {/* Orders */}
            <li>
              <Link
                to="/orders"
                className={`flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors ${
                  location.pathname === '/orders' ? 'bg-primary text-white hover:bg-primary/90' : 'text-gray-900'
                }`}
                onClick={isMobile ? toggleSidebar : undefined}
              >
                <ClipboardList className="w-5 h-5 mr-3" />
                <span>Ordini</span>
              </Link>
            </li>
            
            {/* Dealers */}
            <li>
              <Link
                to="/dealers"
                className={`flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors ${
                  location.pathname === '/dealers' ? 'bg-primary text-white hover:bg-primary/90' : 'text-gray-900'
                }`}
                onClick={isMobile ? toggleSidebar : undefined}
              >
                <Truck className="w-5 h-5 mr-3" />
                <span>Dealers</span>
              </Link>
            </li>
            
            <li className="pt-4 mt-4 border-t border-gray-200">
              <p className="px-2 text-xs font-semibold text-gray-400 uppercase">Amministrazione</p>
            </li>
            
            {/* Credentials */}
            <li>
              <Link
                to="/credentials"
                className={`flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors ${
                  location.pathname === '/credentials' ? 'bg-primary text-white hover:bg-primary/90' : 'text-gray-900'
                }`}
                onClick={isMobile ? toggleSidebar : undefined}
              >
                <KeyRound className="w-5 h-5 mr-3" />
                <span>Credenziali</span>
              </Link>
            </li>
            
            {/* Settings */}
            <li>
              <Link
                to="/settings"
                className={`flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors ${
                  location.pathname === '/settings' ? 'bg-primary text-white hover:bg-primary/90' : 'text-gray-900'
                }`}
                onClick={isMobile ? toggleSidebar : undefined}
              >
                <Settings className="w-5 h-5 mr-3" />
                <span>Impostazioni</span>
              </Link>
            </li>
            
            {/* Migrazione Dati */}
            <li>
              <Link
                to="/migration"
                className={`flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors ${
                  location.pathname === '/migration' ? 'bg-primary text-white hover:bg-primary/90' : 'text-gray-900'
                }`}
                onClick={isMobile ? toggleSidebar : undefined}
              >
                <Database className="w-5 h-5 mr-3" />
                <span>Migrazione Dati</span>
              </Link>
            </li>
          </ul>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
