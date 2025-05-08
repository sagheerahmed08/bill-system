
import React from 'react';
import { motion } from 'framer-motion';
import { Package, DollarSign, ShoppingCart, ExternalLink } from 'lucide-react';
import { useShopSettings } from '@/contexts/ShopSettingsContext';
import { Link } from 'react-router-dom';

const cardTypes = {
  totalProducts: { title: "Total Products", icon: Package },
  inventoryValue: { title: "Inventory Value", icon: DollarSign },
  itemsSold: { title: "Items Sold", icon: ShoppingCart },
};

const StatCard = ({ type, value, periodLabel, link }) => {
  const { settings } = useShopSettings();
  const cardInfo = cardTypes[type] || { title: "Statistic", icon: DollarSign };
  const Icon = cardInfo.icon;
  const title = periodLabel ? `${cardInfo.title} (${periodLabel})` : cardInfo.title;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-xl p-6 ${settings.darkMode ? 'neumorphism-dark' : 'neumorphism'} flex flex-col justify-between shadow-lg hover:shadow-xl transition-shadow`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{title}</p>
          <h3 className={`text-3xl font-bold mt-1 ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>{value}</h3>
        </div>
        <div className={`p-3 rounded-full ${settings.darkMode ? 'bg-primary/20' : 'bg-primary/10'}`}>
          <Icon className="w-7 h-7 text-primary" />
        </div>
      </div>
      {link && (
        <Link to={link.to} className="mt-4 text-xs text-primary hover:underline flex items-center font-medium">
          {link.label} <ExternalLink className="w-3 h-3 ml-1" />
        </Link>
      )}
    </motion.div>
  );
};

export default StatCard;
