import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ResizableTableHeader from '../ResizableTableHeader';

// Mock SortableHeader component
jest.mock('../SortableHeader', () => {
  return function MockSortableHeader({ children, onSort }: any) {
    return (
      <div onClick={() => onSort('test-column')} data-testid="sortable-header">
        {children}
      </div>
    );
  };
});

describe('ResizableTableHeader', () => {
  const defaultProps = {
    column: 'test-column',
    currentSort: { column: 'test-column', direction: 'asc' as const },
    onSort: jest.fn(),
    children: 'Test Header',
    defaultWidth: 150,
    minWidth: 100,
    onResize: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with default props', () => {
    render(<ResizableTableHeader {...defaultProps} />);
    
    const header = screen.getByText('Test Header');
    expect(header).toBeInTheDocument();
    
    const resizeHandle = document.querySelector('.resize-handle');
    expect(resizeHandle).toBeInTheDocument();
  });

  it('applies correct width styles', () => {
    render(<ResizableTableHeader {...defaultProps} />);
    
    const headerCell = document.querySelector('.resizable-header') as HTMLElement;
    expect(headerCell).toHaveStyle({ width: '150px', minWidth: '150px' });
  });

  it('handles mouse down on resize handle', () => {
    render(<ResizableTableHeader {...defaultProps} />);
    
    const resizeHandle = document.querySelector('.resize-handle') as HTMLElement;
    
    fireEvent.mouseDown(resizeHandle, { clientX: 100 });
    
    // Should add resizing class
    const headerCell = document.querySelector('.resizable-header');
    expect(headerCell).toHaveClass('resizing');
  });

  it('prevents default behavior on resize handle mouse down', () => {
    render(<ResizableTableHeader {...defaultProps} />);
    
    const resizeHandle = document.querySelector('.resize-handle') as HTMLElement;
    const preventDefaultSpy = jest.fn();
    
    fireEvent.mouseDown(resizeHandle, { 
      clientX: 100,
      preventDefault: preventDefaultSpy 
    });
    
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('calls onSort when sortable header is clicked', () => {
    render(<ResizableTableHeader {...defaultProps} />);
    
    const sortableHeader = screen.getByTestId('sortable-header');
    fireEvent.click(sortableHeader);
    
    expect(defaultProps.onSort).toHaveBeenCalledWith('test-column');
  });

  it('respects minimum width constraint', () => {
    const onResize = jest.fn();
    render(
      <ResizableTableHeader 
        {...defaultProps} 
        onResize={onResize}
        minWidth={200}
        defaultWidth={150}
      />
    );
    
    const resizeHandle = document.querySelector('.resize-handle') as HTMLElement;
    
    // Simulate dragging to make width smaller than minimum
    fireEvent.mouseDown(resizeHandle, { clientX: 100 });
    
    // Simulate mouse move that would make width less than minimum
    fireEvent.mouseMove(document, { clientX: 50 }); // 50px less than start
    
    // Should call onResize with minimum width (200px)
    expect(onResize).toHaveBeenCalledWith('test-column', 200);
  });

  it('updates width on mouse move during resize', () => {
    const onResize = jest.fn();
    render(
      <ResizableTableHeader 
        {...defaultProps} 
        onResize={onResize}
        defaultWidth={150}
      />
    );
    
    const resizeHandle = document.querySelector('.resize-handle') as HTMLElement;
    
    // Start resize
    fireEvent.mouseDown(resizeHandle, { clientX: 100 });
    
    // Move mouse to increase width
    fireEvent.mouseMove(document, { clientX: 200 }); // 100px more
    
    // Should call onResize with new width (150 + 100 = 250)
    expect(onResize).toHaveBeenCalledWith('test-column', 250);
  });

  it('cleans up event listeners on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
    
    const { unmount } = render(<ResizableTableHeader {...defaultProps} />);
    
    unmount();
    
    // Should remove event listeners
    expect(removeEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('mouseup', expect.any(Function));
  });
}); 