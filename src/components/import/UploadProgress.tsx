
import React from 'react';
import { Progress } from '@/components/ui/progress';

const UploadProgress = () => {
  return (
    <div className="bg-white p-4 shadow">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          <div>Upload Progress</div>
          <div className="text-right">16% Complete</div>
        </div>
        <Progress value={16} className="h-2 mt-2" />
      </div>
    </div>
  );
};

export default UploadProgress;
