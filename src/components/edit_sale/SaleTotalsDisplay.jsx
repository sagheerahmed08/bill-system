
import React from 'react';

const SaleTotalsDisplay = ({ subtotal, taxAmount, totalAmount, settings, taxRate }) => {
  return (
    <div className={`p-4 rounded-lg mt-4 ${settings.darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
      <div className="flex justify-between">
        <span className="font-medium">Subtotal:</span>
        <span>{settings.currency.symbol}{subtotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between">
        <span className="font-medium">Tax ({ (taxRate * 100).toFixed(0) }%):</span>
        <span>{settings.currency.symbol}{taxAmount.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-xl font-bold mt-1">
        <span className="font-medium">Total:</span>
        <span>{settings.currency.symbol}{totalAmount.toFixed(2)}</span>
      </div>
    </div>
  );
};

export default SaleTotalsDisplay;
