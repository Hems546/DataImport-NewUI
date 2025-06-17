import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

interface PagerProps {
  pageSize: number;
  currentPageIndex: number;
  currentPageTotal: number;
  total: number;
  handlePageIndexChange: (index: number) => void;
  refreshData: () => void;
}

const PagerTop: React.FC<PagerProps> = ({
  pageSize,
  currentPageIndex,
  currentPageTotal,
  total,
  handlePageIndexChange,
  refreshData
}) => {
  const totalPages = Math.ceil(total / pageSize);
  const startItem = (currentPageIndex - 1) * pageSize + 1;
  const endItem = Math.min(startItem + currentPageTotal - 1, total);

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageIndexChange(currentPageIndex - 1)}
          disabled={currentPageIndex === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm">
          {startItem}-{endItem} of {total}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageIndexChange(currentPageIndex + 1)}
          disabled={currentPageIndex === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={refreshData}
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default PagerTop; 