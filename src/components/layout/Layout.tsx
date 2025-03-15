
import React from 'react';
import { Outlet } from 'react-router-dom';
import { 
  SidebarProvider, 
  Sidebar as ShadcnSidebar, 
  SidebarContent,
  SidebarTrigger
} from '@/components/ui/sidebar';
import Header from './Header';
import AppSidebar from './AppSidebar';

const Layout = () => {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen overflow-hidden">
        <ShadcnSidebar>
          <SidebarContent>
            <AppSidebar />
          </SidebarContent>
        </ShadcnSidebar>
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header>
            <SidebarTrigger />
          </Header>
          <main className="flex-1 overflow-auto p-4">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
