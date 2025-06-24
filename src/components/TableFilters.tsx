import React from 'react';
import { Search, RefreshCw, Filter, MoreHorizontal, ChevronLeft, ChevronRight, List, LayoutGrid } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import StatusDropdown from './StatusDropdown';
import { MdSearch, MdClose } from "react-icons/md";

type ViewMode = 'table' | 'card';

interface TableFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  activeView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onRefresh?: () => void;
  filterOptions?: {
    dropdown1: { label: string; options: Array<{ value: string; label: string; color: string }>; value: string; onSelect: (value: string) => void };
    dropdown2?: { label: string; options: Array<{ value: string; label: string }> };
  };
  hideActions?: boolean;
  hideFilters?: boolean;
}

const TableFilters: React.FC<TableFiltersProps> = ({
  searchTerm,
  onSearchChange,
  activeView,
  onViewChange,
  onRefresh,
  filterOptions,
  hideActions = false,
  hideFilters = false
}) => {
  const [isSearchFocused, setIsSearchFocused] = React.useState(false);
  const inputRef = React.useRef(null);

  return (
    <TooltipProvider>
      <div>
        {!hideFilters && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', padding: '12px 0', background: '#f8fafc' }}>
            {filterOptions && (
              <StatusDropdown
                options={filterOptions.dropdown1.options}
                value={filterOptions.dropdown1.value}
                onSelect={filterOptions.dropdown1.onSelect}
                defaultText={filterOptions.dropdown1.label}
                outerStyles={{ minWidth: 260, fontSize: 16, fontWeight: 500, background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 6 }}
              />
            )}
          </div>
        )}

        {!hideActions && (
          <div className="action-buttons-group" style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#f8fafc' }}>
            {onRefresh && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="action-button" style={{ background: '#f8fafc', border: '1px solid #e5e7eb' }} onClick={onRefresh}>
                    <RefreshCw className="filter-icon" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Refresh</p>
                </TooltipContent>
              </Tooltip>
            )}
            <div className="view-toggle-group" style={{ background: '#f8fafc', border: '1px solid #e5e7eb' }}>
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
            <div
              className={`search-input-wrapper${isSearchFocused ? " expanded" : ""}`}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                background: "#f8fafc",
                border: "1px solid #e5e7eb",
                borderRadius: 6,
                width: isSearchFocused ? 260 : 200,
                transition: "width 0.3s, border 0.2s",
                boxShadow: undefined,
                paddingLeft: 12,
                paddingRight: 32,
                height: 38,
                marginLeft: 8
              }}
            >
              <input
                ref={inputRef}
                type="text"
                className="searchText"
                placeholder="Search"
                value={searchTerm}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                onChange={e => onSearchChange(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    onSearchChange((e.target as HTMLInputElement).value);
                  }
                }}
                style={{
                  width: "100%",
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontSize: 16,
                  height: 36,
                  paddingRight: 28
                }}
                maxLength={200}
              />
              {searchTerm.length > 0 ? (
                <span
                  className="close-search-icon pointer"
                  style={{ position: "absolute", right: 8, top: 10, cursor: "pointer" }}
                  onClick={() => onSearchChange("")}
                >
                  <MdClose size={20} />
                </span>
              ) : (
                <span
                  className="input-search-icon"
                  style={{ position: "absolute", right: 8, top: 10, cursor: "pointer", color: '#2563eb' }}
                  onClick={() => inputRef.current && inputRef.current.focus()}
                >
                  <MdSearch size={20} />
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default TableFilters; 