
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

// Use the same mock data as in the FileHistoryDropdown for consistency
const mockFileHistory = [
  {
    id: '1',
    fileName: 'customers_q1_2023.csv',
    uploadDate: '2025-04-26T10:30:00Z',
    fileSize: '1.2 MB',
    status: 'completed',
    rowCount: 1542,
    importedRows: 1542,
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
    rowCount: 2312,
    importedRows: 0,
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
    rowCount: 824,
    importedRows: 824,
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

const FileHistory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
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
    ? mockFileHistory.filter(file => 
        file.fileName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : mockFileHistory;

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
                {filteredFiles.map((file) => {
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
                })}
                
                {filteredFiles.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No files found matching your search
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
