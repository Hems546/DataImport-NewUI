import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PagerProps {
  pageSize: number;
  currentPageIndex: number;
  currentPageTotal: number;
  total: number;
  handlePageIndexChange: (index: number) => void;
}

const PagerTop: React.FC<PagerProps> = ({
  pageSize,
  currentPageIndex,
  currentPageTotal,
  total,
  handlePageIndexChange
}) => {
  const totalPages = Math.ceil(total / pageSize);
  const startItem = (currentPageIndex - 1) * pageSize + 1;
  const endItem = Math.min(startItem + currentPageTotal - 1, total);

  return (
    <div style={{ display: 'flex', alignItems: 'center', fontSize: 16, fontWeight: 400, gap: 8 }}>
      <span style={{ color: '#6B7280', marginRight: 8 }}>{startItem}-{endItem} of {total}</span>
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}
      >
        <ChevronLeft
          style={{
            cursor: currentPageIndex === 1 ? 'not-allowed' : 'pointer',
            color: currentPageIndex === 1 ? '#D1D5DB' : '#374151',
            transition: 'color 0.2s',
            height: 20,
            width: 20
          }}
          onClick={() => currentPageIndex > 1 && handlePageIndexChange(currentPageIndex - 1)}
          onMouseOver={e => {
            if (currentPageIndex !== 1) e.currentTarget.style.color = '#111827';
          }}
          onMouseOut={e => {
            if (currentPageIndex !== 1) e.currentTarget.style.color = '#374151';
          }}
        />
        <ChevronRight
          style={{
            cursor: currentPageIndex === totalPages ? 'not-allowed' : 'pointer',
            color: currentPageIndex === totalPages ? '#D1D5DB' : '#374151',
            transition: 'color 0.2s',
            height: 20,
            width: 20
          }}
          onClick={() => currentPageIndex < totalPages && handlePageIndexChange(currentPageIndex + 1)}
          onMouseOver={e => {
            if (currentPageIndex !== totalPages) e.currentTarget.style.color = '#111827';
          }}
          onMouseOut={e => {
            if (currentPageIndex !== totalPages) e.currentTarget.style.color = '#374151';
          }}
        />
      </span>
    </div>
  );
};

export default PagerTop; 