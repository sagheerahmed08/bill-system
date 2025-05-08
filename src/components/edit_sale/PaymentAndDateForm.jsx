
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const PaymentAndDateForm = ({ paymentMethod, onPaymentMethodChange, saleDate, onSaleDateChange, darkMode }) => {
  return (
    <fieldset className="grid md:grid-cols-2 gap-6 border p-4 rounded-md">
      <legend className="text-lg font-semibold px-1">Payment & Date</legend>
      <div>
        <Label htmlFor="paymentMethod">Payment Method</Label>
        <select 
          id="paymentMethod" 
          value={paymentMethod} 
          onChange={(e) => onPaymentMethodChange(e.target.value)} 
          className={`w-full p-2 border rounded-lg mt-1 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-background border-border'}`}
        >
          <option value="CASH">Cash</option>
          <option value="CARD">Card</option>
          <option value="UPI">UPI</option>
        </select>
      </div>
      <div>
        <Label htmlFor="saleDate">Sale Date & Time</Label>
        <Input id="saleDate" type="datetime-local" value={saleDate} onChange={(e) => onSaleDateChange(e.target.value)} className="mt-1" />
      </div>
    </fieldset>
  );
};

export default PaymentAndDateForm;
