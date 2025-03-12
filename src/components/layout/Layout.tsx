
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} />
      <div className="flex flex-col flex-1">
        <Header toggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-auto bg-white">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
