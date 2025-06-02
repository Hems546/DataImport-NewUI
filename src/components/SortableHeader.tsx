import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { SortDirection } from '@/hooks/useTableSort';

interface SortableHeaderProps {
  children: React.ReactNode;
  column: string;
  currentSort: { column: string | null; direction: SortDirection };
  onSort: (column: string) => void;
  className?: string;
}

const SortableHeader: React.FC<SortableHeaderProps> = ({
  children,
  column,
  currentSort,
  onSort,
  className = ''
}) => {
  const isActive = currentSort.column === column;
  const direction = isActive ? currentSort.direction : null;

  return (
    <th 
      className={`table-header-cell cursor-pointer select-none ${className}`}
      onClick={() => onSort(column)}
    >
      <div className="flex items-center justify-between">
        <span>{children}</span>
        <div className="flex flex-col ml-1">
          {direction === 'asc' ? (
            <ArrowUp className="h-3 w-3 text-blue-600" />
          ) : direction === 'desc' ? (
            <ArrowDown className="h-3 w-3 text-blue-600" />
          ) : (
            <div className="flex flex-col">
              <ArrowUp className="h-3 w-3 text-gray-300 -mb-1" />
              <ArrowDown className="h-3 w-3 text-gray-300" />
            </div>
          )}
        </div>
      </div>
    </th>
  );
};

export default SortableHeader; 