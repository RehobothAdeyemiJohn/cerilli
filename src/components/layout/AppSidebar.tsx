
import React, { useState } from 'react';
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
  Store,
  ChevronDown,
  ChevronRight,
  UserCog,
  Wrench
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const AppSidebar = () => {
  const { isAdmin, user } = useAuth();
  const location = useLocation();
  
  // State for tracking open/closed collapsible sections
  const [openSections, setOpenSections] = useState({
    dealer: false,
    service: false,
    settings: false
  });

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

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

              {/* Inventory Link - renamed to Stock Veicoli */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === '/inventory'}>
                  <NavLink to="/inventory">
                    <ShoppingCart className="w-5 h-5" />
                    <span>Stock Veicoli</span>
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

              {/* Dealer Group Collapsible */}
              <SidebarMenuItem>
                <Collapsible open={openSections.dealer} onOpenChange={() => toggleSection('dealer')}>
                  <CollapsibleTrigger className="flex items-center w-full gap-2 px-3 py-2 rounded-md text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                    <Store className="w-5 h-5" />
                    <span className="flex-1">Dealer</span>
                    {openSections.dealer ? 
                      <ChevronDown className="w-4 h-4" /> : 
                      <ChevronRight className="w-4 h-4" />
                    }
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-8">
                    <SidebarMenu>
                      {/* Dealer Stock Link */}
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={location.pathname === '/dealer-stock'}>
                          <NavLink to="/dealer-stock">
                            <Store className="w-5 h-5" />
                            <span>Stock Dealer</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>

                      {/* Quotes Link */}
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={location.pathname === '/quotes'}>
                          <NavLink to="/quotes">
                            <FileText className="w-5 h-5" />
                            <span>Preventivi</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>

                      {/* Dealer Contracts Link - Only visible to admins */}
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={location.pathname === '/contracts'}>
                          <NavLink to="/contracts">
                            <FileText className="w-5 h-5" />
                            <span>Contratti Dealer</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenuItem>

              {/* Service Group Collapsible */}
              <SidebarMenuItem>
                <Collapsible open={openSections.service} onOpenChange={() => toggleSection('service')}>
                  <CollapsibleTrigger className="flex items-center w-full gap-2 px-3 py-2 rounded-md text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                    <Wrench className="w-5 h-5" />
                    <span className="flex-1">Service</span>
                    {openSections.service ? 
                      <ChevronDown className="w-4 h-4" /> : 
                      <ChevronRight className="w-4 h-4" />
                    }
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-8">
                    <SidebarMenu>
                      {/* Defects Link - renamed to Difformità Consegna */}
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={location.pathname === '/defects'}>
                          <NavLink to="/defects">
                            <AlertTriangle className="w-5 h-5" />
                            <span>Difformità Consegna</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>

                      {/* Deliveries Link - renamed from Trasporti to Consegne */}
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={location.pathname === '/deliveries'}>
                          <NavLink to="/deliveries">
                            <Truck className="w-5 h-5" />
                            <span>Consegne</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenuItem>

              {/* Settings Group Collapsible - Only visible to admins */}
              {isAdmin && (
                <SidebarMenuItem>
                  <Collapsible open={openSections.settings} onOpenChange={() => toggleSection('settings')}>
                    <CollapsibleTrigger className="flex items-center w-full gap-2 px-3 py-2 rounded-md text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                      <Settings className="w-5 h-5" />
                      <span className="flex-1">Impostazioni</span>
                      {openSections.settings ? 
                        <ChevronDown className="w-4 h-4" /> : 
                        <ChevronRight className="w-4 h-4" />
                      }
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-8">
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

                        {/* Credentials Link - Visible only to admins */}
                        <SidebarMenuItem>
                          <SidebarMenuButton asChild isActive={location.pathname === '/credentials'}>
                            <NavLink to="/credentials">
                              <UserCog className="w-5 h-5" />
                              <span>Credenziali</span>
                            </NavLink>
                          </SidebarMenuButton>
                        </SidebarMenuItem>

                        {/* Dealers Link - Visible only to admins */}
                        <SidebarMenuItem>
                          <SidebarMenuButton asChild isActive={location.pathname === '/dealers'}>
                            <NavLink to="/dealers">
                              <Users className="w-5 h-5" />
                              <span>Concessionari</span>
                            </NavLink>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      </SidebarMenu>
                    </CollapsibleContent>
                  </Collapsible>
                </SidebarMenuItem>
              )}
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
