
import React from 'react';
import { BarChart } from 'lucide-react';

const SalesOverviewPlaceholder = ({ settings }) => {
  return (
    <div className={`py-4 text-center ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
      <BarChart className="w-16 h-16 mx-auto mb-4 text-primary/50" />
      <h3 className="text-xl font-semibold mb-2">Sales Overview Coming Soon!</h3>
      <p className="text-sm">
        This section is under construction. Soon, you'll find insightful charts and summaries 
        of your sales performance over various periods right here.
      </p>
      <p className="text-sm mt-1">
        Stay tuned for visual analytics to help you track trends and make data-driven decisions!
      </p>
    </div>
  );
};

export default SalesOverviewPlaceholder;
