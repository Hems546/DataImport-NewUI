import React, { useState, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Input } from '@/components/ui/input';
// @ts-ignore
import type {} from 'react-beautiful-dnd';

interface GridProps {
  columnHeaders: any[];
  gridData: any[];
  isAutoAdjustWidth?: boolean;
  fixedWidthColumns?: { accessor: string; width: number }[];
  ListOfDynamicInfoIcons?: any[];
  meatballMenuOptions?: any[];
  getCellError?: (row: any, accessor: string) => string | null;
  onCellBlur?: (rowIndex: number, accessor: string, value: string) => void;
}

const statusColors: Record<string, string> = {
  Error: 'bg-red-100 text-red-700 border border-red-200',
  Success: 'bg-green-100 text-green-700 border border-green-200',
  Warning: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  InProgress: 'bg-blue-100 text-blue-700 border border-blue-200',
};

interface EditableCellProps {
  row: any;
  header: any;
  rowIndex: number;
  getCellError?: (row: any, accessor: string) => string | null;
  onCellBlur?: (rowIndex: number, accessor: string, value: string) => void;
}

const EditableCell = React.memo(({ 
  row, 
  header, 
  rowIndex, 
  getCellError, 
  onCellBlur 
}: EditableCellProps) => {
  console.log('EditableCell props:', {
    rowIndex,
    accessor: header.accessor,
    hasOnCellBlur: !!onCellBlur,
    onCellBlurType: typeof onCellBlur
  });
  
  const [localValue, setLocalValue] = React.useState(row[header.accessor] || '');
  const errorMessage = getCellError ? getCellError(row, header.accessor) : null;

  React.useEffect(() => {
    setLocalValue(row[header.accessor] || '');
  }, [row[header.accessor]]);

  const handleBlur = React.useCallback(() => {
    console.log('EditableCell: handleBlur called', {
      rowIndex,
      accessor: header.accessor,
      value: localValue,
      hasOnCellBlur: !!onCellBlur,
      onCellBlurType: typeof onCellBlur
    });
    
    if (typeof onCellBlur === 'function') {
      try {
        onCellBlur(rowIndex, header.accessor, localValue);
        console.log('EditableCell: onCellBlur called successfully');
      } catch (error) {
        console.error('EditableCell: Error calling onCellBlur:', error);
      }
    } else {
      console.warn('EditableCell: onCellBlur is not a function', { onCellBlur });
    }
  }, [rowIndex, header.accessor, localValue, onCellBlur]);

  return (
    <td className="px-3 py-2 border border-gray-200 align-middle text-sm truncate bg-red-50">
      <div className="space-y-1">
        <Input
          value={localValue}
          onChange={e => {
            console.log('EditableCell: Input value changed:', e.target.value);
            setLocalValue(e.target.value);
          }}
          onBlur={handleBlur}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              console.log('EditableCell: Enter key pressed, triggering blur');
              e.currentTarget.blur();
            }
          }}
          className="w-full px-2 py-1 text-sm border-red-500 focus:ring-red-500"
        />
        {errorMessage && (
          <div
            className="text-xs text-red-600"
            dangerouslySetInnerHTML={{ __html: errorMessage }}
          />
        )}
      </div>
    </td>
  );
});

EditableCell.displayName = 'EditableCell';

