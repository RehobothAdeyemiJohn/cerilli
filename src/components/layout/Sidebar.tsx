import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Switch } from "@/components/ui/switch"
import { Moon, Sun, LayoutDashboard, ShoppingCart, FileText, Users, Settings, Truck, AlertTriangle, PackageOpen } from 'lucide-react';

const Sidebar = () => {
  const { isAdmin } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(true); // Sidebar is open by default

  // Function to close sidebar on mobile after clicking a link
  const closeSidebarOnMobile = () => {
    if (window.innerWidth <= 768) {
      setIsOpen(false);
    }
  };

  // Effect to handle window resize and close sidebar on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };

    // Set initial state on mount
    handleResize();

    // Add event listener for resize
    window.addEventListener('resize', handleResize);

    // Clean up event listener on unmount
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <aside className={`sidebar-container ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-content">
        {/* Logo */}
        <div className="sidebar-logo">
          <img src="/cirelli-logo.svg" alt="Cirelli Motor Company Logo" />
        </div>

        {/* Navigation Links */}
        <nav className="sidebar-nav">
          <ul className="space-y-1">
            {/* Dashboard Link */}
            <li>
              <NavLink 
                to="/dashboard"
                className={({ isActive }) => 
                  `sidebar-link ${isActive ? 'active' : ''}`
                }
                onClick={closeSidebarOnMobile}
              >
                <LayoutDashboard className="sidebar-icon" />
                <span>Dashboard</span>
              </NavLink>
            </li>

            {/* Inventory Link */}
            <li>
              <NavLink 
                to="/inventory"
                className={({ isActive }) => 
                  `sidebar-link ${isActive ? 'active' : ''}`
                }
                onClick={closeSidebarOnMobile}
              >
                <ShoppingCart className="sidebar-icon" />
                <span>Inventario</span>
              </NavLink>
            </li>

            {/* Orders Link */}
            <li>
              <NavLink 
                to="/orders"
                className={({ isActive }) => 
                  `sidebar-link ${isActive ? 'active' : ''}`
                }
                onClick={closeSidebarOnMobile}
              >
                <PackageOpen className="sidebar-icon" />
                <span>Ordini</span>
              </NavLink>
            </li>

            {/* Dealer Contracts Link - Add after Orders link */}
            {isAdmin && (
              <li>
                <NavLink 
                  to="/contracts"
                  className={({ isActive }) => 
                    `sidebar-link ${isActive ? 'active' : ''}`
                  }
                  onClick={closeSidebarOnMobile}
                >
                  <FileText className="sidebar-icon" />
                  <span>Contratti Dealer</span>
                </NavLink>
              </li>
            )}

            {/* Quotes Link */}
            <li>
              <NavLink 
                to="/quotes"
                className={({ isActive }) => 
                  `sidebar-link ${isActive ? 'active' : ''}`
                }
                onClick={closeSidebarOnMobile}
              >
                <FileText className="sidebar-icon" />
                <span>Preventivi</span>
              </NavLink>
            </li>

            {/* Dealers Link - Visible only to admins */}
            {isAdmin && (
              <li>
                <NavLink 
                  to="/dealers"
                  className={({ isActive }) => 
                    `sidebar-link ${isActive ? 'active' : ''}`
                  }
                  onClick={closeSidebarOnMobile}
                >
                  <Users className="sidebar-icon" />
                  <span>Concessionari</span>
                </NavLink>
              </li>
            )}

            {/* Credentials Link - Visible only to admins */}
            {isAdmin && (
              <li>
                <NavLink 
                  to="/credentials"
                  className={({ isActive }) => 
                    `sidebar-link ${isActive ? 'active' : ''}`
                  }
                  onClick={closeSidebarOnMobile}
                >
                  <Users className="sidebar-icon" />
                  <span>Credenziali</span>
                </NavLink>
              </li>
            )}

            {/* Deliveries Link - Visible only to admins */}
            {isAdmin && (
              <li>
                <NavLink 
                  to="/deliveries"
                  className={({ isActive }) => 
                    `sidebar-link ${isActive ? 'active' : ''}`
                  }
                  onClick={closeSidebarOnMobile}
                >
                  <Truck className="sidebar-icon" />
                  <span>Trasporti</span>
                </NavLink>
              </li>
            )}

            {/* Defects Link - Visible only to admins */}
            {isAdmin && (
              <li>
                <NavLink 
                  to="/defects"
                  className={({ isActive }) => 
                    `sidebar-link ${isActive ? 'active' : ''}`
                  }
                  onClick={closeSidebarOnMobile}
                >
                  <AlertTriangle className="sidebar-icon" />
                  <span>Difettosità</span>
                </NavLink>
              </li>
            )}

            {/* Settings Link */}
            <li>
              <NavLink 
                to="/settings"
                className={({ isActive }) => 
                  `sidebar-link ${isActive ? 'active' : ''}`
                }
                onClick={closeSidebarOnMobile}
              >
                <Settings className="sidebar-icon" />
                <span>Impostazioni</span>
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* Theme Toggle */}
        <div className="sidebar-theme-toggle">
          <Sun className="h-4 w-4 text-yellow-500" />
          <Switch
            checked={theme === "dark"}
            onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
          />
          <Moon className="h-4 w-4 text-blue-300" />
        </div>

        {/* Version Info */}
        <div className="sidebar-version">
          <p>Cirelli Motor Company</p>
          <p>v1.0.0</p>
        </div>
      </div>
      
      {/* Backdrop for mobile */}
      <div className="sidebar-backdrop" onClick={() => setIsOpen(false)}></div>
    </aside>
  );
};

export default Sidebar;
