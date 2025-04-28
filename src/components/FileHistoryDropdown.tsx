
import React, { useState } from 'react';
import { FileBox, Calendar, Check, X, FileCheck } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ValidationCategory } from "@/constants/validations";
import { useToast } from "@/hooks/use-toast";

// Mock data - in a real app this would come from an API/database
const mockFileHistory = [
  {
    id: '1',
    fileName: 'customers_q1_2023.csv',
    uploadDate: '2025-04-26T10:30:00Z',
    fileSize: '1.2 MB',
    status: 'completed',
    validations: {
      [ValidationCategory.FILE_UPLOAD]: { status: 'pass', count: { pass: 3, fail: 0, warning: 1 } },
      [ValidationCategory.VERIFY_FILE]: { status: 'pass', count: { pass: 4, fail: 0, warning: 0 } },
      [ValidationCategory.COLUMN_MAPPING]: { status: 'pass', count: { pass: 2, fail: 0, warning: 0 } },
      [ValidationCategory.DATA_QUALITY]: { status: 'warning', count: { pass: 5, fail: 0, warning: 2 } },
      [ValidationCategory.DATA_NORMALIZATION]: { status: 'pass', count: { pass: 4, fail: 0, warning: 0 } },
      [ValidationCategory.DEDUPLICATION]: { status: 'pass', count: { pass: 2, fail: 0, warning: 0 } },
      [ValidationCategory.FINAL_REVIEW]: { status: 'pass', count: { pass: 3, fail: 0, warning: 0 } },
      [ValidationCategory.IMPORT_PUSH]: { status: 'pass', count: { pass: 1, fail: 0, warning: 0 } }
    }
  },
  {
    id: '2',
    fileName: 'leads_march_2025.xlsx',
    uploadDate: '2025-04-22T14:15:00Z',
    fileSize: '3.7 MB',
    status: 'failed',
    validations: {
      [ValidationCategory.FILE_UPLOAD]: { status: 'pass', count: { pass: 3, fail: 0, warning: 0 } },
      [ValidationCategory.VERIFY_FILE]: { status: 'fail', count: { pass: 2, fail: 2, warning: 0 } },
      [ValidationCategory.COLUMN_MAPPING]: { status: 'not_run', count: { pass: 0, fail: 0, warning: 0 } },
      [ValidationCategory.DATA_QUALITY]: { status: 'not_run', count: { pass: 0, fail: 0, warning: 0 } },
      [ValidationCategory.DATA_NORMALIZATION]: { status: 'not_run', count: { pass: 0, fail: 0, warning: 0 } },
      [ValidationCategory.DEDUPLICATION]: { status: 'not_run', count: { pass: 0, fail: 0, warning: 0 } },
      [ValidationCategory.FINAL_REVIEW]: { status: 'not_run', count: { pass: 0, fail: 0, warning: 0 } },
      [ValidationCategory.IMPORT_PUSH]: { status: 'not_run', count: { pass: 0, fail: 0, warning: 0 } }
    }
  },
  {
    id: '3',
    fileName: 'customer_export_april.csv',
    uploadDate: '2025-04-18T09:45:00Z',
    fileSize: '945 KB',
    status: 'completed',
    validations: {
      [ValidationCategory.FILE_UPLOAD]: { status: 'pass', count: { pass: 3, fail: 0, warning: 0 } },
      [ValidationCategory.VERIFY_FILE]: { status: 'pass', count: { pass: 4, fail: 0, warning: 0 } },
      [ValidationCategory.COLUMN_MAPPING]: { status: 'warning', count: { pass: 1, fail: 0, warning: 1 } },
      [ValidationCategory.DATA_QUALITY]: { status: 'pass', count: { pass: 7, fail: 0, warning: 0 } },
      [ValidationCategory.DATA_NORMALIZATION]: { status: 'pass', count: { pass: 4, fail: 0, warning: 0 } },
      [ValidationCategory.DEDUPLICATION]: { status: 'pass', count: { pass: 2, fail: 0, warning: 0 } },
      [ValidationCategory.FINAL_REVIEW]: { status: 'pass', count: { pass: 3, fail: 0, warning: 0 } },
      [ValidationCategory.IMPORT_PUSH]: { status: 'pass', count: { pass: 1, fail: 0, warning: 0 } }
    }
  }
];

interface FileHistoryDropdownProps {
  className?: string;
}

export const FileHistoryDropdown = ({ className }: FileHistoryDropdownProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'pass':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'fail':
        return <X className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <FileCheck className="h-4 w-4 text-amber-500" />;
      case 'not_run':
      default:
        return <X className="h-4 w-4 text-gray-400" />;
    }
  };
  
  const handleFileClick = (fileId: string) => {
    setOpen(false);
    // Navigate to file details page
    window.location.href = `/file-history/${fileId}`;
    
    // For demo purposes, show a toast instead
    toast({
      title: "File History",
      description: `Opening file history for ID: ${fileId}`,
    });
  };
  
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={`text-white hover:text-white hover:bg-white/20 ${className}`}>
          File History
          <span className="ml-2 bg-white text-brand-purple rounded-full w-5 h-5 flex items-center justify-center text-xs">
            {mockFileHistory.length}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="p-2">
          <h3 className="font-medium mb-2">Recent File Imports</h3>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {mockFileHistory.map((file) => (
              <DropdownMenuItem 
                key={file.id}
                className="cursor-pointer p-3 hover:bg-gray-100 rounded-md flex flex-col"
                onClick={() => handleFileClick(file.id)}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <FileBox className="h-5 w-5 text-brand-purple" />
                    <span className="font-medium truncate max-w-[180px]">{file.fileName}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(file.uploadDate)}</span>
                  </div>
                </div>
                <div className="w-full mt-2">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>{file.fileSize}</span>
                    <span className={`${
                      file.status === 'completed' ? 'text-green-600' : 
                      file.status === 'failed' ? 'text-red-600' : 'text-amber-600'
                    } font-medium`}>
                      {file.status.charAt(0).toUpperCase() + file.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex gap-1 mt-1">
                    {Object.entries(file.validations).map(([category, result]) => (
                      <div 
                        key={category} 
                        className="flex-1" 
                        title={`${Object.keys(ValidationCategory)[Object.values(ValidationCategory).indexOf(category as ValidationCategory)]}: ${result.status}`}
                      >
                        <div 
                          className={`h-1 w-full rounded-full ${
                            result.status === 'pass' ? 'bg-green-500' : 
                            result.status === 'fail' ? 'bg-red-500' : 
                            result.status === 'warning' ? 'bg-amber-500' : 'bg-gray-300'
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-2 text-sm">
            View All File History
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
