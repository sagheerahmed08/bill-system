
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

const CustomerEditModal = ({ customer, onSave, onClose }) => {
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });
  const { toast } = useToast();

  useEffect(() => {
    if (customer) {
      setFormData({ name: customer.name, phone: customer.phone, email: customer.email || '' });
    }
  }, [customer]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast({ title: "Validation Error", description: "Name and Phone cannot be empty.", variant: "destructive" });
      return;
    }
    await onSave(customer.id, formData);
    onClose();
  };

  if (!customer) return null;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Customer Details</DialogTitle>
          <DialogDescription>Update customer information below.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <Label htmlFor="edit-name">Name</Label>
            <Input id="edit-name" name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="edit-phone">Phone</Label>
            <Input id="edit-phone" name="phone" value={formData.phone} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="edit-email">Email (Optional)</Label>
            <Input id="edit-email" name="email" type="email" value={formData.email} onChange={handleChange} />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerEditModal;
