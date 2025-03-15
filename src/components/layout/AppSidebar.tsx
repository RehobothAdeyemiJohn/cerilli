
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent
} from "@/components/ui/sidebar";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  FileText, 
  Users, 
  Settings, 
  Truck, 
  AlertTriangle, 
  PackageOpen,
  Store
} from 'lucide-react';

const AppSidebar = () => {
  const { isAdmin } = useAuth();
  const location = useLocation();

  return (
    <div className="h-full flex flex-col app-sidebar">
      {/* Logo */}
      <div className="p-4 flex justify-center">
        <img src="/cirelli-logo.svg" alt="Cirelli Motor Company Logo" className="h-10" />
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Dashboard Link */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === '/dashboard'}>
                  <NavLink to="/dashboard">
                    <LayoutDashboard className="w-5 h-5" />
                    <span>Dashboard</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Inventory Link */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === '/inventory'}>
                  <NavLink to="/inventory">
                    <ShoppingCart className="w-5 h-5" />
                    <span>Inventario</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Orders Link */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === '/orders'}>
                  <NavLink to="/orders">
                    <PackageOpen className="w-5 h-5" />
                    <span>Ordini</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Dealer Stock Link */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === '/dealer-stock'}>
                  <NavLink to="/dealer-stock">
                    <Store className="w-5 h-5" />
                    <span>Stock Dealer</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Dealer Contracts Link */}
              {isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={location.pathname === '/contracts'}>
                    <NavLink to="/contracts">
                      <FileText className="w-5 h-5" />
                      <span>Contratti Dealer</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {/* Quotes Link */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === '/quotes'}>
                  <NavLink to="/quotes">
                    <FileText className="w-5 h-5" />
                    <span>Preventivi</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Dealers Link - Visible only to admins */}
              {isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={location.pathname === '/dealers'}>
                    <NavLink to="/dealers">
                      <Users className="w-5 h-5" />
                      <span>Concessionari</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {/* Credentials Link - Visible only to admins */}
              {isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={location.pathname === '/credentials'}>
                    <NavLink to="/credentials">
                      <Users className="w-5 h-5" />
                      <span>Credenziali</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {/* Deliveries Link - Visible only to admins */}
              {isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={location.pathname === '/deliveries'}>
                    <NavLink to="/deliveries">
                      <Truck className="w-5 h-5" />
                      <span>Trasporti</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {/* Defects Link - Visible only to admins */}
              {isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={location.pathname === '/defects'}>
                    <NavLink to="/defects">
                      <AlertTriangle className="w-5 h-5" />
                      <span>Difettosità</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Impostazioni</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Settings Link */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === '/settings'}>
                  <NavLink to="/settings">
                    <Settings className="w-5 h-5" />
                    <span>Impostazioni</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </div>

      {/* Version Info */}
      <div className="p-4 text-xs text-muted-foreground">
        <p>Cirelli Motor Company</p>
        <p>v1.0.0</p>
      </div>
    </div>
  );
};

export default AppSidebar;
