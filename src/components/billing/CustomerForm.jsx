
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

const CustomerForm = ({ customerInfo, handleCustomerInfoChange, isCheckingCustomer, darkMode }) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="customerPhone">Customer Phone</Label>
        <div className="relative mt-1">
          <Input 
            id="customerPhone" 
            name="phone" 
            value={customerInfo.phone} 
            onChange={handleCustomerInfoChange} 
            placeholder="Enter phone (required)" 
            required
          />
          {isCheckingCustomer && <Loader2 className="absolute right-2 top-2.5 h-5 w-5 animate-spin text-muted-foreground" />}
        </div>
      </div>
      <div>
        <Label htmlFor="customerName">Customer Name</Label>
        <Input 
          id="customerName" 
          name="name" 
          value={customerInfo.name} 
          onChange={handleCustomerInfoChange} 
          placeholder="Enter name (required)" 
          className="mt-1"
          required
        />
      </div>
      <div>
        <Label htmlFor="customerEmail">Customer Email (Optional)</Label>
        <Input 
          id="customerEmail" 
          name="email" 
          type="email"
          value={customerInfo.email || ''} 
          onChange={handleCustomerInfoChange} 
          placeholder="Enter email" 
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="paymentMethod">Payment Method</Label>
        <select 
          id="paymentMethod" 
          name="paymentMethod" 
          value={customerInfo.paymentMethod} 
          onChange={handleCustomerInfoChange} 
          className={`w-full p-2 border rounded-lg mt-1 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-background border-border'}`}
        >
          <option value="CASH">Cash</option>
          <option value="CARD">Card</option>
          <option value="UPI">UPI</option>
          {/* Add other payment methods as needed */}
        </select>
      </div>
    </div>
  );
};

export default CustomerForm;
