import React, { useState } from 'react';
import { Check, X, Loader, Table, AlertTriangle, FileSpreadsheet, PenLine, Eye, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table as UITable,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export interface ValidationResult {
  id: string;
  name: string;
  status: 'pending' | 'pass' | 'fail' | 'warning';
  description?: string;
  severity?: string; 
  technical_details?: string | string[];
  groupId?: string; // Added groupId to support group-specific actions
}

interface ValidationStatusProps {
  results: ValidationResult[];
  title: string;
  data?: any[]; 
  onAction?: (id: string, action: string, groupId?: string) => void;
}

const ValidationStatus = ({ results, title, data = [], onAction }: ValidationStatusProps) => {
  const { toast } = useToast();
  const [showDuplicateHeaders, setShowDuplicateHeaders] = useState(false);
  const [showSpreadsheetMode, setShowSpreadsheetMode] = useState(false);
  const [fixingError, setFixingError] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Set up edited data when fixing an error
  React.useEffect(() => {
    if (fixingError && data.length > 0) {
      setEditedData([...data]);
    }
  }, [fixingError, data]);

  const getStatusIcon = (status: ValidationResult['status']) => {
    switch (status) {
      case 'pass':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'fail':
        return <X className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'pending':
        return <Loader className="h-4 w-4 text-gray-500 animate-spin" />;
    }
  };

  const renderTechnicalDetails = (details: string | string[] | undefined, result: ValidationResult) => {
    if (!details) return null;
    
    if (typeof details === 'string') {
      return (
        <p className="leading-relaxed">{details}</p>
      );
    }
    
    return (
      <>
        {details.map((detail, index) => {
          // Check if this is a button action
          if (typeof detail === 'string' && detail.includes('<button-action')) {
            // Extract the action ID and text
            const idMatch = detail.match(/id="([^"]+)"/);
            const actionMatch = detail.match(/action="([^"]+)"/);
            const textMatch = detail.match(/>([^<]+)</);
            
            if (idMatch && actionMatch && textMatch && onAction) {
              const id = idMatch[1];
              const action = actionMatch[1];
              const buttonText = textMatch[1];
              
              return (
                <div key={index} className="mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAction(id, action, result.groupId)}
                    className="flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    {buttonText}
                  </Button>
                </div>
              );
            }
          }
          
          return (
            <p key={index} className={cn(
              "leading-relaxed",
              detail.startsWith('-') ? 'pl-4' : '',
              detail.match(/^\d+\./) ? 'pl-4 text-gray-600' : ''
            )}>
              {detail}
            </p>
          );
        })}
      </>
    );
  };

  const getErrorData = (errorId: string) => {
    switch (errorId) {
      case 'email-format':
        return editedData.filter(row => 'email' in row && !isEmailValid(row.email || ''));
      case 'numeric-values':
        return editedData.filter(row => 'age' in row && !isNumeric(row.age));
      case 'phone-format':
        return editedData.filter(row => 'phone' in row && !isValidPhone(row.phone || ''));
      case 'required-columns':
        // For required columns, return all data so it can be viewed
        return editedData;
      default:
        return [];
    }
  };

  const handleFixError = (errorId: string) => {
    setFixingError(errorId);
    setShowSpreadsheetMode(true);
  };

  const handleViewData = (errorId: string) => {
    setFixingError(errorId);
    setShowSpreadsheetMode(true);
  };

  const handleFieldChange = (index: number, field: string, newValue: string) => {
    if (editedData[index]) {
      const newData = [...editedData];
      newData[index] = { ...newData[index], [field]: newValue };
      setEditedData(newData);
    }
  };

  const handleApplyFixes = () => {
    // In a real app, we would save the changes to the file data
    // For now, we'll just close the editor
    
    // We could save the edited data back to localStorage
    if (editedData.length > 0) {
      localStorage.setItem('editedFileData', JSON.stringify(editedData));
      toast({
        title: "Changes applied",
        description: "Your data corrections have been saved",
      });
    }
    
    setShowSpreadsheetMode(false);
    setFixingError(null);
  };

  const isEmailValid = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isNumeric = (value: any): boolean => {
    return !isNaN(parseFloat(value)) && isFinite(value);
  };

  const isValidPhone = (phone: string): boolean => {
    const phoneRegex = /^[\d\+\-\(\)\s]+$/;
    return phoneRegex.test(phone);
  };

  const renderSpreadsheetButton = (result: ValidationResult) => {
    // Only show button for errors that can be viewed in spreadsheet mode
    const canShowSpreadsheet = [
      'email-format', 
      'numeric-values', 
      'phone-format', 
      'header-uniqueness', 
      'required-columns'
    ].includes(result.id);
    
    if (canShowSpreadsheet && result.status !== 'pass') {
      // For errors that can be fixed inline
      if (['email-format', 'numeric-values', 'phone-format'].includes(result.id)) {
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleFixError(result.id)}
            className="flex items-center gap-2"
          >
            <PenLine className="h-4 w-4" />
            Fix Data
          </Button>
        );
      }
      // For errors that can only be viewed
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleViewData(result.id)}
          className="flex items-center gap-2"
        >
          <Eye className="h-4 w-4" />
          View Data
        </Button>
      );
    }
    return null;
  };

  const renderSpreadsheetMode = () => {
    if (!fixingError) return null;
    
    // Filter relevant data based on the error type
    const relevantData = getErrorData(fixingError);
    const isEditable = ['email-format', 'numeric-values', 'phone-format'].includes(fixingError);
    
    // Determine what field to edit based on the error
    let fieldToEdit = '';
    let fieldType = 'text';
    let validationFunction: (value: string) => boolean = () => true;
    
    switch (fixingError) {
      case 'email-format':
        fieldToEdit = 'email';
        validationFunction = isEmailValid;
        break;
      case 'numeric-values':
        fieldToEdit = 'age';
        fieldType = 'number';
        validationFunction = isNumeric;
        break;
      case 'phone-format':
        fieldToEdit = 'phone';
        validationFunction = isValidPhone;
        break;
      default:
        fieldToEdit = '';
        validationFunction = () => true;
    }

    // Filter by search term if provided
    let filteredData = relevantData;
    if (searchTerm) {
      filteredData = relevantData.filter(row => {
        return Object.values(row).some(val => 
          val && String(val).toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }
    
    let errorTitle = '';
    let errorDescription = '';
    
    switch (fixingError) {
      case 'email-format':
        errorTitle = 'Email Format Correction';
        errorDescription = 'Fix the invalid email addresses below. Valid email addresses should contain an @ symbol followed by a domain name.';
        break;
      case 'numeric-values':
        errorTitle = 'Numeric Values Correction';
        errorDescription = 'Fix the invalid numeric values below. Only numbers are allowed in these fields.';
        break;
      case 'phone-format':
        errorTitle = 'Phone Format Correction';
        errorDescription = 'Fix the invalid phone numbers below. Phone numbers should only contain digits, spaces, and characters like +()-';
        break;
      case 'header-uniqueness':
        errorTitle = 'Duplicate Headers';
        errorDescription = 'This file contains duplicate column headers, which can cause data mapping issues.';
        break;
      case 'required-columns':
        errorTitle = 'Missing Required Columns';
        errorDescription = 'The file is missing required columns. Review the data structure below:';
        break;
      default:
        errorTitle = 'Data View';
        errorDescription = 'Examine the problematic data below:';
    }
    
    return (
      <div className="mt-6 border rounded-lg overflow-hidden bg-white">
        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-gray-600" />
            <h3 className="font-medium">{errorTitle}</h3>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              setShowSpreadsheetMode(false);
              setFixingError(null);
            }}
          >
            Close Spreadsheet
          </Button>
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-600 mb-4">
            {errorDescription}
          </p>
          
          <div className="mb-4">
            <Input
              type="text"
              placeholder="Search data..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
          </div>
          
          <div className="border rounded overflow-auto max-h-96">
            <UITable>
              <TableHeader className="sticky top-0 bg-white">
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  {relevantData.length > 0 && Object.keys(relevantData[0]).map((header, i) => (
                    <TableHead key={i} className={header === fieldToEdit ? 'bg-blue-50' : ''}>
                      {header}
                      {header === fieldToEdit && isEditable && (
                        <span className="text-xs text-blue-600 block">Editable</span>
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    <TableCell>{rowIndex + 1}</TableCell>
                    {Object.entries(row).map(([key, value], cellIndex) => (
                      <TableCell 
                        key={`${rowIndex}-${cellIndex}`}
                        className={key === fieldToEdit ? 'bg-blue-50' : ''}
                      >
                        {isEditable && key === fieldToEdit ? (
                          <Input
                            type={fieldType}
                            value={String(value) || ''}
                            onChange={(e) => handleFieldChange(
                              relevantData.findIndex(r => r === row), 
                              key, 
                              e.target.value
                            )}
                            className={cn(
                              "w-full",
                              !validationFunction(String(value)) ? "border-red-300" : "border-green-300"
                            )}
                          />
                        ) : (
                          <span className={cn(
                            key === fieldToEdit && !validationFunction(String(value)) && "text-red-600"
                          )}>
                            {value !== null && value !== undefined ? String(value) : ''}
                          </span>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                {filteredData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={relevantData.length > 0 ? Object.keys(relevantData[0]).length + 1 : 2} className="text-center py-4 text-gray-500">
                      {searchTerm ? "No matching data found" : "No data available"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </UITable>
          </div>
          
          {isEditable && filteredData.length > 0 && (
            <div className="flex justify-end mt-4">
              <Button 
                size="sm"
                onClick={handleApplyFixes}
                className="bg-[rgb(59,130,246)] hover:bg-[rgb(37,99,235)]"
              >
                Apply Fixes
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  const renderHeaderUniquenessExample = () => {
    const headers = ['Customer ID', 'Name', 'Email', 'Email', 'Phone', 'Address'];
    const sampleData = [
      ['001', 'John Doe', 'john@example.com', 'john.doe@example.com', '123-456-7890', '123 Main St'],
      ['002', 'Jane Smith', 'jane@example.com', 'jane.smith@example.com', '098-765-4321', '456 Oak Ave'],
    ];

    return (
      <div className="mt-4 border rounded-lg overflow-hidden">
        <UITable>
          <TableHeader>
            <TableRow>
              {headers.map((header, index) => (
                <TableHead
                  key={`${header}-${index}`}
                  className={cn(
                    header === 'Email' && 'bg-red-50 text-red-800',
                    'text-center'
                  )}
                >
                  {header}
                  {header === 'Email' && (
                    <div className="text-xs text-red-600">Duplicate header</div>
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sampleData.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <TableCell
                    key={`${cell}-${cellIndex}`}
                    className={cn(
                      cellIndex === 2 || cellIndex === 3 ? 'bg-red-50' : '',
                      'text-center'
                    )}
                  >
                    {cell}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </UITable>
      </div>
    );
  };

  const failedChecks = results.filter(result => result.status === 'fail' && result.severity === 'critical');
  const warningChecks = results.filter(result => result.status === 'warning' || (result.status === 'fail' && result.severity === 'warning'));
  const passedChecks = results.filter(result => result.status === 'pass');

  const getStatusBackground = (status: ValidationResult['status'], severity?: string) => {
    if (status === 'fail' && severity === 'critical') return 'bg-red-50';
    if (status === 'warning' || (status === 'fail' && severity === 'warning')) return 'bg-yellow-50';
    if (status === 'pass') return 'bg-green-50';
    return 'bg-gray-50';
  };

  const renderStatusSection = (items: ValidationResult[], title: string) => {
    if (items.length === 0) return null;
    
    return (
      <div className="mb-4">
        <h4 className="text-sm font-medium mb-2">{title}</h4>
        <Accordion type="single" collapsible className="space-y-3">
          {items.map((result) => (
            <AccordionItem
              key={result.id}
              value={result.id}
              className={cn(
                "rounded border-none",
                getStatusBackground(result.status, result.severity)
              )}
            >
              <AccordionTrigger className="px-4 py-2 hover:no-underline">
                <div className="flex items-center justify-between w-full">
                  <div className="flex-1">
                    <p className="font-medium text-left">{result.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {result.severity === 'critical' && result.status === 'fail' && (
                      <span className="text-xs text-red-600 font-medium">Critical</span>
                    )}
                    {getStatusIcon(result.status)}
                  </div>
                </div>
              </AccordionTrigger>
              {(result.status === 'fail' || result.status === 'warning' || result.status === 'pass') && (
                <AccordionContent className="px-4 pb-3">
                  <div className="space-y-3 text-sm text-gray-700">
                    {result.technical_details && renderTechnicalDetails(result.technical_details, result)}
                    
                    <div className="mt-4 flex space-x-2">
                      {result.id === 'header-uniqueness' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowDuplicateHeaders(!showDuplicateHeaders)}
                          className="flex items-center gap-2"
                        >
                          <Table className="h-4 w-4" />
                          {showDuplicateHeaders ? 'Hide Issue' : 'View Issue'}
                        </Button>
                      )}
                      {renderSpreadsheetButton(result)}
                    </div>
                    
                    {result.id === 'header-uniqueness' && showDuplicateHeaders && renderHeaderUniquenessExample()}
                  </div>
                </AccordionContent>
              )}
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">{title}</h3>
          {warningChecks.length > 0 && (
            <span className="text-sm text-yellow-600">
              Non-critical issues found - Override available
            </span>
          )}
        </div>
        
        {!showSpreadsheetMode && (
          <>
            {failedChecks.length > 0 && renderStatusSection(failedChecks, "Critical Issues")}
            {warningChecks.length > 0 && renderStatusSection(warningChecks, "Warnings")}
            {passedChecks.length > 0 && renderStatusSection(passedChecks, "Passed Checks")}
            
            {results.length === 0 && (
              <p className="text-gray-500 text-sm">No validation checks available.</p>
            )}
          </>
        )}

        {showSpreadsheetMode && renderSpreadsheetMode()}
      </div>
    </div>
  );
};

export default ValidationStatus;
