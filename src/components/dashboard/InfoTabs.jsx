
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, ShoppingCart, CalendarDays } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

const InfoTabs = ({
  activeInfoTab,
  setActiveInfoTab,
  lowStockItemsCount,
  salesFilter,
  setSalesFilter,
  customDate,
  setCustomDate,
  customMonth,
  setCustomMonth,
  customYear,
  setCustomYear,
}) => {
  const filterOptions = [
    { label: "Today", value: "today" },
    { label: "This Week", value: "week" },
    { label: "This Month", value: "month" },
    { label: "All Time", value: "all" },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 border-b pb-3">
      <div className="flex space-x-1 flex-wrap mb-3 sm:mb-0">
        <Button 
          variant={activeInfoTab === 'lowStock' ? 'default': 'ghost'}
          onClick={() => setActiveInfoTab('lowStock')}
          className={`pb-2 rounded-b-none ${activeInfoTab === 'lowStock' ? 'border-b-2 border-primary text-primary' : ''}`}
        >
          <AlertCircle className="w-4 h-4 mr-2" /> Low Stock ({lowStockItemsCount})
        </Button>
        <Button 
          variant={activeInfoTab === 'soldItems' ? 'default': 'ghost'}
          onClick={() => setActiveInfoTab('soldItems')}
          className={`pb-2 rounded-b-none ${activeInfoTab === 'soldItems' ? 'border-b-2 border-primary text-primary' : ''}`}
        >
          <ShoppingCart className="w-4 h-4 mr-2" /> Sold Items Report
        </Button>
      </div>
      {activeInfoTab === 'soldItems' && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="min-w-[150px] justify-start">
              <CalendarDays className="w-4 h-4 mr-2" />
              {salesFilter.label}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {filterOptions.map(option => (
              <DropdownMenuItem key={option.value} onClick={() => setSalesFilter({type: option.value, label: option.label})}>
                {option.label}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Custom Range</DropdownMenuLabel>
            <div className="p-2 space-y-2">
                <div className="flex items-center space-x-2">
                    <Input type="date" value={customDate} onChange={(e) => setCustomDate(e.target.value)} className="flex-grow text-xs p-1 h-8"/>
                    <Button size="xs" onClick={() => setSalesFilter({type: 'customDate', label: `On ${new Date(customDate).toLocaleDateString()}`})} className="text-xs h-8 px-2">View</Button>
                </div>
                <div className="flex items-center space-x-2">
                    <Input type="month" value={customMonth} onChange={(e) => setCustomMonth(e.target.value)} className="flex-grow text-xs p-1 h-8"/>
                    <Button size="xs" onClick={() => setSalesFilter({type: 'customMonth', label: `For ${customMonth}`})} className="text-xs h-8 px-2">View</Button>
                </div>
                <div className="flex items-center space-x-2">
                    <Input type="number" placeholder="Year" value={customYear} onChange={(e) => setCustomYear(e.target.value)} className="flex-grow text-xs p-1 h-8" min="2000" max="2100"/>
                    <Button size="xs" onClick={() => setSalesFilter({type: 'customYear', label: `For ${customYear}`})} className="text-xs h-8 px-2">View</Button>
                </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};

export default InfoTabs;
