
import React, { useState, useEffect, useCallback } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useShopSettings } from '@/contexts/ShopSettingsContext';
import { supabase } from '@/lib/supabase';

import StatCard from '@/components/dashboard/StatCard';
import InfoTabs from '@/components/dashboard/InfoTabs';
import LowStockAlerts from '@/components/dashboard/LowStockAlerts';
import SoldItemsReport from '@/components/dashboard/SoldItemsReport';


const Dashboard = () => {
  const { products } = useProducts();
  const { settings } = useShopSettings();
  const [soldItems, setSoldItems] = useState([]);
  const [loadingSoldItems, setLoadingSoldItems] = useState(false);
  const [salesFilter, setSalesFilter] = useState({ type: 'today', label: 'Today' });
  const [customDate, setCustomDate] = useState(new Date().toISOString().split('T')[0]);
  const [customMonth, setCustomMonth] = useState(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`);
  const [customYear, setCustomYear] = useState(new Date().getFullYear().toString());
  const [activeInfoTab, setActiveInfoTab] = useState('lowStock');
  const [totalSalesValue, setTotalSalesValue] = useState(0);
  const [itemsSoldCount, setItemsSoldCount] = useState(0);

  const lowStockItems = products.filter(product => product.stock < 10);
  const totalInventoryValue = products.reduce((sum, product) => sum + (product.price * product.stock), 0);

  const fetchSoldItems = useCallback(async () => {
    setLoadingSoldItems(true);
    let startDate, endDate;
    const now = new Date();

    switch (salesFilter.type) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        endDate = new Date(new Date().setHours(23, 59, 59, 999)); 
        break;
      case 'week':
        const currentDay = now.getDay();
        const diff = now.getDate() - currentDay + (currentDay === 0 ? -6 : 1); 
        const firstDayOfWeek = new Date(new Date(now).setDate(diff));
        startDate = new Date(firstDayOfWeek.setHours(0, 0, 0, 0));
        const lastDayOfWeek = new Date(firstDayOfWeek);
        lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
        endDate = new Date(lastDayOfWeek.setHours(23, 59, 59, 999));
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
      case 'customDate':
        startDate = new Date(customDate);
        startDate.setHours(0,0,0,0);
        endDate = new Date(customDate);
        endDate.setHours(23,59,59,999);
        break;
      case 'customMonth':
        const [yearM, monthM] = customMonth.split('-').map(Number);
        startDate = new Date(yearM, monthM - 1, 1);
        endDate = new Date(yearM, monthM, 0, 23, 59, 59, 999);
        break;
      case 'customYear':
        const yearY = parseInt(customYear);
        startDate = new Date(yearY, 0, 1);
        endDate = new Date(yearY, 11, 31, 23, 59, 59, 999);
        break;
      case 'all':
      default:
        break;
    }

    let query = supabase
      .from('sale_items')
      .select(`
        quantity,
        unit_price,
        products (name, reference_number),
        sales!inner (created_at)
      `);
    
    if (startDate && endDate) {
      query = query.filter('sales.created_at', 'gte', startDate.toISOString())
                   .filter('sales.created_at', 'lte', endDate.toISOString());
    }
    
    const { data, error } = await query;

    if (error) {
      console.error("Error fetching sold items:", error);
      setSoldItems([]);
      setTotalSalesValue(0);
      setItemsSoldCount(0);
    } else {
      const aggregatedItems = data.reduce((acc, item) => {
        if (!item.products) { return acc; } 
        const key = item.products.reference_number || item.products.name;
        if (!acc[key]) {
          acc[key] = { 
            name: item.products.name, 
            ref: item.products.reference_number, 
            quantity: 0, 
            totalValue: 0 
          };
        }
        acc[key].quantity += item.quantity;
        acc[key].totalValue += item.quantity * item.unit_price;
        return acc;
      }, {});
      const currentSoldItems = Object.values(aggregatedItems);
      setSoldItems(currentSoldItems);
      setTotalSalesValue(currentSoldItems.reduce((sum, item) => sum + item.totalValue, 0));
      setItemsSoldCount(currentSoldItems.reduce((sum, item) => sum + item.quantity, 0));
    }
    setLoadingSoldItems(false);
  }, [salesFilter, customDate, customMonth, customYear]);

  useEffect(() => {
    fetchSoldItems();
  }, [fetchSoldItems]);
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          type="totalProducts"
          value={products.length}
          link={{to: "/products", label: "Manage Products"}}
        />
        <StatCard
          type="inventoryValue"
          value={`${settings.currency.symbol}${totalInventoryValue.toFixed(2)}`}
        />
         <StatCard
          type="itemsSold"
          value={itemsSoldCount}
          periodLabel={salesFilter.label}
        />
      </div>
      
      <div className={`rounded-xl p-6 ${settings.darkMode ? 'neumorphism-dark' : 'neumorphism'}`}>
        <InfoTabs
            activeInfoTab={activeInfoTab}
            setActiveInfoTab={setActiveInfoTab}
            lowStockItemsCount={lowStockItems.length}
            salesFilter={salesFilter}
            setSalesFilter={setSalesFilter}
            customDate={customDate}
            setCustomDate={setCustomDate}
            customMonth={customMonth}
            setCustomMonth={setCustomMonth}
            customYear={customYear}
            setCustomYear={setCustomYear}
        />
        
        {activeInfoTab === 'lowStock' && (
          <LowStockAlerts lowStockItems={lowStockItems} settings={settings} />
        )}

        {activeInfoTab === 'soldItems' && (
          <SoldItemsReport
            soldItems={soldItems}
            loadingSoldItems={loadingSoldItems}
            totalSalesValue={totalSalesValue}
            salesFilterLabel={salesFilter.label}
            settings={settings}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
