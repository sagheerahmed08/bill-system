
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';

const CartDisplay = ({ cart, updateQuantity, settings }) => {
  return (
    <div className={`space-y-4 mb-6 max-h-[30vh] overflow-y-auto pr-1 ${settings.darkMode ? 'custom-scrollbar-dark' : 'custom-scrollbar'}`}>
      {cart.map(item => (
        <div key={item.id} className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">{item.name}</h3>
            <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Ref: {item.reference_number}
            </p>
            <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {settings.currency.symbol}{item.price.toFixed(2)} x {item.quantity}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
            >
              <Minus className="w-4 h-4" />
            </Button>
            <span className="w-8 text-center">{item.quantity}</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CartDisplay;
