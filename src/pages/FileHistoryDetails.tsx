import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FileCheck, Check, X, ChevronRight, Calendar, FileBox, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import { ValidationCategory } from '@/constants/validations';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';

// Mock validation data - in a real app this would come from an API/database
const mockFiles = {
  '1': {
    id: '1',
    fileName: 'customers_q1_2023.csv',
    uploadDate: '2025-04-26T10:30:00Z',
    completedDate: '2025-04-26T10:34:22Z',
    fileSize: '1.2 MB',
    status: 'completed',
    rowCount: 1542,
    importedRows: 1542,
    validationChecks: [
      {
        id: 'file-type',
        name: 'File Type Check',
        category: ValidationCategory.FILE_UPLOAD,
        status: 'pass',
        details: 'File is a valid CSV format'
      },
      {
        id: 'file-size',
        name: 'File Size Check',
        category: ValidationCategory.FILE_UPLOAD,
        status: 'pass',
        details: 'File size (1.2MB) is within limits'
      },
      {
        id: 'file-encoding',
        name: 'File Encoding Check',
        category: ValidationCategory.FILE_UPLOAD,
        status: 'pass',
        details: 'File uses UTF-8 encoding'
      },
      {
        id: 'header-row',
        name: 'Header Row Check',
        category: ValidationCategory.VERIFY_FILE,
        status: 'pass',
        details: 'Header row detected and valid'
      },
      {
        id: 'column-count',
        name: 'Column Count Check',
        category: ValidationCategory.VERIFY_FILE,
        status: 'pass',
        details: '14 columns detected'
      },
      {
        id: 'header-uniqueness',
        name: 'Header Uniqueness Check',
        category: ValidationCategory.VERIFY_FILE,
        status: 'pass',
        details: 'All column headers are unique'
      },
      {
        id: 'required-columns',
        name: 'Required Columns Check',
        category: ValidationCategory.VERIFY_FILE,
        status: 'pass',
        details: 'All required columns are present'
      },
      {
        id: 'column-mapping',
        name: 'Column Mapping Check',
        category: ValidationCategory.COLUMN_MAPPING,
        status: 'pass',
        details: 'All columns successfully mapped'
      },
      {
        id: 'date-format',
        name: 'Date Format Check',
        category: ValidationCategory.DATA_QUALITY,
        status: 'warning',
        details: '23 dates have non-standard formats'
      },
      // More validation checks would be here
    ]
  },
  '2': {
    id: '2',
    fileName: 'leads_march_2025.xlsx',
    uploadDate: '2025-04-22T14:15:00Z',
    fileSize: '3.7 MB',
    status: 'failed',
    rowCount: 2312,
    importedRows: 0,
    validationChecks: [
      {
        id: 'file-type',
        name: 'File Type Check',
        category: ValidationCategory.FILE_UPLOAD,
        status: 'pass',
        details: 'File is a valid XLSX format'
      },
      {
        id: 'file-size',
        name: 'File Size Check',
        category: ValidationCategory.FILE_UPLOAD,
        status: 'pass',
        details: 'File size (3.7MB) is within limits'
      },
      {
        id: 'file-encoding',
        name: 'File Encoding Check',
        category: ValidationCategory.FILE_UPLOAD,
        status: 'pass',
        details: 'File encoding is valid'
      },
      {
        id: 'header-row',
        name: 'Header Row Check',
        category: ValidationCategory.VERIFY_FILE,
        status: 'pass',
        details: 'Header row detected and valid'
      },
      {
        id: 'column-count',
        name: 'Column Count Check',
        category: ValidationCategory.VERIFY_FILE,
        status: 'pass',
        details: '18 columns detected'
      },
      {
        id: 'header-uniqueness',
        name: 'Header Uniqueness Check',
        category: ValidationCategory.VERIFY_FILE,
        status: 'fail',
        details: 'Duplicate headers: "Email" appears 2 times'
      },
      {
        id: 'required-columns',
        name: 'Required Columns Check',
        category: ValidationCategory.VERIFY_FILE,
        status: 'fail',
        details: 'Missing required column: "Phone"'
      },
      // More validation checks that failed or weren't run
    ]
  },
  '3': {
    // Similar structure for the third file
    id: '3',
    fileName: 'customer_export_april.csv',
    uploadDate: '2025-04-18T09:45:00Z',
    completedDate: '2025-04-18T09:50:18Z',
    fileSize: '945 KB',
    status: 'completed',
    rowCount: 824,
    importedRows: 824,
    validationChecks: [
      // Validation checks similar to above
      {
        id: 'file-type',
        name: 'File Type Check',
        category: ValidationCategory.FILE_UPLOAD,
        status: 'pass',
        details: 'File is a valid CSV format'
      },
      // More validation checks
    ]
  }
};

