
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const ProductSearch = ({ searchQuery, setSearchQuery }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Products</h2>
      <div className="relative">
        <Input
          type="text"
          placeholder="Search by name or reference number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
        <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
      </div>
    </div>
  );
};

export default ProductSearch;
