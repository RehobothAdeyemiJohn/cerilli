
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { 
  SidebarProvider, 
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset
} from '@/components/ui/sidebar';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background">
        <ShadcnSidebar>
          <SidebarHeader>
            <div className="flex items-center justify-between p-4">
              <h2 className="text-xl font-bold text-foreground">Cirelli Motor</h2>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
          </SidebarContent>
        </ShadcnSidebar>
        
        <SidebarInset>
          <Header toggleSidebar={toggleSidebar} />
          <main className="flex-1 overflow-auto p-6 pt-20">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
