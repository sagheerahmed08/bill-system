
import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Hash, Calendar, User, Phone, Mail, ShoppingCart, Printer, ArrowLeft, Edit, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Invoice from '@/components/Invoice';
import { useReactToPrint } from 'react-to-print';
import { useShopSettings } from '@/contexts/ShopSettingsContext';
import { useSales } from '@/hooks/useSales';

const SaleDetail = () => {
  const { invoiceNumber } = useParams();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedInvoiceData, setSelectedInvoiceData] = useState(null);
  const { toast } = useToast();
  const { settings } = useShopSettings();
  const { getSaleByInvoiceNumber } = useSales();
  const navigate = useNavigate();
  const invoiceRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => invoiceRef.current,
    onAfterPrint: () => setSelectedInvoiceData(null),
  });

  useEffect(() => {
    const fetchSaleData = async () => {
      setLoading(true);
      if (!invoiceNumber) {
        toast({ title: 'Error', description: 'Invoice number is missing.', variant: 'destructive' });
        setLoading(false);
        return;
      }
      try {
        const saleData = await getSaleByInvoiceNumber(invoiceNumber);
        if (!saleData) {
          toast({ title: 'Not Found', description: `Sale with invoice #${invoiceNumber} not found.`, variant: 'destructive' });
          setSale(null);
        } else {
          setSale(saleData);
        }
      } catch (error) {
        console.error('Error fetching sale details:', error);
        toast({ title: 'Error', description: 'Could not fetch sale data.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchSaleData();
  }, [invoiceNumber, toast, getSaleByInvoiceNumber]);

  const prepareAndPrintInvoice = () => {
    if (!sale) return;
    const customer = sale.customers || {name: sale.customer_name, phone: sale.customer_phone, email: sale.customer_email};

    const invoiceItems = sale.sale_items.map(item => ({
      id: item.products?.id,
      name: item.products?.name || 'N/A',
      reference_number: item.products?.reference_number || 'N/A',
      price: item.unit_price,
      quantity: item.quantity,
    }));

    const subtotal = invoiceItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    setSelectedInvoiceData({
      customerInfo: { name: customer.name, phone: customer.phone, email: customer.email, paymentMethod: sale.payment_method },
      items: invoiceItems,
      subtotal,
      tax: sale.tax_amount,
      total: sale.total_amount,
      invoiceNumber: sale.invoice_number,
      date: new Date(sale.created_at).toLocaleDateString(),
    });
  };
  
  useEffect(() => {
    if (selectedInvoiceData) {
      handlePrint();
    }
  }, [selectedInvoiceData, handlePrint]);


  if (loading) {
    return <div className="text-center py-10">Loading sale details...</div>;
  }

  if (!sale) {
    return (
      <div className="text-center py-10">
        <p>Sale with invoice number "{invoiceNumber}" not found.</p>
        <Button onClick={() => navigate(-1)} className="mt-4">Go Back</Button>
      </div>
    );
  }
  
  const customer = sale.customers || {name: sale.customer_name, phone: sale.customer_phone, email: sale.customer_email};

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex justify-between items-center">
        <Button onClick={() => navigate(-1)} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <Button variant="outline" className="mr-2" onClick={() => navigate(`/sales/edit/${sale.id}`)}>
            <Edit className="w-4 h-4 mr-2" /> Edit Sale
          </Button>
          <Button onClick={prepareAndPrintInvoice}>
            <Printer className="w-4 h-4 mr-2" /> Print Invoice
          </Button>
        </div>
      </div>

      <div className={`p-8 rounded-xl shadow-lg ${settings.darkMode ? 'bg-gray-800 neumorphism-dark' : 'bg-white neumorphism'}`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center"><Hash className="w-7 h-7 mr-2 text-primary"/>Invoice: {sale.invoice_number}</h1>
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
              <Calendar className="w-4 h-4" />
              <span>{new Date(sale.created_at).toLocaleString()}</span>
            </div>
          </div>
          <div className={`text-lg font-semibold p-2 rounded ${settings.darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            Payment: {sale.payment_method}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold mb-2">Customer Details</h2>
            <p className="flex items-center"><User className="w-4 h-4 mr-2" /> Name: {customer.name}</p>
            <p className="flex items-center"><Phone className="w-4 h-4 mr-2" /> Phone: {customer.phone}</p>
            {customer.email && <p className="flex items-center"><Mail className="w-4 h-4 mr-2" /> Email: {customer.email}</p>}
          </div>
        </div>


        <div>
          <h2 className="text-xl font-semibold mb-3">Items Purchased</h2>
          <div className="space-y-3">
            {sale.sale_items.map(item => (
              <div key={item.id} className={`p-3 rounded-lg flex justify-between items-center ${settings.darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <div>
                  <p className="font-medium">{item.products?.name || 'N/A'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Ref: {item.products?.reference_number || 'N/A'}</p>
                </div>
                <div className="text-right">
                  <p>{item.quantity} x {settings.currency.symbol}{item.unit_price.toFixed(2)}</p>
                  <p className="font-medium">{settings.currency.symbol}{(item.quantity * item.unit_price).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t mt-6 pt-6 space-y-2">
          <div className="flex justify-between text-lg">
            <span>Subtotal:</span>
            <span>{settings.currency.symbol}{(sale.total_amount - sale.tax_amount).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg">
            <span>Tax ({((sale.tax_amount / (sale.total_amount - sale.tax_amount)) * 100 || 0 ).toFixed(0)}%):</span>
            <span>{settings.currency.symbol}{sale.tax_amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-2xl text-primary">
            <span>Total:</span>
            <span>{settings.currency.symbol}{sale.total_amount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {selectedInvoiceData && (
        <div style={{ display: 'none' }}>
          <Invoice ref={invoiceRef} {...selectedInvoiceData} />
        </div>
      )}
    </motion.div>
  );
};

export default SaleDetail;
