import React, { useState } from 'react';
import { Check, X, Loader, ChevronDown, Table, AlertTriangle, FileSpreadsheet, PenLine } from 'lucide-react';
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

export interface ValidationResult {
  id: string;
  name: string;
  status: 'pending' | 'pass' | 'fail' | 'warning';
  description?: string;
  severity?: string; // Changed from 'critical' | 'warning' to string to be more flexible
  technical_details?: string | string[];
}

interface ValidationStatusProps {
  results: ValidationResult[];
  title: string;
}

const ValidationStatus = ({ results, title }: ValidationStatusProps) => {
  const [showDuplicateHeaders, setShowDuplicateHeaders] = useState(false);
  const [showSpreadsheetMode, setShowSpreadsheetMode] = useState(false);
  const [fixingError, setFixingError] = useState<string | null>(null);

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

  const renderTechnicalDetails = (details: string | string[] | undefined) => {
    if (!details) return null;
    
    if (typeof details === 'string') {
      return <p className="leading-relaxed">{details}</p>;
    }
    
    return details.map((detail, index) => (
      <p key={index} className={cn(
        "leading-relaxed",
        detail.startsWith('-') ? 'pl-4' : '',
        detail.match(/^\d+\./) ? 'pl-4 text-gray-600' : ''
      )}>
        {detail}
      </p>
    ));
  };

  const handleFixError = (errorId: string) => {
    setFixingError(errorId);
    setShowSpreadsheetMode(true);
  };

  const renderFixItButton = (result: ValidationResult) => {
    // Only show Fix It button for email format errors
    if (result.id === 'email-format') {
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleFixError(result.id)}
          className="flex items-center gap-2"
        >
          <PenLine className="h-4 w-4" />
          Fix It
        </Button>
      );
    }
    return null;
  };

  const renderEmailFormatSpreadsheet = () => {
    // Sample data with email issues
    const sampleData = [
      { id: 1, name: "John Smith", email: "john@example.com", status: "Valid" },
      { id: 2, name: "Jane Doe", email: "not-an-email", status: "Invalid" },
      { id: 3, name: "Bob Johnson", email: "bob@example", status: "Invalid" },
      { id: 4, name: "Alice Brown", email: "alice@example.com", status: "Valid" },
    ];

    return (
      <div className="mt-6 border rounded-lg overflow-hidden bg-white">
        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-gray-600" />
            <h3 className="font-medium">Email Format Correction</h3>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              setShowSpreadsheetMode(false);
              setFixingError(null);
            }}
          >
            Close Editor
          </Button>
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-600 mb-4">
            Fix the invalid email addresses below. Valid email addresses should contain an @ symbol followed by a domain name.
          </p>
          <UITable>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="w-[120px]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>
                    {row.status === "Invalid" ? (
                      <input 
                        type="text" 
                        defaultValue={row.email} 
                        className="w-full p-1 border border-red-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-purple/50"
                      />
                    ) : (
                      row.email
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      row.status === "Valid" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    )}>
                      {row.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </UITable>
          <div className="flex justify-end mt-4">
            <Button 
              size="sm"
              onClick={() => {
                setShowSpreadsheetMode(false);
                setFixingError(null);
              }}
            >
              Apply Fixes
            </Button>
          </div>
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
                    {result.technical_details && renderTechnicalDetails(result.technical_details)}
                    
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
                      {renderFixItButton(result)}
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

        {showSpreadsheetMode && fixingError === 'email-format' && renderEmailFormatSpreadsheet()}
      </div>
    </div>
  );
};

export default ValidationStatus;
