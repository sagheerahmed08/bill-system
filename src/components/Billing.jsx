
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ShoppingCart, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useShopSettings } from '@/contexts/ShopSettingsContext';
import { useReactToPrint } from 'react-to-print';
import Invoice from '@/components/Invoice';
import { useSales } from '@/hooks/useSales';
import { useProducts } from '@/hooks/useProducts';
import ProductSearch from '@/components/billing/ProductSearch';
import ProductList from '@/components/billing/ProductList';
import CartDisplay from '@/components/billing/CartDisplay';
import CustomerForm from '@/components/billing/CustomerForm';
import BillSummary from '@/components/billing/BillSummary';
import { supabase } from '@/lib/supabase';
import { loadRazorpayScript } from '@/utils/razorpay';

const Billing = () => {
  const { products, fetchProducts } = useProducts();
  const { toast } = useToast();
  const { settings } = useShopSettings();
  const { createSale } = useSales();
  
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', email: '', paymentMethod: 'CASH' });
  const [invoiceData, setInvoiceData] = useState(null);
  const [isCheckingCustomer, setIsCheckingCustomer] = useState(false);

  const invoiceRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => invoiceRef.current,
  });

  const filteredProducts = products.filter(product => {
    const searchLower = searchQuery.toLowerCase();
    return (
      product.name.toLowerCase().includes(searchLower) ||
      (product.reference_number && product.reference_number.toLowerCase().includes(searchLower))
    );
  });

  const addToCart = (product) => {
    if (product.stock === 0) {
      toast({ title: "Out of Stock", description: "This product is currently out of stock.", variant: "destructive" });
      return;
    }
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        toast({ title: "Stock Limit Reached", description: "Cannot add more items than available in stock.", variant: "destructive" });
        return;
      }
      setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    const productDetails = products.find(p => p.id === productId);
    if (!productDetails) return; 
    if (newQuantity > productDetails.stock) {
      toast({ title: "Stock Limit Reached", description: `Cannot add more than ${productDetails.stock} items.`, variant: "destructive" });
      setCart(cart.map(item => item.id === productId ? { ...item, quantity: productDetails.stock } : item));
      return;
    }
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    setCart(cart.map(item => item.id === productId ? { ...item, quantity: newQuantity } : item));
  };

  const calculateSubtotal = useCallback(() => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cart]);

  const calculateTax = useCallback((subtotal) => {
    return subtotal * settings.taxRate;
  }, [settings.taxRate]);

  const calculateTotal = useCallback(() => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax(subtotal);
    return subtotal + tax;
  }, [calculateSubtotal, calculateTax]);

  const handleCustomerInfoChange = (e) => {
    setCustomerInfo({ ...customerInfo, [e.target.name]: e.target.value });
  };
  
  const checkAndFillCustomer = useCallback(async (phone) => {
    if (phone && phone.length >= 7) { 
      setIsCheckingCustomer(true);
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('name, email')
          .eq('phone', phone)
          .limit(1); 
        
        if (error) {
          console.error("Error checking customer (non-PGRST116):", error.message);
        } else if (data && data.length > 0) {
          setCustomerInfo(prev => ({ ...prev, name: data[0].name, email: data[0].email || '' }));
          toast({ title: "Customer Found", description: `Filled details for ${data[0].name}.` });
        }
      } catch (error) {
        console.error("Catch block: Error checking customer:", error.message);
      } finally {
        setIsCheckingCustomer(false);
      }
    }
  }, [toast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (customerInfo.phone) {
        checkAndFillCustomer(customerInfo.phone);
      }
    }, 1000); 
    return () => clearTimeout(timer);
  }, [customerInfo.phone, checkAndFillCustomer]);


  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast({ title: "Empty Cart", description: "Please add items to the cart before checkout.", variant: "destructive" });
      return;
    }
    if (!customerInfo.name || !customerInfo.phone) {
      toast({ title: "Customer Info Missing", description: "Please enter customer name and phone number.", variant: "destructive" });
      return;
    }

    const subtotal = calculateSubtotal();
    const taxAmount = calculateTax(subtotal);
    const totalAmount = subtotal + taxAmount;
    const invoiceNumber = `INV-${Date.now()}`;
    const saleDate = new Date().toLocaleDateString();

    const saleDataForDB = {
      invoiceNumber,
      customer_name: customerInfo.name, 
      customer_phone: customerInfo.phone, 
      customer_email: customerInfo.email,
      totalAmount,
      taxAmount,
      paymentMethod: customerInfo.paymentMethod,
      saleDate: new Date(), 
    };

    try {
      const newSale = await createSale(saleDataForDB, cart);
      await fetchProducts(); 
      
      setInvoiceData({
        customerInfo,
        items: cart,
        subtotal,
        tax: taxAmount,
        total: totalAmount,
        invoiceNumber: newSale.invoice_number || invoiceNumber,
        date: saleDate,
      });
      toast({ title: "Sale Complete", description: `Invoice ${newSale.invoice_number || invoiceNumber} has been generated.` });
    } catch (error) {
      console.error("Checkout error details:", error);
      toast({ title: "Error Processing Sale", description: error.message || "An unexpected error occurred.", variant: "destructive" });
    }
  };
  
  const handleRazorpayPayment = async () => {
    if (cart.length === 0 || !customerInfo.name || !customerInfo.phone) {
      toast({ title: "Missing Info", description: "Add items and customer details first.", variant: "destructive" });
      return;
    }
  
    const subtotal = calculateSubtotal();
    const taxAmount = calculateTax(subtotal);
    const totalAmount = subtotal + taxAmount;
    const invoiceNumber = `INV-${Date.now()}`;
    const saleDate = new Date().toLocaleDateString();
  
    const res = await loadRazorpayScript();
    if (!res) {
      toast({ title: "Razorpay SDK Error", description: "Failed to load Razorpay script.", variant: "destructive" });
      return;
    }
  
    const rzp = new window.Razorpay({
      key: "rzp_test_56ZvanY5WuU84v", // Replace with your real key for production
      amount: totalAmount * 100, // in paise
      currency: "INR",
      name: settings.shopName || "Fashion Hub",
      description: "Billing Payment",
      handler: async (response) => {
        try {
          const saleDataForDB = {
            invoiceNumber,
            customer_name: customerInfo.name,
            customer_phone: customerInfo.phone,
            customer_email: customerInfo.email,
            totalAmount,
            taxAmount,
            paymentMethod: 'RAZORPAY',
            saleDate: new Date(),
          };
  
          const newSale = await createSale(saleDataForDB, cart);
          await fetchProducts();
  
          setInvoiceData({
            customerInfo,
            items: cart,
            subtotal,
            tax: taxAmount,
            total: totalAmount,
            invoiceNumber: newSale.invoice_number || invoiceNumber,
            date: saleDate,
          });
  
          toast({ title: "Payment Successful", description: `Invoice ${invoiceNumber} saved.` });
        } catch (err) {
          console.error("Sale Save Failed", err);
          toast({ title: "Error", description: "Payment succeeded but saving sale failed.", variant: "destructive" });
        }
      },
      prefill: {
        name: customerInfo.name,
        email: customerInfo.email,
        contact: customerInfo.phone,
      },
      theme: {
        color: "#3399cc",
      },
    });
  
    rzp.open();
  };
  
  const handlePrintAndClear = () => {
    if (invoiceData) {
      handlePrint(); 
      setCart([]);
      setCustomerInfo({ name: '', phone: '', email: '', paymentMethod: 'CASH' });
      setInvoiceData(null);
      setSearchQuery(''); 
    } else {
      toast({ title: "No Invoice", description: "Please complete a sale first to generate an invoice.", variant: "destructive" });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <ProductSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <ProductList 
          products={filteredProducts} 
          addToCart={addToCart} 
          settings={settings} 
        />
      </div>

      <div className={`${settings.darkMode ? 'neumorphism-dark' : 'neumorphism'} rounded-xl p-6 space-y-6 flex flex-col`}>
        <h2 className="text-2xl font-bold">Current Bill</h2>
        <div className="flex-grow overflow-y-auto custom-scrollbar pr-2">
          <CustomerForm 
            customerInfo={customerInfo} 
            handleCustomerInfoChange={handleCustomerInfoChange} 
            isCheckingCustomer={isCheckingCustomer}
            darkMode={settings.darkMode}
          />
          
          {cart.length === 0 ? (
            <div className={`text-center py-8 mt-4 ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <ShoppingCart className="w-12 h-12 mx-auto mb-4" />
              <p>No items in cart</p>
            </div>
          ) : (
            <div className="mt-6">
              <CartDisplay 
                cart={cart} 
                updateQuantity={updateQuantity} 
                settings={settings} 
              />
            </div>
          )}
        </div>
        
        {cart.length > 0 && (
          <div className="mt-auto border-t pt-4">
            <BillSummary 
              subtotal={calculateSubtotal()} 
              tax={calculateTax(calculateSubtotal())} 
              total={calculateTotal()} 
              settings={settings} 
            />
            <Button
              className="w-full mt-4"
              onClick={handleCheckout}
              disabled={invoiceData !== null || isCheckingCustomer}
            >
              Complete Sale
            </Button>

            <Button
              className="w-full mt-2"
              variant="secondary"
              onClick={handleRazorpayPayment}
              disabled={invoiceData !== null || isCheckingCustomer}
            >
              Pay with Razorpay
            </Button>

            {invoiceData && (
               <Button
                className="w-full mt-2 flex items-center"
                variant="outline"
                onClick={handlePrintAndClear}
              >
                <Printer className="w-4 h-4 mr-2" /> Print Invoice & New Sale
              </Button>
            )}
          </div>
        )}
      </div>
      {invoiceData && (
        <div style={{ display: 'none' }}>
          <Invoice ref={invoiceRef} {...invoiceData} />
        </div>
      )}
    </div>
  );
};

export default Billing;
