
import React from 'react';
import { motion } from 'framer-motion';
import { Hash, Calendar, Printer, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PurchaseHistoryItem = ({ sale, settings, onPrintInvoice, onEditSale, onViewInvoice }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`p-6 rounded-xl shadow ${settings.darkMode ? 'bg-gray-800 neumorphism-dark-inset' : 'bg-gray-50 neumorphism-inset'}`}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <Hash className={`w-5 h-5 ${settings.darkMode ? 'text-primary-foreground' : 'text-primary'}`} />
            <h3 className="text-lg font-semibold hover:underline cursor-pointer" onClick={() => onViewInvoice(sale.invoice_number)}>
              Invoice: {sale.invoice_number}
            </h3>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>{new Date(sale.created_at).toLocaleString()}</span>
          </div>
        </div>
        <div className="mt-3 sm:mt-0 flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => onEditSale(sale.id)}>
            <Edit className="w-4 h-4 mr-2" /> Edit Sale
          </Button>
          <Button variant="outline" size="sm" onClick={() => onPrintInvoice(sale)}>
            <Printer className="w-4 h-4 mr-2" /> Print
          </Button>
        </div>
      </div>
      
      <div className="mb-3">
        <h4 className="font-medium mb-1">Items Purchased:</h4>
        <ul className="list-disc list-inside pl-1 space-y-1 text-sm">
          {sale.sale_items.map(item => (
            <li key={item.id}>
              {item.product?.name || 'N/A'} (Ref: {item.product?.reference_number || 'N/A'}) - {item.quantity} x {settings.currency.symbol}{item.unit_price.toFixed(2)}
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t pt-3 mt-3 space-y-1 text-sm">
        <div className="flex justify-between"><span>Subtotal:</span> <span>{settings.currency.symbol}{(sale.total_amount - sale.tax_amount).toFixed(2)}</span></div>
        <div className="flex justify-between"><span>Tax:</span> <span>{settings.currency.symbol}{sale.tax_amount.toFixed(2)}</span></div>
        <div className="flex justify-between font-bold text-base"><span>Total:</span> <span>{settings.currency.symbol}{sale.total_amount.toFixed(2)}</span></div>
        <div className="flex justify-between"><span>Payment Method:</span> <span>{sale.payment_method}</span></div>
      </div>
    </motion.div>
  );
};


const PurchaseHistory = ({ sales, settings, onPrintInvoice, onEditSale, onViewInvoice }) => {
  if (sales.length === 0) {
    return <p className="text-gray-500 dark:text-gray-400">This customer has no purchases yet.</p>;
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Purchase History</h2>
      <div className="space-y-6">
        {sales.map(sale => (
          <PurchaseHistoryItem 
            key={sale.id}
            sale={sale}
            settings={settings}
            onPrintInvoice={onPrintInvoice}
            onEditSale={onEditSale}
            onViewInvoice={onViewInvoice}
          />
        ))}
      </div>
    </div>
  );
};

export default PurchaseHistory;
