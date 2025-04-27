
import React from "react";
import { Progress } from "@/components/ui/progress";
import { FileCheck, Database, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImportProgressProps {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  totalRows: number;
  processedRows: number;
  failedRows: number;
}

const ImportProgress = ({ 
  status, 
  progress, 
  totalRows, 
  processedRows, 
  failedRows 
}: ImportProgressProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {status === 'completed' && <FileCheck className="text-green-500" />}
            {status === 'failed' && <X className="text-red-500" />}
            {(status === 'pending' || status === 'processing') && <Database className="text-blue-500" />}
            <span className="font-medium capitalize">{status}</span>
          </div>
          <span className="text-sm text-gray-500">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-semibold">{totalRows}</div>
          <div className="text-sm text-gray-500">Total Rows</div>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-semibold">{processedRows}</div>
          <div className="text-sm text-gray-500">Processed</div>
        </div>
        <div className={cn(
          "p-4 bg-gray-50 rounded-lg",
          failedRows > 0 && "bg-red-50"
        )}>
          <div className={cn(
            "text-2xl font-semibold",
            failedRows > 0 && "text-red-600"
          )}>{failedRows}</div>
          <div className="text-sm text-gray-500">Failed</div>
        </div>
      </div>
    </div>
  );
};

export default ImportProgress;
