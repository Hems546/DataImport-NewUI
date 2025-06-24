import React, { useState, useRef, useEffect } from 'react';
import SortableHeader from './SortableHeader';

interface ResizableTableHeaderProps {
  column: string;
  currentSort: { column: string; direction: 'asc' | 'desc' };
  onSort: (column: string) => void;
  children: React.ReactNode;
  minWidth?: number;
  defaultWidth?: number;
  onResize?: (column: string, width: number) => void;
}

const ResizableTableHeader: React.FC<ResizableTableHeaderProps> = ({
  column,
  currentSort,
  onSort,
  children,
  minWidth = 100,
  defaultWidth = 150,
  onResize
}) => {
  const [width, setWidth] = useState(defaultWidth);
  const [isResizing, setIsResizing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);
  const headerRef = useRef<HTMLTableCellElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const deltaX = e.clientX - startX;
      const newWidth = Math.max(minWidth, startWidth + deltaX);
      setWidth(newWidth);
      
      if (onResize) {
        onResize(column, newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, startX, startWidth, minWidth, column, onResize]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setStartX(e.clientX);
    setStartWidth(width);
  };

  return (
    <th
      ref={headerRef}
      className={`table-header-cell resizable-header ${isResizing ? 'resizing' : ''}`}
      style={{ width: `${width}px`, minWidth: `${width}px` }}
    >
      <div className="header-content">
        <SortableHeader
          column={column}
          currentSort={currentSort}
          onSort={onSort}
        >
          {children}
        </SortableHeader>
      </div>
      <div
        className="resize-handle"
        onMouseDown={handleMouseDown}
        style={{ cursor: 'col-resize' }}
      />
    </th>
  );
};

export default ResizableTableHeader; 