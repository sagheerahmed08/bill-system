
import React from 'react';
import { User, Phone, Mail, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CustomerInfoCard = ({ customer, settings, onEdit }) => {
  return (
    <div className={`p-8 rounded-xl shadow-lg relative ${settings.darkMode ? 'bg-gray-800 neumorphism-dark' : 'bg-white neumorphism'}`}>
      <Button variant="outline" size="icon" onClick={onEdit} className="absolute top-4 right-4">
        <Edit className="w-4 h-4" />
      </Button>
      <div className="flex items-center space-x-4 mb-6">
        <User className={`w-12 h-12 ${settings.darkMode ? 'text-primary-foreground' : 'text-primary'}`} />
        <div>
          <h1 className="text-3xl font-bold">{customer.name}</h1>
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
            <Phone className="w-4 h-4" />
            <span>{customer.phone}</span>
          </div>
          {customer.email && (
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
              <Mail className="w-4 h-4" />
              <span>{customer.email}</span>
            </div>
          )}
        </div>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Customer since: {new Date(customer.created_at).toLocaleDateString()}
      </p>
    </div>
  );
};

export default CustomerInfoCard;
