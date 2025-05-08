
import React from 'react';

const BillSummary = ({ subtotal, tax, total, settings }) => {
  return (
    <div className="border-t pt-4 space-y-2">
      <div className="flex justify-between">
        <span>Subtotal</span>
        <span>{settings.currency.symbol}{subtotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between">
        <span>Tax ({(settings.taxRate * 100).toFixed(0)}%)</span>
        <span>{settings.currency.symbol}{tax.toFixed(2)}</span>
      </div>
      <div className="flex justify-between font-bold text-lg">
        <span>Total</span>
        <span>{settings.currency.symbol}{total.toFixed(2)}</span>
      </div>
    </div>
  );
};

export default BillSummary;
