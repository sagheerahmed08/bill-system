
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProducts(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);


  useEffect(() => {
    fetchProducts();
    
    const channel = supabase
      .channel('products_channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'products'
      }, (payload) => {
        fetchProducts(); 
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchProducts]);


  const addProduct = async (productData) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add product",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateProduct = async (updatedProduct) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updatedProduct)
        .eq('id', updatedProduct.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteProduct = async (productId) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    products,
    loading,
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
  };
};
