
import React from 'react';

const SoldItemsReport = ({ soldItems, loadingSoldItems, totalSalesValue, salesFilterLabel, settings }) => {
  return (
    <div>
      <div className={`mb-3 text-lg font-semibold ${settings.darkMode ? 'text-gray-200': 'text-gray-700'}`}>
        Total Sales Value ({salesFilterLabel}): {settings.currency.symbol}{totalSalesValue.toFixed(2)}
      </div>
      {loadingSoldItems ? <p className="py-4">Loading sold items...</p> : 
        soldItems.length > 0 ? (
          <div className="space-y-3 max-h-72 overflow-y-auto custom-scrollbar pr-2">
            {soldItems.map((item, index) => (
              <div key={index} 
                   className={`flex items-center justify-between p-4 rounded-lg shadow-sm transition-all duration-300 ease-in-out 
                               ${settings.darkMode 
                                 ? 'bg-green-900/40 hover:bg-green-900/70 hover:shadow-green-700/30' 
                                 : 'bg-green-100/60 hover:bg-green-100 hover:shadow-green-300/50'}`}>
                <div>
                  <p className={`font-medium text-sm ${settings.darkMode ? 'text-green-300' : 'text-green-700'}`}>{item.name}</p>
                  <p className={`text-xs ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Ref: {item.ref}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${settings.darkMode ? 'text-green-400' : 'text-green-600'}`}>Qty: {item.quantity}</p>
                  <p className={`text-xs ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Value: {settings.currency.symbol}{item.totalValue.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : <p className={`${settings.darkMode ? 'text-gray-400' : 'text-gray-500'} py-4`}>No items sold in this period.</p>
      }
    </div>
  );
};

export default SoldItemsReport;
