
import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';

const LowStockAlerts = ({ lowStockItems, settings }) => {
  return (
    <div>
      {lowStockItems.length > 0 ? (
        <div className="space-y-3 max-h-72 overflow-y-auto custom-scrollbar pr-2">
          {lowStockItems.map(product => (
            <div
              key={product.id}
              className={`flex items-center justify-between p-4 rounded-lg shadow-sm transition-all duration-300 ease-in-out 
                          ${settings.darkMode 
                            ? 'bg-red-900/40 hover:bg-red-900/70 hover:shadow-red-700/30' 
                            : 'bg-red-100/60 hover:bg-red-100 hover:shadow-red-300/50'}`}
            >
              <div>
                <p className={`font-medium text-sm ${settings.darkMode ? 'text-red-300' : 'text-red-700'}`}>{product.name}</p>
                <p className={`text-xs ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Ref: {product.reference_number} | Stock: <span className="font-bold">{product.stock}</span>
                </p>
              </div>
              <Link to={`/products?edit=${product.id}`} 
                    className={`text-xs font-medium px-3 py-1.5 rounded-md flex items-center transition-colors duration-200 
                                ${settings.darkMode 
                                  ? 'bg-red-400/20 text-red-300 hover:bg-red-400/50 hover:text-red-200' 
                                  : 'bg-red-200 text-red-600 hover:bg-red-300 hover:text-red-700'}`}>
                Update Stock <ExternalLink className="w-3 h-3 ml-1.5" />
              </Link>
            </div>
          ))}
        </div>
      ) : <p className={`${settings.darkMode ? 'text-gray-400' : 'text-gray-500'} py-4`}>No items with low stock. Well done!</p>}
    </div>
  );
};

export default LowStockAlerts;
