
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';

import { useToast } from '@/components/ui/use-toast';
import { useShopSettings } from '@/contexts/ShopSettingsContext';
import { useProducts } from '@/hooks/useProducts';
import { useSales } from '@/hooks/useSales';

import CustomerDetailsForm from '@/components/edit_sale/CustomerDetailsForm';
import SaleItemsManager from '@/components/edit_sale/SaleItemsManager';
import PaymentAndDateForm from '@/components/edit_sale/PaymentAndDateForm';
import SaleTotalsDisplay from '@/components/edit_sale/SaleTotalsDisplay';
import ProductSearchModal from '@/components/billing/ProductSearchModal';

import { Button } from '@/components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';


const EditSale = () => {
  const { saleId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { settings } = useShopSettings();
  const { products: allProducts, fetchProducts: fetchProductsHook } = useProducts();
  const { updateSale, loading: salesLoading } = useSales();

  const [saleData, setSaleData] = useState(null);
  const [customerDetails, setCustomerDetails] = useState({ name: '', phone: '', email: '' });
  const [saleItems, setSaleItems] = useState([]);
  const [originalSaleItems, setOriginalSaleItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [saleDate, setSaleDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [isProductSearchModalOpen, setIsProductSearchModalOpen] = useState(false);

  const fetchSaleDetails = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          customers (name, phone, email),
          sale_items (
            *,
            products (id, name, reference_number, price, stock)
          )
        `)
        .eq('id', saleId)
        .single();

      if (error) throw error;
      if (!data) {
        toast({ title: 'Error', description: 'Sale not found.', variant: 'destructive' });
        navigate('/customers');
        return;
      }
      
      setSaleData(data);
      setCustomerDetails({
        name: data.customers?.name || data.customer_name || '',
        phone: data.customers?.phone || data.customer_phone || '',
        email: data.customers?.email || data.customer_email || '',
      });
      
      const items = data.sale_items.map(item => ({
        ...item,
        product_id: item.products.id,
        name: item.products.name,
        reference_number: item.products.reference_number,
        price: item.unit_price,
        current_stock: item.products.stock,
      }));
      setSaleItems(items);
      setOriginalSaleItems(JSON.parse(JSON.stringify(items)));
      setPaymentMethod(data.payment_method);
      setSaleDate(new Date(data.created_at).toISOString().slice(0, 16));

    } catch (error) {
      console.error('Error fetching sale details:', error);
      toast({ title: 'Error', description: `Could not fetch sale details. ${error.message}`, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [saleId, toast, navigate]);

  useEffect(() => {
    fetchSaleDetails();
    if (typeof fetchProductsHook === 'function') {
        fetchProductsHook();
    } else {
        console.error("fetchProductsHook is not a function", fetchProductsHook)
    }
  }, [fetchSaleDetails, fetchProductsHook]);


  const handleCustomerChange = (e) => {
    setCustomerDetails({ ...customerDetails, [e.target.name]: e.target.value });
  };
  
  const subtotal = saleItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const taxAmount = subtotal * settings.taxRate;
  const totalAmount = subtotal + taxAmount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerDetails.name || !customerDetails.phone) {
      toast({ title: "Validation Error", description: "Customer name and phone are required.", variant: "destructive" });
      return;
    }
    if (saleItems.length === 0) {
      toast({ title: "Validation Error", description: "Sale must have at least one item.", variant: "destructive" });
      return;
    }

    const saleUpdatePayload = {
      customer_name: customerDetails.name,
      customer_phone: customerDetails.phone,
      customer_email: customerDetails.email,
      payment_method: paymentMethod,
      created_at: saleDate, 
      total_amount: totalAmount,
      tax_amount: taxAmount,
    };
    
    try {
      await updateSale(saleId, saleUpdatePayload, saleItems, originalSaleItems);
      toast({ title: 'Success', description: 'Sale updated successfully!' });
      if (typeof fetchProductsHook === 'function') {
        fetchProductsHook();
      }
      navigate(`/sales/invoice/${saleData.invoice_number}`);
    } catch (error) {
      toast({ title: 'Error', description: `Failed to update sale: ${error.message}`, variant: 'destructive' });
    }
  };

  if (loading) return <div className="text-center py-10">Loading sale details...</div>;
  if (!saleData) return <div className="text-center py-10">Sale not found.</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Edit Sale (Invoice: {saleData.invoice_number})</h1>
        <Button variant="outline" onClick={() => navigate(-1)}><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
      </div>

      <form onSubmit={handleSubmit} className={`p-6 rounded-xl space-y-6 ${settings.darkMode ? 'neumorphism-dark' : 'neumorphism'}`}>
        <CustomerDetailsForm
          customerDetails={customerDetails}
          onCustomerChange={handleCustomerChange}
        />

        <SaleItemsManager
          saleItems={saleItems}
          setSaleItems={setSaleItems}
          originalSaleItems={originalSaleItems}
          allProducts={allProducts}
          settings={settings}
          onOpenProductSearch={() => setIsProductSearchModalOpen(true)}
          toast={toast}
        />
        
        <ProductSearchModal
          isOpen={isProductSearchModalOpen}
          onClose={() => setIsProductSearchModalOpen(false)}
          products={allProducts}
          onProductSelect={(product) => {
            if (product.stock === 0) {
              toast({ title: "Out of Stock", description: `${product.name} is out of stock.`, variant: "destructive" });
              return;
            }
            setSaleItems(prevItems => {
              const existingItem = prevItems.find(item => item.product_id === product.id);
              if (existingItem) {
                 if (existingItem.quantity >= product.stock) {
                    toast({ title: "Stock limit", description: `Max stock for ${product.name} reached.`, variant: "destructive"})
                    return prevItems;
                }
                return prevItems.map(item =>
                  item.product_id === product.id
                    ? { ...item, quantity: item.quantity + 1, total_price: item.price * (item.quantity + 1) }
                    : item
                );
              } else {
                return [
                  ...prevItems,
                  {
                    product_id: product.id,
                    name: product.name,
                    reference_number: product.reference_number,
                    price: product.price, 
                    quantity: 1,
                    total_price: product.price * 1,
                    current_stock: product.stock
                  }
                ];
              }
            });
            setIsProductSearchModalOpen(false);
          }}
        />

        <PaymentAndDateForm
          paymentMethod={paymentMethod}
          onPaymentMethodChange={setPaymentMethod}
          saleDate={saleDate}
          onSaleDateChange={setSaleDate}
          darkMode={settings.darkMode}
        />
        
        <SaleTotalsDisplay
            subtotal={subtotal}
            taxAmount={taxAmount}
            totalAmount={totalAmount}
            settings={settings}
            taxRate={settings.taxRate}
        />


        <Button type="submit" className="w-full" disabled={salesLoading}>
          <Save className="w-4 h-4 mr-2" /> {salesLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </motion.div>
  );
};

export default EditSale;
