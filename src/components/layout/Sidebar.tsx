
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
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';

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
    <div className="flex flex-col h-full">
      <SidebarMenu>
        {menuItems.map((item) => (
          <SidebarMenuItem key={item.path}>
            <Link to={item.path} className="w-full">
              <SidebarMenuButton 
                isActive={location.pathname === item.path}
                tooltip={item.title}
              >
                <item.icon className="w-5 h-5 mr-3" />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
      
      <div className="pt-4 mt-4 border-t border-border">
        <p className="px-2 text-xs font-semibold text-muted-foreground uppercase mb-2">
          Amministrazione
        </p>
        
        <SidebarMenu>
          {adminItems.map((item) => (
            <SidebarMenuItem key={item.path}>
              <Link to={item.path} className="w-full">
                <SidebarMenuButton 
                  isActive={location.pathname === item.path}
                  tooltip={item.title}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </div>
    </div>
  );
};

export default Sidebar;
