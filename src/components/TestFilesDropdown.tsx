import React from 'react';
import { DownloadCloud, FileWarning } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { ValidationCategory } from '@/constants/validations';

interface TestFilesDropdownProps {
  onFileGenerated?: (file: File) => void;
}

const testFiles = [
  { 
    name: "Invalid File Format", 
    description: "A non-CSV file to test format validation", 
    category: ValidationCategory.FILE_UPLOAD,
    validationId: "file-type"
  },
  { 
    name: "Oversized File", 
    description: "A file exceeding size limits", 
    category: ValidationCategory.FILE_UPLOAD,
    validationId: "file-size"
  },
  { 
    name: "Corrupted CSV", 
    description: "A corrupted CSV file", 
    category: ValidationCategory.FILE_UPLOAD,
    validationId: "file-corruption"
  },
  { 
    name: "Missing Headers", 
    description: "CSV file without header row", 
    category: ValidationCategory.FILE_UPLOAD,
    validationId: "header-presence"
  },
  { 
    name: "Missing Required Columns", 
    description: "File missing mandatory columns", 
    category: ValidationCategory.VERIFY_FILE,
    validationId: "required-columns"
  },
  { 
    name: "Duplicate Headers", 
    description: "File with duplicate column names", 
    category: ValidationCategory.VERIFY_FILE,
    validationId: "header-uniqueness"
  },
  { 
    name: "Inconsistent Row Length", 
    description: "Rows with different number of columns", 
    category: ValidationCategory.VERIFY_FILE,
    validationId: "row-length-consistency"
  },
  { 
    name: "Invalid Data Types", 
    description: "Text in numeric fields", 
    category: ValidationCategory.DATA_QUALITY,
    validationId: "numeric-values"
  },
  { 
    name: "Invalid Email Format", 
    description: "Records with invalid emails", 
    category: ValidationCategory.DATA_QUALITY,
    validationId: "email-format"
  }
];

export const TestFilesDropdown = ({ onFileGenerated }: TestFilesDropdownProps) => {
  const { toast } = useToast();

  const generateTestFile = (test: typeof testFiles[0]) => {
    let content = '';
    let filename = '';
    let mimeType = 'text/csv';
    
    // Generate different test files based on validation ID
    switch (test.validationId) {
      case "file-type":
        content = '{"this": "is", "invalid": "json"}';
        filename = 'invalid-format.txt';
        mimeType = 'text/plain';
        break;
      
      case "file-size":
        // Generate a large string
        content = 'header1,header2,header3\n' + Array(1000).fill('data,data,data').join('\n');
        filename = 'large-file.csv';
        break;
      
      case "file-corruption":
        content = 'header1,header2,header3\nvalue1,value2\x00corrupt,value3\nmore,\x1Fdata,here';
        filename = 'corrupted-file.csv';
        break;
      
      case "header-presence":
        content = 'value1,value2,value3\nvalue4,value5,value6';
        filename = 'no-headers.csv';
        break;
      
      case "required-columns":
        content = 'name,description\nProduct 1,Description 1\nProduct 2,Description 2';
        filename = 'missing-required-columns.csv';
        break;
      
      case "header-uniqueness":
        content = 'name,email,name\nJohn Doe,john@example.com,John\nJane Smith,jane@example.com,Jane';
        filename = 'duplicate-headers.csv';
        break;
      
      case "row-length-consistency":
        content = 'name,email,age\nJohn Doe,john@example.com\nJane Smith,jane@example.com,25,extra';
        filename = 'inconsistent-rows.csv';
        break;
      
      case "numeric-values":
        content = 'name,email,age\nJohn Doe,john@example.com,not-a-number\nJane Smith,jane@example.com,twenty-five';
        filename = 'invalid-numeric-data.csv';
        break;
      
      case "email-format":
        content = 'name,email,age\nJohn Doe,not-an-email,30\nJane Smith,jane@invalid,25';
        filename = 'invalid-emails.csv';
        break;
        
      default:
        content = 'header1,header2,header3\nvalue1,value2,value3';
        filename = 'test-file.csv';
    }
    
    // Create the file
    const blob = new Blob([content], { type: mimeType });
    const file = new File([blob], filename, { type: mimeType });
    
    // If callback is provided, pass the file directly to the parent
    if (onFileGenerated) {
      onFileGenerated(file);
      toast({
        title: "Test File Generated",
        description: `${filename} has been loaded for testing the ${test.validationId} validation.`
      });
    } else {
      // Otherwise download the file as before
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Test File Generated",
        description: `${filename} has been downloaded. Upload it to test the ${test.validationId} validation.`
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <FileWarning className="h-4 w-4" />
          Test Files
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end">
        <DropdownMenuLabel>Generate Test Files</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {Object.values(ValidationCategory).map((category, index) => {
          const categoryFiles = testFiles.filter(file => file.category === category);
          
          if (categoryFiles.length === 0) return null;
          
          return (
            <React.Fragment key={index}>
              <DropdownMenuLabel className="text-xs font-medium text-gray-500 pl-2">
                {category}
              </DropdownMenuLabel>
              {categoryFiles.map((file, fileIndex) => (
                <DropdownMenuItem key={fileIndex} onClick={() => generateTestFile(file)}>
                  <div className="flex flex-col">
                    <span>{file.name}</span>
                    <span className="text-xs text-gray-500">{file.description}</span>
                  </div>
                </DropdownMenuItem>
              ))}
              {index < Object.values(ValidationCategory).length - 1 && <DropdownMenuSeparator />}
            </React.Fragment>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
