import React from 'react';
import { Search, RefreshCw, Filter, MoreHorizontal, ChevronLeft, ChevronRight, List, LayoutGrid } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type ViewMode = 'table' | 'card';

interface TableFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  activeView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onRefresh?: () => void;
  filterOptions?: {
    dropdown1: { label: string; options: Array<{ value: string; label: string }> };
    dropdown2: { label: string; options: Array<{ value: string; label: string }> };
    dropdown3: { label: string; options: Array<{ value: string; label: string }> };
  };
}

const TableFilters: React.FC<TableFiltersProps> = ({
  searchTerm,
  onSearchChange,
  activeView,
  onViewChange,
  onRefresh,
  filterOptions
}) => {
  return (
    <TooltipProvider>
      <div className="opportunities-table-filters">
        <div className="filter-controls-group">
          <div className="filter-dropdown-container">
            {filterOptions && (
              <>
                <select className="filter-dropdown">
                  {filterOptions.dropdown1.options.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                
                <select className="filter-dropdown">
                  {filterOptions.dropdown2.options.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                
                <select className="filter-dropdown">
                  {filterOptions.dropdown3.options.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>
          
          <span className="pagination-info">1-8 of 8</span>
          
          <div className="pagination-buttons">
            <button className="pagination-button">
              <ChevronLeft className="filter-icon" />
            </button>
            <button className="pagination-button">
              <ChevronRight className="filter-icon" />
            </button>
          </div>
        </div>

        <div className="action-buttons-group">
          {onRefresh && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="action-button" onClick={onRefresh}>
                  <RefreshCw className="filter-icon" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh</p>
              </TooltipContent>
            </Tooltip>
          )}
          
          <button className="action-button">
            <Filter className="filter-icon" />
          </button>
          
          <div className="view-toggle-group">
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  className={`view-toggle-button ${activeView === 'table' ? 'active' : ''}`}
                  onClick={() => onViewChange('table')}
                >
                  <List className="filter-icon" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-800 text-white border-gray-700">
                <p>Table View</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  className={`view-toggle-button ${activeView === 'card' ? 'active' : ''}`}
                  onClick={() => onViewChange('card')}
                >
                  <LayoutGrid className="filter-icon" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-800 text-white border-gray-700">
                <p>Card View</p>
              </TooltipContent>
            </Tooltip>
          </div>
          
          <button className="search-button">
            <Search className="filter-icon" />
            Search
          </button>
          
          <button className="views-button">
            Views
          </button>
          
          <button className="action-button">
            <MoreHorizontal className="filter-icon" />
          </button>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default TableFilters; 