const FileHistoryDetails = () => {
  const { fileId } = useParams<{ fileId: string }>();
  const [fileData, setFileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // In a real app, fetch file data from API
    const fetchFileData = async () => {
      try {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
          const data = mockFiles[fileId as keyof typeof mockFiles];
          if (data) {
            setFileData(data);
          } else {
            toast({
              title: "File not found",
              description: "The requested file history could not be found.",
              variant: "destructive"
            });
          }
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching file data:', error);
        toast({
          title: "Error",
          description: "Failed to load file history data.",
          variant: "destructive"
        });
        setLoading(false);
      }
    };

    fetchFileData();
  }, [fileId, toast]);

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
      default:
        return <X className="h-4 w-4 text-gray-400" />;
    }
  };

  const getCategoryName = (category: ValidationCategory) => {
    const categoryNames = {
      [ValidationCategory.FILE_UPLOAD]: "File Upload",
      [ValidationCategory.COLUMN_MAPPING]: "Column Mapping",
      [ValidationCategory.VERIFY_FILE]: "File Preflighting",
      [ValidationCategory.DATA_QUALITY]: "Data Quality",
      [ValidationCategory.DATA_NORMALIZATION]: "Data Normalization",
      //[ValidationCategory.DEDUPLICATION]: "Deduplication",
      [ValidationCategory.FINAL_REVIEW]: "Final Review & Approval",
      [ValidationCategory.IMPORT_PUSH]: "Import / Push"
    };
    
    return categoryNames[category] || "Unknown";
  };

  // Group validation checks by category
  const groupedChecks = fileData?.validationChecks.reduce((acc: any, check: any) => {
    if (!acc[check.category]) {
      acc[check.category] = [];
    }
    acc[check.category].push(check);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Loading message="Loading file details..." />
          </div>
        </div>
      </div>
    );
  }

  if (!fileData) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center py-16">
            <h2 className="text-2xl font-bold mb-4">File Not Found</h2>
            <p className="text-gray-500 mb-6">The requested file history could not be found.</p>
            <Link to="/">
              <Button>Return to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Link to="/" className="hover:text-gray-700">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/file-history" className="hover:text-gray-700">File History</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-gray-700">Details</span>
          </div>
          
          <Card className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileBox className="h-5 w-5 text-brand-purple" />
                    {fileData.fileName}
                  </CardTitle>
                  <CardDescription>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>Uploaded: {formatDate(fileData.uploadDate)}</span>
                      </div>
                      {fileData.completedDate && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>Completed: {formatDate(fileData.completedDate)}</span>
                        </div>
                      )}
                    </div>
                  </CardDescription>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm ${
                  fileData.status === 'completed' ? 'bg-green-100 text-green-800' : 
                  fileData.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {fileData.status.charAt(0).toUpperCase() + fileData.status.slice(1)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="text-sm text-gray-500">File Size</div>
                  <div className="font-medium">{fileData.fileSize}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="text-sm text-gray-500">Total Rows</div>
                  <div className="font-medium">{fileData.rowCount.toLocaleString()}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="text-sm text-gray-500">Imported Rows</div>
                  <div className="font-medium">{fileData.importedRows.toLocaleString()}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="text-sm text-gray-500">Validation Checks</div>
                  <div className="font-medium">{fileData.validationChecks.length}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <h2 className="text-xl font-bold mb-4">Validation History</h2>
          
          {Object.entries(ValidationCategory).map(([catName, catValue]) => {
            const checks = groupedChecks?.[catValue] || [];
            const allChecksNotRun = checks.length === 0;
            
            return (
              <Card key={catValue} className="mb-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{getCategoryName(catValue as ValidationCategory)}</CardTitle>
                </CardHeader>
                <CardContent>
                  {allChecksNotRun ? (
                    <div className="bg-gray-50 p-4 rounded-md text-center text-gray-500">
                      <p>Checks failed to run for this stage</p>
                    </div>
                  ) : checks.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]">Status</TableHead>
                          <TableHead>Check Name</TableHead>
                          <TableHead className="w-[400px]">Details</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {checks.map((check: any) => (
                          <TableRow key={check.id}>
                            <TableCell>{getStatusIcon(check.status)}</TableCell>
                            <TableCell className="font-medium">{check.name}</TableCell>
                            <TableCell>{check.details}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-md text-center text-gray-500">
                      <p>Check failed to run</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
          
          <div className="mt-6">
            <Link to="/file-history">
              <Button variant="outline">Back to File History</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileHistoryDetails;
