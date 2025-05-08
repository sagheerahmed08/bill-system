
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

const ProductForm = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    stock: '',
    reference_number: '',
  });
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from('product_categories').select('name').order('name');
      if (error) {
        console.error('Error fetching categories:', error);
        toast({ title: 'Error', description: 'Could not fetch product categories.', variant: 'destructive' });
      } else {
        setCategories(data.map(c => c.name));
      }
    };
    fetchCategories();
  }, [toast]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        price: initialData.price || '',
        category: initialData.category || '',
        stock: initialData.stock || '',
        reference_number: initialData.reference_number || '',
      });
    } else {
      setFormData({
        name: '',
        price: '',
        category: '',
        stock: '',
        reference_number: '',
      });
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.category) {
        toast({ title: 'Category Required', description: 'Please select or add a product category.', variant: 'destructive'});
        return;
    }
    onSubmit({
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddNewCategory = async () => {
    if (!newCategory.trim()) {
      toast({ title: 'Error', description: 'Category name cannot be empty.', variant: 'destructive' });
      return;
    }
    const { data, error } = await supabase
      .from('product_categories')
      .insert({ name: newCategory.trim() })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique violation
        toast({ title: 'Category Exists', description: `Category "${newCategory.trim()}" already exists.`, variant: 'destructive' });
      } else {
        console.error('Error adding category:', error);
        toast({ title: 'Error', description: 'Could not add new category.', variant: 'destructive' });
      }
    } else if (data) {
      setCategories(prev => [...prev, data.name].sort());
      setFormData(prev => ({ ...prev, category: data.name }));
      setNewCategory('');
      setShowNewCategoryInput(false);
      toast({ title: 'Success', description: `Category "${data.name}" added.` });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md relative max-h-[90vh] overflow-y-auto custom-scrollbar"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            </button>

            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
              {initialData ? 'Edit Product' : 'Add New Product'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Reference Number</label>
                <Input
                  type="text"
                  name="reference_number"
                  value={formData.reference_number}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                  placeholder="e.g., REF-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Product Name</label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Price</label>
                <Input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Category</label>
                <div className="flex items-center space-x-2">
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white flex-grow"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <Button type="button" variant="outline" size="icon" onClick={() => setShowNewCategoryInput(prev => !prev)}>
                    <PlusCircle className="h-5 w-5" />
                  </Button>
                </div>
                {showNewCategoryInput && (
                  <div className="mt-2 flex items-center space-x-2">
                    <Input
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder="New category name"
                      className="flex-grow dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <Button type="button" onClick={handleAddNewCategory}>Add</Button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Stock</label>
                <Input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  min="0"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {initialData ? 'Update' : 'Add'} Product
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ProductForm;
