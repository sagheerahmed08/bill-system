
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const ShopSettingsContext = createContext();

export const useShopSettings = () => useContext(ShopSettingsContext);

const defaultSettings = {
  shopName: 'Fashion Hub',
  address: '123 Fashion Street, Fashion City',
  phone: '123-456-7890',
  email: 'info@fashionhub.com',
  gstNo: 'GST123456789',
  currency: { name: 'INR', symbol: '₹' },
  taxRate: 0.18, 
  returnPolicy: 'For returns and exchanges, please visit our store within 7 days with the original receipt.',
  darkMode: false,
  customFields: {},
  theme: 'default', 
};

export const ShopSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('shop_settings')
          .select('*')
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') { 
          console.error('Error fetching settings:', error);
          setSettings(defaultSettings);
        } else if (data) {
          setSettings({
            shopName: data.shopname || defaultSettings.shopName,
            address: data.address || defaultSettings.address,
            phone: data.phone || defaultSettings.phone,
            email: data.email || defaultSettings.email,
            gstNo: data.gstno || defaultSettings.gstNo,
            currency: data.currency ? (typeof data.currency === 'string' ? JSON.parse(data.currency) : data.currency) : defaultSettings.currency,
            taxRate: data.taxrate !== null ? data.taxrate : defaultSettings.taxRate,
            returnPolicy: data.returnpolicy || defaultSettings.returnPolicy,
            darkMode: data.dark_mode !== null ? data.dark_mode : defaultSettings.darkMode,
            customFields: data.custom_fields && typeof data.custom_fields === 'object' ? data.custom_fields : defaultSettings.customFields,
            theme: data.theme || defaultSettings.theme,
          });
        } else {
          const { error: insertError } = await supabase
            .from('shop_settings')
            .insert([{ 
              shopname: defaultSettings.shopName,
              address: defaultSettings.address,
              phone: defaultSettings.phone,
              email: defaultSettings.email,
              gstno: defaultSettings.gstNo,
              currency: defaultSettings.currency,
              taxrate: defaultSettings.taxRate,
              returnpolicy: defaultSettings.returnPolicy,
              dark_mode: defaultSettings.darkMode,
              custom_fields: defaultSettings.customFields,
              theme: defaultSettings.theme,
             }]);
          if (insertError) {
            console.error('Error inserting default settings:', insertError);
            setSettings(defaultSettings);
          }
        }
      } catch (err) {
        console.error("Catastrophic error fetching settings:", err);
        setSettings(defaultSettings);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const updateSetting = async (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    const dbKeyMap = {
      shopName: 'shopname',
      gstNo: 'gstno',
      taxRate: 'taxrate',
      returnPolicy: 'returnpolicy',
      darkMode: 'dark_mode',
      customFields: 'custom_fields',
      theme: 'theme'
    };
    const dbKey = dbKeyMap[key] || key;
    
    let dbValue = value;

    try {
      const { data, error: selectError } = await supabase
        .from('shop_settings')
        .select('id')
        .limit(1)
        .single();
      
      if (selectError && selectError.code !== 'PGRST116') throw selectError;

      if (data && data.id) {
        const { error: updateError } = await supabase
          .from('shop_settings')
          .update({ [dbKey]: dbValue }) 
          .eq('id', data.id);
        if (updateError) throw updateError;
      } else {
          const payload = {
            shopname: newSettings.shopName,
            address: newSettings.address,
            phone: newSettings.phone,
            email: newSettings.email,
            gstno: newSettings.gstNo,
            currency: newSettings.currency,
            taxrate: newSettings.taxRate,
            returnpolicy: newSettings.returnPolicy,
            dark_mode: newSettings.darkMode,
            custom_fields: newSettings.customFields,
            theme: newSettings.theme,
          };
          payload[dbKey] = dbValue; 
          
          const { error: insertError } = await supabase
            .from('shop_settings')
            .insert([payload]);
          if (insertError) throw insertError;
      }
    } catch (error) {
        console.error(`Error updating setting ${key}:`, error);
    }
  };
  
  useEffect(() => {
    const root = window.document.documentElement;
    if (settings.darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    root.setAttribute('data-theme', settings.theme || 'default');
  }, [settings.darkMode, settings.theme]);


  return (
    <ShopSettingsContext.Provider value={{ settings, updateSetting, loading }}>
      {children}
    </ShopSettingsContext.Provider>
  );
};
