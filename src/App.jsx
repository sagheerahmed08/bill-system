
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import Dashboard from '@/components/Dashboard';
import Products from '@/components/Products';
import Billing from '@/components/Billing';
import Settings from '@/components/Settings';
import Layout from '@/components/Layout';
import Customers from '@/components/Customers';
import CustomerDetail from '@/components/CustomerDetail';
import SaleDetail from '@/components/SaleDetail'; 
import EditSale from '@/components/EditSale';
import { ShopSettingsProvider, useShopSettings } from '@/contexts/ShopSettingsContext';

const ThemeWrapper = ({ children }) => {
  const { settings } = useShopSettings();

  useEffect(() => {
    const root = window.document.documentElement;
    if (settings.darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.darkMode]);

  return <>{children}</>;
};

function App() {
  return (
    <ShopSettingsProvider>
      <ThemeWrapper>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/billing" element={<Billing />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/customers/:customerId" element={<CustomerDetail />} />
              <Route path="/sales/invoice/:invoiceNumber" element={<SaleDetail />} />
              <Route path="/sales/edit/:saleId" element={<EditSale />} />
            </Routes>
          </Layout>
          <Toaster />
        </Router>
      </ThemeWrapper>
    </ShopSettingsProvider>
  );
}

export default App;
