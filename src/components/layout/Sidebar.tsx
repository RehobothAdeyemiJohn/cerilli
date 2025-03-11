import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useMobile } from '@/hooks/use-mobile';
import { 
  Layout, 
  ShoppingBag, 
  BarChart, 
  ListChecks, 
  Truck, 
  Settings, 
  KeyRound,
  DatabaseIcon
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar = ({ isOpen, toggleSidebar }: SidebarProps) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMobile();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen transition-transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } ${isMobile ? "w-64" : "w-64 md:translate-x-0"} bg-white border-r border-gray-200 pt-16`}
    >
      <div className="h-full px-3 py-4 overflow-y-auto">
        <ul className="space-y-2 font-medium">
          {/* Dashboard */}
          <li>
            <Link
              to="/dashboard"
              className={`flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors ${
                location.pathname === '/dashboard' ? 'bg-gray-100 text-primary' : 'text-gray-900'
              }`}
              onClick={isMobile ? toggleSidebar : undefined}
            >
              <Layout className="w-5 h-5 mr-2" />
              <span>Dashboard</span>
            </Link>
          </li>
          
          {/* Inventory */}
          <li>
            <Link
              to="/inventory"
              className={`flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors ${
                location.pathname === '/inventory' ? 'bg-gray-100 text-primary' : 'text-gray-900'
              }`}
              onClick={isMobile ? toggleSidebar : undefined}
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              <span>Inventario</span>
            </Link>
          </li>
          
          {/* Quotes */}
          <li>
            <Link
              to="/quotes"
              className={`flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors ${
                location.pathname === '/quotes' ? 'bg-gray-100 text-primary' : 'text-gray-900'
              }`}
              onClick={isMobile ? toggleSidebar : undefined}
            >
              <BarChart className="w-5 h-5 mr-2" />
              <span>Preventivi</span>
            </Link>
          </li>
          
          {/* Orders */}
          <li>
            <Link
              to="/orders"
              className={`flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors ${
                location.pathname === '/orders' ? 'bg-gray-100 text-primary' : 'text-gray-900'
              }`}
              onClick={isMobile ? toggleSidebar : undefined}
            >
              <ListChecks className="w-5 h-5 mr-2" />
              <span>Ordini</span>
            </Link>
          </li>
          
          {/* Dealers */}
          <li>
            <Link
              to="/dealers"
              className={`flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors ${
                location.pathname === '/dealers' ? 'bg-gray-100 text-primary' : 'text-gray-900'
              }`}
              onClick={isMobile ? toggleSidebar : undefined}
            >
              <Truck className="w-5 h-5 mr-2" />
              <span>Dealers</span>
            </Link>
          </li>
          
          {/* Credentials */}
          <li>
            <Link
              to="/credentials"
              className={`flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors ${
                location.pathname === '/credentials' ? 'bg-gray-100 text-primary' : 'text-gray-900'
              }`}
              onClick={isMobile ? toggleSidebar : undefined}
            >
              <KeyRound className="w-5 h-5 mr-2" />
              <span>Credenziali</span>
            </Link>
          </li>
          
          {/* Settings */}
          <li>
            <Link
              to="/settings"
              className={`flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors ${
                location.pathname === '/settings' ? 'bg-gray-100 text-primary' : 'text-gray-900'
              }`}
              onClick={isMobile ? toggleSidebar : undefined}
            >
              <Settings className="w-5 h-5 mr-2" />
              <span>Impostazioni</span>
            </Link>
          </li>
          
          {/* Migrazione Dati - Aggiungiamo questa voce */}
          <li>
            <Link
              to="/migration"
              className={`flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors ${
                location.pathname === '/migration' ? 'bg-gray-100 text-primary' : 'text-gray-900'
              }`}
              onClick={isMobile ? toggleSidebar : undefined}
            >
              <DatabaseIcon className="w-5 h-5 mr-2" />
              <span>Migrazione Dati</span>
            </Link>
          </li>
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
