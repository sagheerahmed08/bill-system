
import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Invoice from '@/components/Invoice';
import { useReactToPrint } from 'react-to-print';
import { useShopSettings } from '@/contexts/ShopSettingsContext';
import CustomerInfoCard from '@/components/customer_detail/CustomerInfoCard';
import CustomerEditModal from '@/components/customer_detail/CustomerEditModal';
import PurchaseHistory from '@/components/customer_detail/PurchaseHistory';

const CustomerDetail = () => {
  const { customerId } = useParams();
  const [customer, setCustomer] = useState(null);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoiceData, setSelectedInvoiceData] = useState(null);
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const { toast } = useToast();
  const { settings } = useShopSettings();
  const navigate = useNavigate();
  const invoiceRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => invoiceRef.current,
    onAfterPrint: () => setSelectedInvoiceData(null),
  });
  
  const fetchCustomerData = async () => {
    setLoading(true);
    try {
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single();

      if (customerError) {
        if (customerError.code === 'PGRST116') {
          toast({ title: 'Not Found', description: 'Customer not found.', variant: 'destructive' });
          setCustomer(null);
        } else {
          throw customerError;
        }
      } else {
        setCustomer(customerData);
      }

      if (customerData) {
        const { data: salesData, error: salesError } = await supabase
          .from('sales')
          .select(`
            *,
            sale_items (
              *,
              product:products (name, reference_number, price)
            )
          `)
          .eq('customer_id', customerId)
          .order('created_at', { ascending: false });
        if (salesError) throw salesError;
        setSales(salesData);
      }

    } catch (error) {
      console.error('Error fetching customer details:', error);
      toast({ title: 'Error', description: 'Could not fetch customer data.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerData();
  }, [customerId, toast]);

  const prepareAndPrintInvoice = (sale) => {
    if (!customer) return; 
    const invoiceItems = sale.sale_items.map(item => ({
      id: item.product?.id, 
      name: item.product?.name || 'N/A',
      reference_number: item.product?.reference_number || 'N/A',
      price: item.unit_price,
      quantity: item.quantity,
    }));

    const subtotal = invoiceItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxAmount = sale.tax_amount; 
    const totalAmount = sale.total_amount; 

    setSelectedInvoiceData({
      customerInfo: { name: customer.name, phone: customer.phone, paymentMethod: sale.payment_method, email: customer.email },
      items: invoiceItems,
      subtotal,
      tax: taxAmount,
      total: totalAmount,
      invoiceNumber: sale.invoice_number,
      date: new Date(sale.created_at).toLocaleDateString(),
    });
  };
  
  useEffect(() => {
    if (selectedInvoiceData) {
      handlePrint();
    }
  }, [selectedInvoiceData, handlePrint]);

  const handleSaveCustomerDetails = async (id, updatedData) => {
    try {
      const { error } = await supabase
        .from('customers')
        .update({ name: updatedData.name, phone: updatedData.phone, email: updatedData.email, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      toast({ title: "Success", description: "Customer details updated successfully." });
      fetchCustomerData(); 
    } catch (error) {
      toast({ title: "Error", description: "Failed to update customer details. " + error.message, variant: "destructive" });
    }
  };


  if (loading) {
    return <div className="text-center py-10">Loading customer details...</div>;
  }

  if (!customer) {
    return <div className="text-center py-10">Customer not found.</div>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex justify-between items-center">
        <Link to="/customers" className="flex items-center text-primary hover:underline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Customers
        </Link>
      </div>

      {isEditingCustomer && customer && (
        <CustomerEditModal 
          customer={customer} 
          onSave={handleSaveCustomerDetails}
          onClose={() => setIsEditingCustomer(false)} 
        />
      )}

      <CustomerInfoCard 
        customer={customer} 
        settings={settings} 
        onEdit={() => setIsEditingCustomer(true)} 
      />

      <PurchaseHistory 
        sales={sales} 
        settings={settings} 
        onPrintInvoice={prepareAndPrintInvoice} 
        onEditSale={(saleId) => navigate(`/sales/edit/${saleId}`)}
        onViewInvoice={(invoiceNumber) => navigate(`/sales/invoice/${invoiceNumber}`)}
      />
      
      {selectedInvoiceData && (
        <div style={{ display: 'none' }}>
          <Invoice ref={invoiceRef} {...selectedInvoiceData} />
        </div>
      )}
    </motion.div>
  );
};

export default CustomerDetail;
