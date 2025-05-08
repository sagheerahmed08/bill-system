
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const CustomerDetailsForm = ({ customerDetails, onCustomerChange }) => {
  return (
    <fieldset className="grid md:grid-cols-2 gap-6 border p-4 rounded-md">
      <legend className="text-lg font-semibold px-1">Customer Details</legend>
      <div>
        <Label htmlFor="customerName">Name</Label>
        <Input id="customerName" name="name" value={customerDetails.name} onChange={onCustomerChange} required />
      </div>
      <div>
        <Label htmlFor="customerPhone">Phone</Label>
        <Input id="customerPhone" name="phone" value={customerDetails.phone} onChange={onCustomerChange} required />
      </div>
      <div className="md:col-span-2">
        <Label htmlFor="customerEmail">Email (Optional)</Label>
        <Input id="customerEmail" name="email" type="email" value={customerDetails.email} onChange={onCustomerChange} />
      </div>
    </fieldset>
  );
};

export default CustomerDetailsForm;
