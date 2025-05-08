
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Store, ShoppingBag, BarChart2, Settings as SettingsIcon, Users } from 'lucide-react';
import { useShopSettings } from '@/contexts/ShopSettingsContext';

const Layout = ({ children }) => {
  const location = useLocation();
  const { settings } = useShopSettings();

  const navItems = [
    { path: '/', icon: BarChart2, label: 'Dashboard' },
    { path: '/products', icon: Store, label: 'Products' },
    { path: '/billing', icon: ShoppingBag, label: 'Billing' },
    { path: '/customers', icon: Users, label: 'Customers' },
    { path: '/settings', icon: SettingsIcon, label: 'Settings' },
  ];

  return (
    <div className={`min-h-screen flex ${settings.darkMode ? 'dark bg-background text-foreground' : 'bg-gradient-to-br from-primary/5 via-background to-secondary/5'}`}>
      <nav className={`fixed top-0 left-0 h-full w-64 p-6 transition-all duration-300 ease-in-out shadow-lg
                      ${settings.darkMode ? 'bg-gray-900 border-r border-gray-700' : 'glass-morphism border-r border-gray-200/50'}`}>
        <div className="mb-10 flex justify-between items-center">
          <h1 className={`text-3xl font-bold tracking-tight ${settings.darkMode ? 'text-primary-foreground' : 'text-primary'}`}>{settings.shopName || "Shop"}</h1>
        </div>
        <ul className="space-y-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
                             (item.path === "/customers" && (location.pathname.startsWith("/customers/") || location.pathname.startsWith("/sales/")));
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`relative flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ease-out group
                    ${ isActive
                      ? settings.darkMode ? 'bg-primary text-primary-foreground shadow-md' : 'bg-primary text-white shadow-lg'
                      : settings.darkMode ? 'text-gray-300 hover:bg-gray-700/50 hover:text-primary-foreground' : 'text-gray-600 hover:bg-primary/10 hover:text-primary'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${isActive ? '' : (settings.darkMode ? 'text-gray-400 group-hover:text-primary-foreground' : 'text-gray-500 group-hover:text-primary')}`} />
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <motion.div
                      className={`absolute -left-3 w-1.5 h-3/5 ${settings.darkMode ? 'bg-primary-foreground' : 'bg-white'} rounded-r-full`}
                      layoutId="activeNav"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30
                      }}
                      style={{ top: 0, bottom: 0, margin: 'auto 0' }}
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <main className="ml-64 p-8 flex-1 overflow-y-auto custom-scrollbar">
        {children}
      </main>
    </div>
  );
};

export default Layout;
