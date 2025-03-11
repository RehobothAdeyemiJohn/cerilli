
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  FileText, 
  Car, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  X,
  Key
} from 'lucide-react';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Stock', path: '/inventory', icon: ShoppingBag },
    { name: 'Preventivi', path: '/quotes', icon: FileText },
    { name: 'Ordini Auto', path: '/orders', icon: Car },
    { name: 'Dealers', path: '/dealers', icon: Users },
    { name: 'Credenziali', path: '/credentials', icon: Key },
    { name: 'Impostazioni', path: '/settings', icon: Settings },
  ];
  
  const toggleSidebar = () => setIsOpen(!isOpen);
  
  return (
    <>
      {/* Mobile menu button */}
      <button 
        onClick={toggleSidebar} 
        className="fixed bottom-4 right-4 md:hidden z-50 bg-primary text-white p-3 rounded-full shadow-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      
      <aside className={`
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 
        fixed top-0 left-0 h-full w-64 
        bg-gray-900 text-white 
        transform transition-transform duration-200 ease-in-out 
        md:sticky md:top-0 z-40
      `}>
        <div className="flex flex-col h-full">
          <div className="px-6 py-5">
            <div className="flex items-center gap-3">
              <ShoppingBag className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">Gestionale CMC</span>
            </div>
          </div>
          
          <nav className="flex-1 px-3 py-3">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.name}>
                  <NavLink 
                    to={item.path} 
                    className={({ isActive }) => `
                      flex items-center gap-3 px-3 py-2 rounded-md
                      ${isActive 
                        ? 'bg-gray-800 text-primary' 
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'}
                    `}
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          
          <div className="px-3 py-4 border-t border-gray-800">
            <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded-md">
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
