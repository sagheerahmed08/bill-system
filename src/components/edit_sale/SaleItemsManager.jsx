
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Trash2, PlusCircle } from 'lucide-react';

const SaleItemsManager = ({ 
  saleItems, 
  setSaleItems, 
  originalSaleItems, 
  allProducts, 
  settings, 
  onOpenProductSearch,
  toast
}) => {

  const handleItemQuantityChange = (itemId, newQuantityStr) => {
    const newQuantity = parseInt(newQuantityStr);
    setSaleItems(prevItems => prevItems.map(item => {
      // Check if item.id exists (existing item) or item.product_id (newly added item not yet saved)
      const currentItemId = item.id || item.product_id; 
      if (currentItemId === itemId) {
        const product = allProducts.find(p => p.id === item.product_id);
        const originalItem = originalSaleItems.find(oi => (oi.id || oi.product_id) === itemId);
        
        let effectiveStock;
        if (item.id) { // Item existed in the original sale
            effectiveStock = (product?.stock || 0) + (originalItem?.quantity || 0);
        } else { // Item is newly added to this edit session
            effectiveStock = product?.stock || 0;
        }


        if (newQuantity < 1) return { ...item, quantity: 1, total_price: item.price * 1 };
        if (newQuantity > effectiveStock ) {
           toast({title: "Stock limit", description: `Cannot exceed available stock (${effectiveStock}) for ${item.name}`, variant: "destructive"})
           return { ...item, quantity: effectiveStock, total_price: item.price * effectiveStock };
        }
        return { ...item, quantity: newQuantity, total_price: item.price * newQuantity };
      }
      return item;
    }));
  };

  const handleRemoveItem = (itemIdToRemove) => {
    setSaleItems(prevItems => prevItems.filter(item => (item.id || item.product_id) !== itemIdToRemove));
  };

  return (
    <fieldset className="border p-4 rounded-md">
      <legend className="text-lg font-semibold px-1">Sale Items</legend>
      <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar pr-2">
        {saleItems.map((item, index) => (
          <div key={item.id || `new-${item.product_id}`} className={`p-3 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 ${settings.darkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
            <div className="flex-grow">
              <p className="font-medium">{item.name} <span className="text-xs text-gray-500">(Ref: {item.reference_number})</span></p>
              <p className="text-xs">Price: {settings.currency.symbol}{(item.price || 0).toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor={`quantity-${index}`} className="sr-only">Quantity</Label>
              <Input
                id={`quantity-${index}`}
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => handleItemQuantityChange(item.id || item.product_id, e.target.value)}
                className="w-20"
              />
              <Button type="button" variant="destructive" size="icon" onClick={() => handleRemoveItem(item.id || item.product_id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
      <Button type="button" variant="outline" className="mt-3 w-full" onClick={onOpenProductSearch}>
        <PlusCircle className="w-4 h-4 mr-2" /> Add Item
      </Button>
    </fieldset>
  );
};

export default SaleItemsManager;
