
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useShopSettings } from '@/contexts/ShopSettingsContext';
import { Sun, Moon, PlusCircle, Trash2, Palette } from 'lucide-react';

const currencies = [
  { name: 'USD', symbol: '$' },
  { name: 'EUR', symbol: '€' },
  { name: 'GBP', symbol: '£' },
  { name: 'INR', symbol: '₹' },
  { name: 'JPY', symbol: '¥' },
];

const themes = [
    { name: 'Default', value: 'default', colors: { light: 'bg-blue-500', dark: 'bg-blue-400'} },
    { name: 'Forest Green', value: 'green', colors: { light: 'bg-green-500', dark: 'bg-green-400'} },
    { name: 'Royal Purple', value: 'purple', colors: { light: 'bg-purple-500', dark: 'bg-purple-400'} },
    { name: 'Sunset Orange', value: 'orange', colors: { light: 'bg-orange-500', dark: 'bg-orange-400'} },
];

const Settings = () => {
  const { settings, updateSetting, loading } = useShopSettings();
  const { toast } = useToast();
  const [formData, setFormData] = useState(settings);
  const [customFieldKey, setCustomFieldKey] = useState('');
  const [customFieldValue, setCustomFieldValue] = useState('');

  useEffect(() => {
    if (!loading) {
      setFormData({
        ...settings,
        customFields: settings.customFields && typeof settings.customFields === 'object' ? settings.customFields : {},
        theme: settings.theme || 'default',
      });
    }
  }, [settings, loading]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCurrencyChange = (e) => {
    const selectedCurrency = currencies.find(c => c.name === e.target.value);
    setFormData(prev => ({ ...prev, currency: selectedCurrency }));
  };

  const handleTaxRateChange = (e) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0 && value <= 100) {
      setFormData(prev => ({ ...prev, taxRate: value / 100 }));
    } else if (e.target.value === '') {
       setFormData(prev => ({ ...prev, taxRate: 0 }));
    }
  };
  
  const toggleDarkMode = () => {
    const newDarkModeState = !formData.darkMode;
    setFormData(prev => ({ ...prev, darkMode: newDarkModeState }));
    updateSetting('darkMode', newDarkModeState);
     toast({
      title: "Appearance Updated",
      description: `Switched to ${newDarkModeState ? 'Dark' : 'Light'} Mode.`,
    });
  };

  const handleThemeChange = (themeValue) => {
    setFormData(prev => ({ ...prev, theme: themeValue }));
    updateSetting('theme', themeValue);
    toast({
        title: "Theme Changed",
        description: `Switched to ${themes.find(t => t.value === themeValue)?.name || 'Default'} theme.`
    });
  }

  const handleAddCustomField = () => {
    if (!customFieldKey.trim() || !customFieldValue.trim()) {
      toast({ title: "Error", description: "Custom field name and value cannot be empty.", variant: "destructive" });
      return;
    }
    const newCustomFields = { ...(formData.customFields || {}), [customFieldKey.trim()]: customFieldValue.trim() };
    setFormData(prev => ({ ...prev, customFields: newCustomFields }));
    setCustomFieldKey('');
    setCustomFieldValue('');
  };

  const handleRemoveCustomField = (keyToRemove) => {
    const { [keyToRemove]: _, ...remainingCustomFields } = formData.customFields || {};
    setFormData(prev => ({ ...prev, customFields: remainingCustomFields }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSave = {
      ...formData,
      customFields: formData.customFields && typeof formData.customFields === 'object' ? formData.customFields : {},
    };

    Object.keys(dataToSave).forEach(key => {
      if (JSON.stringify(settings[key]) !== JSON.stringify(dataToSave[key])) {
        updateSetting(key, dataToSave[key]);
      }
    });
    toast({
      title: "Settings Saved",
      description: "Your shop settings have been updated.",
    });
  };

  if (loading) {
    return <div className="text-center py-10">Loading settings...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-2xl mx-auto"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Shop Settings</h1>
      </div>
      
      <form onSubmit={handleSubmit} className={`p-8 rounded-xl space-y-6 ${settings.darkMode ? 'neumorphism-dark' : 'neumorphism bg-card text-card-foreground'}`}>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="shopName">Shop Name</Label>
              <Input id="shopName" name="shopName" value={formData.shopName || ''} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="gstNo">GST Number</Label>
              <Input id="gstNo" name="gstNo" value={formData.gstNo || ''} onChange={handleChange} />
            </div>
        </div>

        <div>
          <Label htmlFor="address">Address</Label>
          <Input id="address" name="address" value={formData.address || ''} onChange={handleChange} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" name="phone" value={formData.phone || ''} onChange={handleChange} />
            </div>
            <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" name="email" value={formData.email || ''} onChange={handleChange} />
            </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
            <Label htmlFor="currency">Currency</Label>
            <select
                id="currency"
                name="currency"
                value={formData.currency?.name || ''}
                onChange={handleCurrencyChange}
                className={`w-full p-2 border rounded-lg ${settings.darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-background border-border'}`}
            >
                {currencies.map(c => (
                <option key={c.name} value={c.name}>{c.name} ({c.symbol})</option>
                ))}
            </select>
            </div>
            <div>
            <Label htmlFor="taxRate">Tax Rate (%)</Label>
            <Input 
                id="taxRate" 
                name="taxRate" 
                type="number" 
                value={(formData.taxRate * 100).toFixed(2)} 
                onChange={handleTaxRateChange} 
                min="0" 
                max="100" 
                step="0.01"
            />
            </div>
        </div>

        <div>
          <Label htmlFor="returnPolicy">Return Policy</Label>
          <textarea
            id="returnPolicy"
            name="returnPolicy"
            value={formData.returnPolicy || ''}
            onChange={handleChange}
            rows="3"
            className={`w-full p-2 border rounded-lg ${settings.darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-background border-border'}`}
          />
        </div>

        <div className="space-y-2">
          <Label>Appearance</Label>
          <div className="flex items-center space-x-2">
             <Button onClick={toggleDarkMode} variant="outline" className="w-full md:w-auto">
                {formData.darkMode ? <Sun className="h-[1.2rem] w-[1.2rem] mr-2" /> : <Moon className="h-[1.2rem] w-[1.2rem] mr-2" />}
                {formData.darkMode ? 'Light Mode' : 'Dark Mode'}
            </Button>
          </div>
        </div>

        <div className="space-y-3">
            <div className="flex items-center space-x-2">
                <Palette className="h-5 w-5" />
                <Label>Theme Color</Label>
            </div>
            <div className="flex flex-wrap gap-3">
                {themes.map(theme => (
                <Button
                    key={theme.value}
                    type="button"
                    variant={formData.theme === theme.value ? 'default' : 'outline'}
                    onClick={() => handleThemeChange(theme.value)}
                    className="flex items-center space-x-2 px-4 py-2"
                >
                    <span className={`w-4 h-4 rounded-full ${settings.darkMode ? theme.colors.dark : theme.colors.light}`}></span>
                    <span>{theme.name}</span>
                </Button>
                ))}
            </div>
        </div>


        <div className="space-y-4 pt-4 border-t">
          <Label className="text-lg font-medium">Custom Fields</Label>
          {Object.entries(formData.customFields || {}).map(([key, value]) => (
            <div key={key} className="flex items-center space-x-2">
              <Input value={key} readOnly className="flex-1 font-medium" />
              <Input value={value} readOnly className="flex-1" />
              <Button type="button" variant="destructive" size="icon" onClick={() => handleRemoveCustomField(key)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <div className="flex items-end space-x-2">
            <div className="flex-1">
              <Label htmlFor="customFieldKey">Field Name</Label>
              <Input id="customFieldKey" value={customFieldKey} onChange={(e) => setCustomFieldKey(e.target.value)} placeholder="e.g., Website" />
            </div>
            <div className="flex-1">
              <Label htmlFor="customFieldValue">Field Value</Label>
              <Input id="customFieldValue" value={customFieldValue} onChange={(e) => setCustomFieldValue(e.target.value)} placeholder="e.g., www.example.com" />
            </div>
            <Button type="button" variant="outline" size="icon" onClick={handleAddCustomField}>
              <PlusCircle className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <Button type="submit" className="w-full text-lg py-3">Save Settings</Button>
      </form>
    </motion.div>
  );
};

export default Settings;