const noop = () => {};
const Grid: React.FC<GridProps> = React.memo(({
  columnHeaders,
  gridData,
  isAutoAdjustWidth = true,
  fixedWidthColumns = [],
  ListOfDynamicInfoIcons = [],
  meatballMenuOptions = [],
  getCellError,
  onCellBlur = noop
}) => {
  // Sorting state
  const [sortState, setSortState] = useState({ column: '', direction: 'asc' });
  const [columns, setColumns] = useState(columnHeaders);
  // Column widths state
  const [colWidths, setColWidths] = useState(() =>
    columnHeaders.reduce((acc, col) => {
      acc[col.accessor] = 180; // default width
      return acc;
    }, {})
  );
  const resizingCol = useRef(null);

  // Sorting logic
  const handleSort = (accessor: string) => {
    let direction = 'asc';
    if (sortState.column === accessor && sortState.direction === 'asc') {
      direction = 'desc';
    }
    setSortState({ column: accessor, direction });
  };

  // Sort data
  const sortedData = React.useMemo(() => {
    if (!sortState.column) return gridData;
    return [...gridData].sort((a, b) => {
      const aValue = a[sortState.column];
      const bValue = b[sortState.column];
      if (aValue == null) return 1;
      if (bValue == null) return -1;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortState.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortState.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      return 0;
    });
  }, [gridData, sortState]);

  // Draggable columns logic
  const onDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(columns);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setColumns(reordered);
  };

  // Column resizing logic
  const startResize = (e, accessor) => {
    resizingCol.current = { startX: e.clientX, accessor, startWidth: colWidths[accessor] };
    document.addEventListener('mousemove', handleResize);
    document.addEventListener('mouseup', stopResize);
  };
  const handleResize = (e) => {
    if (!resizingCol.current) return;
    const { startX, accessor, startWidth } = resizingCol.current;
    const delta = e.clientX - startX;
    setColWidths((prev) => ({ ...prev, [accessor]: Math.max(60, startWidth + delta) }));
  };
  const stopResize = () => {
    resizingCol.current = null;
    document.removeEventListener('mousemove', handleResize);
    document.removeEventListener('mouseup', stopResize);
  };

  return (
    <div className="grid-container">
      <DragDropContext onDragEnd={onDragEnd}>
        <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
          <Droppable droppableId="droppable-columns" direction="horizontal" type="column">
            {(provided) => (
              <thead ref={provided.innerRef} {...provided.droppableProps}>
                <tr>
                  {columns.map((header, index) => (
                    <Draggable key={header.accessor} draggableId={header.accessor} index={index}>
                      {(provided) => (
                        <th
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            width: colWidths[header.accessor],
                            minWidth: 60,
                            maxWidth: 600,
                            ...provided.draggableProps.style
                          }}
                          className="px-3 py-2 text-left border border-gray-200 bg-gray-50 font-medium text-sm cursor-move select-none relative group"
                          onClick={() => handleSort(header.accessor)}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span>{header.Header}</span>
                            {sortState.column === header.accessor && (
                              <span style={{ marginLeft: 4 }}>{sortState.direction === 'asc' ? '▲' : '▼'}</span>
                            )}
                            <span
                              className="resize-handle"
                              style={{ cursor: 'col-resize', padding: '0 4px', userSelect: 'none' }}
                              onMouseDown={e => { e.stopPropagation(); startResize(e, header.accessor); }}
                            >
                              ||
                            </span>
                          </div>
                        </th>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </tr>
              </thead>
            )}
          </Droppable>
          <tbody>
            {sortedData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="hover:bg-gray-50 transition-colors duration-100"
                style={{ minHeight: '36px' }}
              >
                {columns.map((header, colIndex) => {
                  const width = colWidths[header.accessor];
                  let cellData = row[header.accessor];
                  // Status badge rendering
                  if (
                    header.accessor.toLowerCase().includes('status') &&
                    typeof cellData === 'string' &&
                    statusColors[cellData]
                  ) {
                    cellData = (
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${statusColors[cellData]}`}
                      >
                        {cellData}
                      </span>
                    );
                  }
                  // File type column tooltip
                  if (header.accessor === 'FileType' && cellData && cellData.props && cellData.props.children && cellData.props.children.type === 'img') {
                    cellData = React.cloneElement(cellData, {
                      children: React.cloneElement(cellData.props.children, {
                        title: row.FileName ? row.FileName.split('.').pop() : '',
                      })
                    });
                  }
                  // EDIT column: render edit button if present
                  if (header.accessor === 'EDIT' && row.EDIT) {
                    return (
                      <td
                        key={colIndex}
                        style={{ width, maxWidth: 220 }}
                        className="px-3 py-2 border border-gray-200 align-middle text-sm truncate"
                      >
                        {row.EDIT}
                      </td>
                    );
                  }
                  // Check if this cell should be editable
                  const errorMessage = getCellError ? getCellError(row, header.accessor) : null;
                  if (errorMessage) {
                    return (
                      <EditableCell
                        key={colIndex}
                        row={row}
                        header={header}
                        rowIndex={rowIndex}
                        getCellError={getCellError}
                        onCellBlur={onCellBlur}
                      />
                    );
                  }
                  // Regular cell rendering
                  const isString = typeof cellData === 'string';
                  return (
                    <td
                      key={colIndex}
                      style={{ width, maxWidth: 220 }}
                      className="px-3 py-2 border border-gray-200 align-middle text-sm truncate"
                    >
                      {isString && cellData.length > 40 ? (
                        <span title={cellData} className="truncate block max-w-[200px] cursor-help">
                          {cellData.slice(0, 40)}&hellip;
                        </span>
                      ) : (
                        cellData
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </DragDropContext>
    </div>
  );
});

Grid.displayName = 'Grid';

export default Grid; 