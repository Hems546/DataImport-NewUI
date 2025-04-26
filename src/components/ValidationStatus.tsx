import React, { useState } from 'react';
import { Check, X, Loader, ChevronDown, Table, AlertTriangle } from 'lucide-react';
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
  severity?: 'critical' | 'warning';
}

interface ValidationStatusProps {
  results: ValidationResult[];
  title: string;
}

const ValidationStatus = ({ results, title }: ValidationStatusProps) => {
  const [showDuplicateHeaders, setShowDuplicateHeaders] = useState(false);

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

  const getTechnicalDescription = (validationId: string) => {
    const descriptions: Record<string, string[]> = {
      'row-length-consistency': [
        "Purpose: Verifies data structure integrity by comparing row lengths",
        "Implementation: Counts columns in each row and compares to header length",
        "Common Issues:",
        "- Missing delimiters causing merged columns",
        "- Extra delimiters creating empty columns",
        "- Line breaks within fields causing row splits",
        "Resolution Steps:",
        "1. Export data with proper delimiters",
        "2. Remove any line breaks within fields",
        "3. Ensure all rows have consistent delimiters"
      ],
      'required-columns': [
        "Purpose: Ensures all mandatory fields are present in the import file",
        "Implementation: Compares header names against required field list",
        "Common Issues:",
        "- Missing required column headers",
        "- Misspelled column names",
        "- Case sensitivity mismatches",
        "Resolution Steps:",
        "1. Compare headers against template",
        "2. Add missing columns with valid data",
        "3. Correct any misspelled headers"
      ],
      'header-uniqueness': [
        "Purpose: Prevents ambiguous column mapping",
        "Implementation: Checks for duplicate column names",
        "Common Issues:",
        "- Multiple columns with same name",
        "- Hidden whitespace in headers",
        "Resolution Steps:",
        "1. Rename duplicate columns uniquely",
        "2. Remove any trailing/leading spaces"
      ],
      'data-type-validation': [
        "Purpose: Ensures data matches expected format and type",
        "Implementation: Validates each cell against field type rules",
        "Common Issues:",
        "- Text in numeric fields",
        "- Incorrectly formatted dates",
        "- Invalid email formats",
        "Resolution Steps:",
        "1. Review data type requirements",
        "2. Convert data to correct format",
        "3. Clean up any special characters"
      ]
    };

    return descriptions[validationId] || [
      "Detailed technical information for this validation is not available.",
      "Please contact support for more information."
    ];
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
              {(result.status === 'fail' || result.status === 'warning') && (
                <AccordionContent className="px-4 pb-3">
                  <div className="space-y-3 text-sm text-gray-700">
                    {getTechnicalDescription(result.id).map((detail, index) => (
                      <p key={index} className={cn(
                        "leading-relaxed",
                        detail.startsWith('-') ? 'pl-4' : '',
                        detail.match(/^\d+\./) ? 'pl-4 text-gray-600' : ''
                      )}>
                        {detail}
                      </p>
                    ))}
                    
                    {result.id === 'header-uniqueness' && (
                      <div className="mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowDuplicateHeaders(!showDuplicateHeaders)}
                          className="flex items-center gap-2"
                        >
                          <Table className="h-4 w-4" />
                          {showDuplicateHeaders ? 'Hide Issue' : 'View Issue'}
                        </Button>
                        
                        {showDuplicateHeaders && renderHeaderUniquenessExample()}
                      </div>
                    )}
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
        
        {failedChecks.length > 0 && renderStatusSection(failedChecks, "Critical Issues")}
        {warningChecks.length > 0 && renderStatusSection(warningChecks, "Warnings")}
        {passedChecks.length > 0 && renderStatusSection(passedChecks, "Passed Checks")}
        
        {results.length === 0 && (
          <p className="text-gray-500 text-sm">No validation checks available.</p>
        )}
      </div>
    </div>
  );
};

export default ValidationStatus;
