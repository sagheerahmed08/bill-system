
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProducts } from '@/hooks/useProducts';
import ProductForm from '@/components/ProductForm';
import { useToast } from '@/components/ui/use-toast';
import { useShopSettings } from '@/contexts/ShopSettingsContext';

const Products = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const { toast } = useToast();
  const { settings } = useShopSettings();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const handleSubmit = (productData) => {
    try {
      if (editingProduct) {
        updateProduct({ ...productData, id: editingProduct.id });
        toast({
          title: "Product Updated",
          description: "Product has been successfully updated.",
        });
      } else {
        addProduct(productData);
        toast({
          title: "Product Added",
          description: "New product has been successfully added.",
        });
      }
      setIsFormOpen(false);
      setEditingProduct(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error processing your request.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleDelete = (productId) => {
    try {
      deleteProduct(productId);
      toast({
        title: "Product Deleted",
        description: "Product has been successfully removed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error deleting the product.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-gray-500 mt-2">Manage your product inventory</p>
        </div>
        <Button
          onClick={() => {
            setEditingProduct(null);
            setIsFormOpen(true);
          }}
          className="flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {products.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="neumorphism rounded-xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">{product.name}</h3>
                  <p className="text-sm text-gray-500">Ref: {product.reference_number}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-gray-500" />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="p-2 hover:bg-red-100 rounded-full transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-2xl font-bold">{settings.currency.symbol}{product.price.toFixed(2)}</p>
                <p className="text-sm text-gray-500">Category: {product.category}</p>
                <div className="flex items-center justify-between">
                  <p className="text-sm">Stock: {product.stock}</p>
                  {product.stock < 10 && (
                    <span className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded-full">
                      Low Stock
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <ProductForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={handleSubmit}
        initialData={editingProduct}
      />
    </div>
  );
};

export default Products;
