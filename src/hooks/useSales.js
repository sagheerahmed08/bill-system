
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

const DB_TABLES = {
  SALES: 'sales',
  CUSTOMERS: 'customers',
  SALE_ITEMS: 'sale_items',
  PRODUCTS: 'products',
};

const selectSaleDetails = `
  *,
  customers (name, phone, email),
  sale_items (
    *,
    products (name, reference_number)
  )
`;

const selectSaleDetailsWithProductStock = `
  *,
  customers (name, phone, email),
  sale_items (
    *,
    products (name, reference_number, price, stock)
  )
`;

const handleSupabaseError = (error, toast, context) => {
  console.error(`Error ${context}:`, error);
  toast({ title: `Error ${context}`, description: error.message, variant: 'destructive' });
};

const upsertCustomer = async (saleData) => {
  let customerId;
  const { data: existingCustomers, error: customerFetchError } = await supabase
    .from(DB_TABLES.CUSTOMERS)
    .select('id, name, email')
    .eq('phone', saleData.customer_phone);

  if (customerFetchError) throw customerFetchError;

  if (existingCustomers && existingCustomers.length > 0) {
    customerId = existingCustomers[0].id;
    const customerUpdates = {};
    if (saleData.customer_name !== existingCustomers[0].name) {
      customerUpdates.name = saleData.customer_name;
    }
    if (saleData.customer_email && saleData.customer_email !== existingCustomers[0].email) {
      customerUpdates.email = saleData.customer_email;
    }
    if (Object.keys(customerUpdates).length > 0) {
      customerUpdates.updated_at = new Date().toISOString();
      const { error: updateCustomerError } = await supabase
        .from(DB_TABLES.CUSTOMERS)
        .update(customerUpdates)
        .eq('id', customerId);
      if (updateCustomerError) console.error("Error updating customer:", updateCustomerError);
    }
  } else {
    const { data: newCustomer, error: newCustomerError } = await supabase
      .from(DB_TABLES.CUSTOMERS)
      .insert({
        name: saleData.customer_name,
        phone: saleData.customer_phone,
        email: saleData.customer_email
      })
      .select('id')
      .single();
    if (newCustomerError) throw newCustomerError;
    customerId = newCustomer.id;
  }
  return customerId;
};

const insertSaleRecord = async (saleData, customerId) => {
  const saleRecord = {
    invoice_number: saleData.invoiceNumber,
    customer_name: saleData.customer_name,
    customer_phone: saleData.customer_phone,
    customer_email: saleData.customer_email,
    total_amount: saleData.totalAmount,
    tax_amount: saleData.taxAmount,
    payment_method: saleData.paymentMethod,
    customer_id: customerId,
    created_at: saleData.saleDate ? new Date(saleData.saleDate).toISOString() : new Date().toISOString(),
  };

  const { data: newSale, error: saleError } = await supabase
    .from(DB_TABLES.SALES)
    .insert(saleRecord)
    .select('id, invoice_number')
    .single();
  
  if (saleError) throw saleError;
  return newSale;
};

const insertSaleItemsAndDecrementStock = async (saleId, cartItems) => {
  const saleItemsData = cartItems.map(item => ({
    sale_id: saleId,
    product_id: item.id,
    quantity: item.quantity,
    unit_price: item.price,
    total_price: item.price * item.quantity,
  }));

  const { error: itemsError } = await supabase.from(DB_TABLES.SALE_ITEMS).insert(saleItemsData);
  if (itemsError) throw itemsError;

  for (const item of cartItems) {
    const { error: stockError } = await supabase.rpc('decrement_product_stock', {
      p_id: item.id,
      p_quantity: item.quantity
    });
    if (stockError) console.error(`Error updating stock for product ${item.id}:`, stockError);
  }
  return saleItemsData;
};


const manageSaleItemChanges = async (saleId, updatedSaleItems, originalSaleItems) => {
    const itemsToDelete = originalSaleItems.filter(origItem => 
      origItem.id && !updatedSaleItems.find(updItem => updItem.id === origItem.id)
    );
    for (const item of itemsToDelete) {
      await supabase.from(DB_TABLES.SALE_ITEMS).delete().eq('id', item.id);
    }
  
    for (const item of updatedSaleItems) {
      const originalItem = originalSaleItems.find(orig => orig.id === item.id);
      if (item.id && originalItem) { 
        if (item.quantity !== originalItem.quantity || item.unit_price !== originalItem.unit_price) {
          await supabase.from(DB_TABLES.SALE_ITEMS).update({
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.quantity * item.unit_price
          }).eq('id', item.id);
        }
      } else if (!item.id) { 
         await supabase.rpc('add_item_to_existing_sale', {
           p_sale_id: saleId,
           p_product_id: item.product_id,
           p_quantity: item.quantity,
           p_unit_price: item.price 
         });
      }
    }
  };

export const useSales = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchSales = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      let query = supabase
        .from(DB_TABLES.SALES)
        .select(selectSaleDetails)
        .order('created_at', { ascending: false });

      if (filters.customerId) query = query.eq('customer_id', filters.customerId);
      if (filters.invoiceNumber) query = query.ilike('invoice_number', `%${filters.invoiceNumber}%`);
      
      const { data, error } = await query;
      if (error) throw error;
      setSales(data || []);
    } catch (error) {
      handleSupabaseError(error, toast, 'fetching sales');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createSale = async (saleData, cartItems) => {
    setLoading(true);
    try {
      const customerId = await upsertCustomer(saleData);
      const newSale = await insertSaleRecord(saleData, customerId);
      const saleItemsData = await insertSaleItemsAndDecrementStock(newSale.id, cartItems);
      
      fetchSales();
      return { ...newSale, sale_items: saleItemsData };
    } catch (error) {
      handleSupabaseError(error, toast, 'creating sale');
      throw error; 
    } finally {
      setLoading(false);
    }
  };
  
  const getSaleByInvoiceNumber = useCallback(async (invoiceNumber) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from(DB_TABLES.SALES)
        .select(selectSaleDetailsWithProductStock)
        .eq('invoice_number', invoiceNumber)
        .maybeSingle();
      if (error) throw error;
      return data;
    } catch (error) {
      handleSupabaseError(error, toast, `fetching sale #${invoiceNumber}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);
  
  const updateSale = async (saleId, updatedSaleData, updatedSaleItems, originalSaleItems) => {
    setLoading(true);
    try {
      const customerIdToUpdate = await upsertCustomer({
        customer_name: updatedSaleData.customer_name,
        customer_phone: updatedSaleData.customer_phone,
        customer_email: updatedSaleData.customer_email,
      });
      
      const saleUpdatePayload = {
        ...updatedSaleData,
        customer_id: customerIdToUpdate,
        created_at: new Date(updatedSaleData.created_at).toISOString(),
      };
      delete saleUpdatePayload.customer_name;
      delete saleUpdatePayload.customer_phone;
      delete saleUpdatePayload.customer_email;


      const { error: saleUpdateError } = await supabase
        .from(DB_TABLES.SALES)
        .update(saleUpdatePayload)
        .eq('id', saleId);
      if (saleUpdateError) throw saleUpdateError;

      await manageSaleItemChanges(saleId, updatedSaleItems, originalSaleItems);
      
      toast({ title: 'Sale Updated', description: 'The sale has been successfully updated.' });
      fetchSales();
    } catch (error) {
      handleSupabaseError(error, toast, 'updating sale');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  return { sales, loading, createSale, fetchSales, getSaleByInvoiceNumber, updateSale };
};
