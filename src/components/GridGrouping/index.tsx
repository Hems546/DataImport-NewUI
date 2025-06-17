import React from 'react';
import { Input } from '@/components/ui/input';

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
  console.log('Grid: received onCellBlur', { hasOnCellBlur: !!onCellBlur, onCellBlurType: typeof onCellBlur });
  return (
    <div className="grid-container">
      <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
        <thead>
          <tr>
            {columnHeaders.map((header, index) => {
              const fixedColumn = fixedWidthColumns.find(col => col.accessor === header.accessor);
              const width = fixedColumn ? fixedColumn.width : 'auto';
              return (
                <th
                  key={index}
                  style={{ width: isAutoAdjustWidth ? width : 'auto' }}
                  className="px-3 py-2 text-left border border-gray-200 bg-gray-50 font-medium text-sm"
                >
                  {header.Header}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {gridData.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="hover:bg-gray-50 transition-colors duration-100"
              style={{ minHeight: '36px' }}
            >
              {columnHeaders.map((header, colIndex) => {
                const fixedColumn = fixedWidthColumns.find(col => col.accessor === header.accessor);
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
                    style={{ width: isAutoAdjustWidth ? (fixedColumn ? fixedColumn.width : 'auto') : 'auto', maxWidth: 220 }}
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
    </div>
  );
});

Grid.displayName = 'Grid';

export default Grid; 