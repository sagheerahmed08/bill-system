
import React from 'react';
import { useShopSettings } from '@/contexts/ShopSettingsContext';

const Invoice = React.forwardRef(({ customerInfo, items, subtotal, tax, total, invoiceNumber, date }, ref) => {
  const { settings } = useShopSettings();

  return (
    <div ref={ref} className="p-8 bg-white text-black w-[80mm]">
      <style type="text/css" media="print">
        {`
          @page { size: 80mm auto; margin: 5mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .invoice-container {
            font-family: 'Arial', sans-serif;
            font-size: 10pt;
            line-height: 1.3;
          }
          .header, .footer { text-align: center; }
          .shop-name { font-size: 14pt; font-weight: bold; margin-bottom: 2px; }
          .details p, .custom-fields p { margin: 1px 0; font-size: 9pt; }
          .invoice-title { font-size: 12pt; font-weight: bold; margin: 8px 0; border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 4px 0;}
          .customer-info p { margin: 1px 0; }
          .items-table { width: 100%; border-collapse: collapse; margin: 8px 0; }
          .items-table th, .items-table td { text-align: left; padding: 2px 0; font-size: 9pt; }
          .items-table th:nth-child(2), .items-table td:nth-child(2),
          .items-table th:nth-child(3), .items-table td:nth-child(3),
          .items-table th:nth-child(4), .items-table td:nth-child(4) { text-align: right; }
          .items-table thead tr { border-bottom: 1px solid #000; }
          .summary-item { display: flex; justify-content: space-between; margin: 2px 0; }
          .total-line { font-weight: bold; font-size: 11pt; border-top: 1px solid #000; padding-top: 4px; margin-top: 4px; }
          .return-policy { font-size: 8pt; margin-top: 8px; }
        `}
      </style>
      <div className="invoice-container">
        <div className="header">
          <h1 className="shop-name">{settings.shopName}</h1>
          <div className="details">
            <p>{settings.address}</p>
            <p>Phone: {settings.phone}</p>
            {settings.email && <p>Email: {settings.email}</p>}
            {settings.gstNo && <p>GST No: {settings.gstNo}</p>}
          </div>
          {settings.customFields && Object.keys(settings.customFields).length > 0 && (
            <div className="custom-fields mt-1">
              {Object.entries(settings.customFields).map(([key, value]) => (
                <p key={key}>{key}: {value}</p>
              ))}
            </div>
          )}
        </div>

        <div className="invoice-title">
          Invoice #{invoiceNumber}
        </div>
        
        <div className="customer-info mb-2">
          <p><strong>Bill To:</strong> {customerInfo.name}</p>
          <p><strong>Phone:</strong> {customerInfo.phone}</p>
          <p><strong>Date:</strong> {date}</p>
          <p><strong>Payment:</strong> {customerInfo.paymentMethod}</p>
        </div>

        <table className="items-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Price</th>
              <th>Qty</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td>{item.name} <br/> <span style={{fontSize: '8pt'}}>Ref: {item.reference_number}</span></td>
                <td>{settings.currency.symbol}{item.price.toFixed(2)}</td>
                <td>{item.quantity}</td>
                <td>{settings.currency.symbol}{(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="summary">
          <div className="summary-item">
            <span>Subtotal:</span>
            <span>{settings.currency.symbol}{subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-item">
            <span>Tax ({(settings.taxRate * 100).toFixed(0)}%):</span>
            <span>{settings.currency.symbol}{tax.toFixed(2)}</span>
          </div>
          <div className="summary-item total-line">
            <span>Total:</span>
            <span>{settings.currency.symbol}{total.toFixed(2)}</span>
          </div>
        </div>

        <div className="footer">
          {settings.returnPolicy && <p className="return-policy">{settings.returnPolicy}</p>}
          <p className="mt-2">Thank you for shopping with us!</p>
        </div>
      </div>
    </div>
  );
});

Invoice.displayName = 'Invoice';

export default Invoice;
