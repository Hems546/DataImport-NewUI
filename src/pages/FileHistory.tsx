
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import { FileBox, Calendar, Check, X, FileCheck, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from '@/components/ui/table';
import { ValidationCategory } from '@/constants/validations';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

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
  rowCount: number;
  importedRows: number;
  validations: Record<ValidationCategory, FileValidation>;
}

const FileHistory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
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
          import_executions(id, status, total_rows, processed_rows, failed_rows)
        `)
        .order('upload_time', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    },
  });

  // Transform Supabase data to match our component's expected format
  const transformData = (): FileHistoryItem[] => {
    if (!importSessions) return [];

    return importSessions.map(session => {
      // Default validations object with random data (would be replaced with actual validations in a real app)
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
      
      // Find related execution for additional data
      const execution = session.import_executions && session.import_executions.length > 0 
        ? session.import_executions[0] 
        : null;
        
      if (execution) {
        if (execution.status === 'completed' || execution.status === 'completed_with_errors') {
          status = 'completed';
        } else if (execution.status === 'failed') {
          status = 'failed';
        }
      }

      return {
        id: session.id,
        fileName: session.original_filename || 'Unnamed file',
        uploadDate: session.upload_time,
        fileSize: estimatedSize,
        status: status,
        rowCount: session.row_count || 0,
        importedRows: execution ? execution.processed_rows - execution.failed_rows : 0,
        validations: defaultValidations
      };
    });
  };
  
  const fileHistory = transformData();
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
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

  const filteredFiles = searchTerm 
    ? fileHistory.filter(file => 
        file.fileName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : fileHistory;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">File Import History</h1>
          
          <div className="flex justify-between items-center mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search files..."
                className="pl-10 pr-4 py-2 border rounded-md w-[300px] focus:outline-none focus:ring-2 focus:ring-brand-purple"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Link to="/">
                <Button variant="outline" className="mr-2">Back to Dashboard</Button>
              </Link>
            </div>
          </div>
          
          <div className="bg-white border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Rows</TableHead>
                  <TableHead>Validation Summary</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      Loading file history...
                    </TableCell>
                  </TableRow>
                ) : filteredFiles.length > 0 ? (
                  filteredFiles.map((file) => {
                    // Calculate validation summary
                    const validationSummary = Object.values(file.validations).reduce(
                      (acc: any, val: any) => {
                        acc.pass += val.count.pass;
                        acc.fail += val.count.fail;
                        acc.warning += val.count.warning;
                        return acc;
                      },
                      { pass: 0, fail: 0, warning: 0 }
                    );

                    return (
                      <TableRow key={file.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileBox className="h-5 w-5 text-brand-purple" />
                            <span className="font-medium">{file.fileName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>{formatDate(file.uploadDate)}</span>
                          </div>
                        </TableCell>
                        <TableCell>{file.fileSize}</TableCell>
                        <TableCell>
                          <div className={`px-2 py-1 rounded-full text-xs inline-flex items-center ${
                            file.status === 'completed' ? 'bg-green-100 text-green-800' : 
                            file.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {file.status.charAt(0).toUpperCase() + file.status.slice(1)}
                          </div>
                        </TableCell>
                        <TableCell>{file.rowCount.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-green-600">{validationSummary.pass}</span>
                              {getStatusIcon('pass')}
                            </div>
                            {validationSummary.warning > 0 && (
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-amber-600">{validationSummary.warning}</span>
                                {getStatusIcon('warning')}
                              </div>
                            )}
                            {validationSummary.fail > 0 && (
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-red-600">{validationSummary.fail}</span>
                                {getStatusIcon('fail')}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Link to={`/file-history/${file.id}`}>
                            <Button size="sm" variant="ghost">View Details</Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      {searchTerm ? 'No files found matching your search' : 'No import history available'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileHistory;
