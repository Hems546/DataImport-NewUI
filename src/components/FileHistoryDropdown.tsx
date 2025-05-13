
import React, { useState, useEffect } from 'react';
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
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface FileHistoryDropdownProps {
  className?: string;
}

interface FileValidation {
  status: string;
  count: {
    pass: number;
    fail: number;
    warning: number;
  };
}

interface FileHistoryItem {
  id: string;
  fileName: string;
  uploadDate: string;
  fileSize: string;
  status: string;
  validations: Record<ValidationCategory, FileValidation>;
}

export const FileHistoryDropdown = ({ className }: FileHistoryDropdownProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [fileHistory, setFileHistory] = useState<FileHistoryItem[]>([]);
  
  // Fetch import sessions from Supabase
  const { data: importSessions, isLoading } = useQuery({
    queryKey: ['importSessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('import_sessions')
        .select(`
          id, 
          original_filename, 
          upload_time, 
          status,
          row_count,
          import_executions(status)
        `)
        .order('upload_time', { ascending: false })
        .limit(5);

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    },
  });

  // Transform Supabase data to match our component's expected format
  useEffect(() => {
    if (importSessions) {
      const transformedData = importSessions.map(session => {
        // Default validations object
        const defaultValidations: Record<ValidationCategory, FileValidation> = {
          [ValidationCategory.FILE_UPLOAD]: { status: 'pass', count: { pass: 3, fail: 0, warning: 0 } },
          [ValidationCategory.VERIFY_FILE]: { status: 'pass', count: { pass: 4, fail: 0, warning: 0 } },
          [ValidationCategory.COLUMN_MAPPING]: { status: 'pass', count: { pass: 2, fail: 0, warning: 0 } },
          [ValidationCategory.DATA_QUALITY]: { status: 'pass', count: { pass: 5, fail: 0, warning: 0 } },
          [ValidationCategory.DATA_NORMALIZATION]: { status: 'pass', count: { pass: 4, fail: 0, warning: 0 } },
          [ValidationCategory.DEDUPLICATION]: { status: 'pass', count: { pass: 2, fail: 0, warning: 0 } },
          [ValidationCategory.FINAL_REVIEW]: { status: 'pass', count: { pass: 3, fail: 0, warning: 0 } },
          [ValidationCategory.IMPORT_PUSH]: { status: 'pass', count: { pass: 1, fail: 0, warning: 0 } }
        };

        // Calculate file size based on row count (rough estimate)
        const estimatedSize = session.row_count 
          ? `${Math.round(session.row_count * 0.2 * 10) / 10} KB`
          : '1 KB';

        // Determine overall status
        let status = 'processing';
        if (session.status === 'completed') status = 'completed';
        else if (session.status === 'failed') status = 'failed';
        else if (session.import_executions && session.import_executions.length > 0) {
          const executionStatus = session.import_executions[0]?.status;
          if (executionStatus === 'completed' || executionStatus === 'completed_with_errors') {
            status = 'completed';
          } else if (executionStatus === 'failed') {
            status = 'failed';
          }
        }

        return {
          id: session.id,
          fileName: session.original_filename || 'Unnamed file',
          uploadDate: session.upload_time,
          fileSize: estimatedSize,
          status: status,
          validations: defaultValidations
        } as FileHistoryItem;
      });

      setFileHistory(transformedData);
    }
  }, [importSessions]);
  
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
        <Button variant="ghost" className={`text-white hover:text-gray-200 hover:bg-white/20 ${className}`}>
          File History
          <span className="ml-2 bg-white text-indigo-600 rounded-full w-5 h-5 flex items-center justify-center text-xs">
            {isLoading ? "..." : fileHistory.length}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="p-2">
          <h3 className="font-medium mb-2">Recent File Imports</h3>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : fileHistory.length > 0 ? (
              fileHistory.map((file) => (
                <DropdownMenuItem 
                  key={file.id}
                  className="cursor-pointer p-3 hover:bg-gray-100 rounded-md flex flex-col"
                  onClick={() => handleFileClick(file.id)}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <FileBox className="h-5 w-5 text-indigo-600" />
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
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">No import history found</div>
            )}
          </div>
          <Button 
            variant="outline" 
            className="w-full mt-2 text-sm"
            onClick={() => window.location.href = "/file-history"}
          >
            View All File History
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
