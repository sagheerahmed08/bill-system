
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const ProductList = ({ products, addToCart, settings }) => {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto pr-2 ${settings.darkMode ? 'custom-scrollbar-dark' : 'custom-scrollbar'}`}>
      {products.map(product => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${settings.darkMode ? 'neumorphism-dark' : 'neumorphism'} rounded-xl p-4`}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold">{product.name}</h3>
              <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Ref: {product.reference_number}</p>
              <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{product.category}</p>
              <p className="text-lg font-bold mt-2">{settings.currency.symbol}{product.price.toFixed(2)}</p>
            </div>
            <Button
              size="sm"
              onClick={() => addToCart(product)}
              disabled={product.stock === 0}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm mt-2">
            Stock: {product.stock} {product.stock < 10 && <span className="text-red-500">- Low Stock</span>}
          </p>
        </motion.div>
      ))}
      {products.length === 0 && <p className={`${settings.darkMode ? 'text-gray-400' : 'text-gray-500'} col-span-full text-center py-4`}>No products found.</p>}
    </div>
  );
};

export default ProductList;
