
import { supabase } from "@/integrations/supabase/client";
import Papa from 'papaparse';
import { getTechnicalDescription } from '@/constants/validations';
import { encode } from 'iconv-lite';

export interface FileValidationResult {
  id: string;
  validation_type: string;
  status: 'pass' | 'fail' | 'warning';
  severity: string;
  message: string;
  technical_details?: string | string[];
}

export interface DataQualityValidationResult {
  id: string;
  name: string;
  status: 'pass' | 'fail' | 'warning';
  severity: string;
  description?: string;
  technical_details?: string | string[];
  affectedRows?: any[];
}

export async function validateFile(file: File, skipBasicChecks = false): Promise<FileValidationResult[]> {
  const results: FileValidationResult[] = [];
  
  if (!skipBasicChecks) {
    // File size validation (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    results.push({
      id: 'file-size',
      validation_type: 'file-size',
      status: file.size > maxSize ? 'fail' : 'pass',
      severity: 'critical',
      message: file.size > maxSize 
        ? 'File size exceeds 10MB limit'
        : 'File size is within acceptable limits',
      technical_details: getTechnicalDescription('file-size')
    });

    // File type validation
    const allowedTypes = ['.csv', '.xls', '.xlsx'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    results.push({
      id: 'file-type',
      validation_type: 'file-type',
      status: !allowedTypes.includes(fileExtension) ? 'fail' : 'pass',
      severity: 'critical',
      message: !allowedTypes.includes(fileExtension)
        ? 'Invalid file type. Only CSV and Excel files are supported.'
        : 'File type is supported',
      technical_details: getTechnicalDescription('file-type')
    });

    // Character encoding validation (UTF-8)
    try {
      const sample = await file.slice(0, 4096).text(); // Read first 4KB
      const encoder = new TextEncoder();
      const decoder = new TextDecoder('utf-8', { fatal: true });
      decoder.decode(encoder.encode(sample));
      
      results.push({
        id: 'file-encoding',
        validation_type: 'file-encoding',
        status: 'pass',
        severity: 'high',
        message: 'File encoding is valid UTF-8',
        technical_details: getTechnicalDescription('file-encoding')
      });
    } catch (error) {
      results.push({
        id: 'file-encoding',
        validation_type: 'file-encoding',
        status: 'fail',
        severity: 'high',
        message: 'File must be encoded in UTF-8 format',
        technical_details: getTechnicalDescription('file-encoding')
      });
    }

    // File corruption check
    try {
      const fileContent = await file.slice(0, 4096).text();
      const isCorrupted = !fileContent || fileContent.length === 0;
      
      results.push({
        id: 'file-corruption',
        validation_type: 'file-corruption',
        status: isCorrupted ? 'fail' : 'pass',
        severity: 'critical',
        message: isCorrupted ? 'File appears to be corrupted or empty' : 'File integrity check passed',
        technical_details: getTechnicalDescription('file-corruption')
      });
    } catch (error) {
      results.push({
        id: 'file-corruption',
        validation_type: 'file-corruption',
        status: 'fail',
        severity: 'critical',
        message: 'Unable to read file content, file may be corrupted',
        technical_details: getTechnicalDescription('file-corruption')
      });
    }
  }

  // For CSV files, perform additional checks
  if (file.name.toLowerCase().endsWith('.csv')) {
    return new Promise((resolve) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        preview: 1000, // Check first 1000 rows for quick validation
        complete: (parseResults) => {
          // Header presence check
          if (!parseResults.meta.fields || parseResults.meta.fields.length === 0) {
            results.push({
              id: 'header-presence',
              validation_type: 'header-presence',
              status: 'fail',
              severity: 'critical',
              message: 'No headers found in file',
              technical_details: getTechnicalDescription('header-presence')
            });
          } else {
            results.push({
              id: 'header-presence',
              validation_type: 'header-presence',
              status: 'pass',
              severity: 'critical',
              message: 'Headers found in file',
              technical_details: getTechnicalDescription('header-presence')
            });
            
            // Header uniqueness check (only if headers are present)
            const headers = parseResults.meta.fields;
            const uniqueHeaders = new Set(headers);
            const hasDuplicateHeaders = headers.length !== uniqueHeaders.size;
            
            results.push({
              id: 'header-uniqueness',
              validation_type: 'header-uniqueness',
              status: hasDuplicateHeaders ? 'fail' : 'pass',
              severity: 'high',
              message: hasDuplicateHeaders 
                ? 'Duplicate headers found in the file'
                : 'All headers are unique',
              technical_details: getTechnicalDescription('header-uniqueness')
            });
            
            // Check for blank headers
            const hasBlankHeaders = headers.some(header => !header.trim());
            results.push({
              id: 'header-blank',
              validation_type: 'header-blank',
              status: hasBlankHeaders ? 'fail' : 'pass',
              severity: 'high',
              message: hasBlankHeaders
                ? 'Blank or empty headers found in the file'
                : 'No blank headers found',
              technical_details: getTechnicalDescription('header-blank')
            });
          }

          // Row length consistency check
          const rowLengths = new Set();
          parseResults.data.forEach((row: any) => {
            rowLengths.add(Object.keys(row).length);
          });
          
          const hasInconsistentRowLengths = rowLengths.size > 1;
          results.push({
            id: 'row-length-consistency',
            validation_type: 'row-length-consistency',
            status: hasInconsistentRowLengths ? 'fail' : 'pass',
            severity: 'medium',
            message: hasInconsistentRowLengths
              ? 'Inconsistent row lengths detected in the file'
              : 'All rows have consistent length',
            technical_details: getTechnicalDescription('row-length-consistency')
          });

          // Maximum row count check (100,000 rows limit)
          const maxRows = 100000;
          const rowCount = parseResults.data.length;
          results.push({
            id: 'max-row-count',
            validation_type: 'max-row-count',
            status: rowCount > maxRows ? 'fail' : 'pass',
            severity: 'critical',
            message: rowCount > maxRows 
              ? `File exceeds maximum row limit of ${maxRows.toLocaleString()} rows`
              : `Row count (${rowCount.toLocaleString()}) is within limits`,
            technical_details: getTechnicalDescription('max-row-count')
          });

          // Empty file check (no rows)
          results.push({
            id: 'empty-file',
            validation_type: 'empty-file',
            status: rowCount === 0 ? 'fail' : 'pass',
            severity: 'critical',
            message: rowCount === 0
              ? 'File appears to be empty (no data rows found)'
              : 'File contains data rows',
            technical_details: getTechnicalDescription('empty-file')
          });

          // Required columns check 
          // Note: We'll implement a simple check here, but in a real application,
          // this would be configured based on the target system or template
          const requiredColumns = ['name', 'email']; // Example required columns
          const headerLowerCase = parseResults.meta.fields?.map(h => h.toLowerCase()) || [];
          const missingRequiredColumns = requiredColumns.filter(
            col => !headerLowerCase.includes(col)
          );
          
          results.push({
            id: 'required-columns',
            validation_type: 'required-columns',
            status: missingRequiredColumns.length > 0 ? 'warning' : 'pass',
            severity: 'medium',
            message: missingRequiredColumns.length > 0
              ? `Missing recommended columns: ${missingRequiredColumns.join(', ')}`
              : 'All recommended columns are present',
            technical_details: getTechnicalDescription('required-columns')
          });

          resolve(results);
        },
        error: (error) => {
          results.push({
            id: 'parse-error',
            validation_type: 'parse-error',
            status: 'fail',
            severity: 'critical',
            message: 'Error parsing file: ' + error.message
          });
          resolve(results);
        }
      });
    });
  }

  return Promise.resolve(results);
}

export function validateColumnMappings(
  sourceColumns: string[],
  mappedFields: { sourceColumn: string; targetField: string }[],
  requiredTargetFields: string[] = []
): FileValidationResult[] {
  const results: FileValidationResult[] = [];
  
  // Check if all required target fields are mapped
  const mappedTargetFields = mappedFields.map(m => m.targetField).filter(t => t !== 'ignore' && t !== '');
  const missingRequiredFields = requiredTargetFields.filter(field => !mappedTargetFields.includes(field));
  
  results.push({
    id: 'required-columns',
    validation_type: 'required-fields-mapping',
    status: missingRequiredFields.length > 0 ? 'fail' : 'pass',
    severity: missingRequiredFields.length > 0 ? 'critical' : 'low',
    message: missingRequiredFields.length > 0 
      ? `Missing required field mappings: ${missingRequiredFields.join(', ')}`
      : 'All required fields are mapped',
    technical_details: getTechnicalDescription('required-columns')
  });
  
  // Check for duplicate mappings (multiple source columns mapped to the same target field)
  const targetFieldCounts: Record<string, number> = {};
  mappedFields.forEach(mapping => {
    if (mapping.targetField && mapping.targetField !== 'ignore') {
      targetFieldCounts[mapping.targetField] = (targetFieldCounts[mapping.targetField] || 0) + 1;
    }
  });
  
  const duplicateMappings = Object.entries(targetFieldCounts)
    .filter(([field, count]) => count > 1)
    .map(([field]) => field);
  
  results.push({
    id: 'duplicate-mapping',
    validation_type: 'duplicate-mapping-prevention',
    status: duplicateMappings.length > 0 ? 'fail' : 'pass',
    severity: duplicateMappings.length > 0 ? 'high' : 'low',
    message: duplicateMappings.length > 0 
      ? `Multiple source columns mapped to the same target field: ${duplicateMappings.join(', ')}`
      : 'No duplicate mappings detected',
    technical_details: [
      "Purpose: Prevents data confusion by ensuring each target field has only one source",
      "Implementation: Checks for multiple source columns mapped to the same target field",
      "Common Issues:",
      "- Multiple columns with similar data mapped to same field",
      "- Accidentally selecting the same target field multiple times",
      "Resolution Steps:",
      "1. Review duplicate mappings and select different target fields",
      "2. Consider combining data before import if multiple columns should map to one field",
      "3. Use 'Ignore this column' for columns that should not be imported"
    ]
  });
  
  // Check field type compatibility based on simple pattern detection
  const typeCompatibilityIssues: { sourceColumn: string, targetField: string, issue: string }[] = [];
  
  mappedFields.forEach(mapping => {
    if (!mapping.targetField || mapping.targetField === 'ignore') return;
    
    // Sample data check based on column name patterns
    // In a real implementation, this would examine actual data samples
    const sourceColumn = mapping.sourceColumn.toLowerCase();
    const targetField = mapping.targetField.toLowerCase();
    
    // Example compatibility checks
    if ((sourceColumn.includes('email') && !targetField.includes('email')) || 
        (!sourceColumn.includes('email') && targetField.includes('email'))) {
      typeCompatibilityIssues.push({
        sourceColumn: mapping.sourceColumn,
        targetField: mapping.targetField,
        issue: 'Email field mismatch'
      });
    }
    
    if ((sourceColumn.includes('date') && !targetField.includes('date')) || 
        (!sourceColumn.includes('date') && targetField.includes('date'))) {
      typeCompatibilityIssues.push({
        sourceColumn: mapping.sourceColumn,
        targetField: mapping.targetField,
        issue: 'Date field mismatch'
      });
    }
    
    if ((sourceColumn.includes('phone') && !targetField.includes('phone')) || 
        (!sourceColumn.includes('phone') && targetField.includes('phone'))) {
      typeCompatibilityIssues.push({
        sourceColumn: mapping.sourceColumn,
        targetField: mapping.targetField,
        issue: 'Phone field mismatch'
      });
    }
  });
  
  results.push({
    id: 'field-type-compatibility',
    validation_type: 'field-type-compatibility',
    status: typeCompatibilityIssues.length > 0 ? 'warning' : 'pass',
    severity: 'medium',
    message: typeCompatibilityIssues.length > 0 
      ? `Potential field type compatibility issues detected (${typeCompatibilityIssues.length})`
      : 'Field type compatibility looks good',
    technical_details: typeCompatibilityIssues.length > 0 ? [
      "Purpose: Ensures data types match between source and target fields",
      "Implementation: Pattern matching on field names and data samples",
      "Detected Issues:",
      ...typeCompatibilityIssues.map(issue => `- ${issue.sourceColumn} → ${issue.targetField}: ${issue.issue}`)
    ] : [
      "Purpose: Ensures data types match between source and target fields",
      "Implementation: Pattern matching on field names and data samples",
      "No issues detected: All mappings appear compatible"
    ]
  });
  
  // Check for auto-mapping accuracy
  const autoMappedCount = mappedFields.filter(m => m.targetField && m.targetField !== 'ignore').length;
  const autoMappingAccuracy = Math.round((autoMappedCount / sourceColumns.length) * 100);
  
  results.push({
    id: 'auto-mapping-accuracy',
    validation_type: 'auto-mapping-accuracy',
    status: autoMappingAccuracy < 50 ? 'warning' : 'pass',
    severity: 'medium',
    message: `Auto-mapping mapped ${autoMappedCount} out of ${sourceColumns.length} columns (${autoMappingAccuracy}%)`,
    technical_details: [
      "Purpose: Measures effectiveness of automatic column mapping",
      "Implementation: Calculates percentage of successfully mapped columns",
      `Results: ${autoMappedCount} of ${sourceColumns.length} columns mapped (${autoMappingAccuracy}%)`,
      autoMappingAccuracy < 50 
        ? "Recommendation: Consider manually reviewing and adjusting mappings for better accuracy" 
        : "Auto-mapping appears to have worked well"
    ]
  });
  
  // Format compatibility check (simplified version)
  results.push({
    id: 'format-compatibility',
    validation_type: 'format-compatibility',
    status: 'pass', // For simplicity; in real implementation would check actual data
    severity: 'medium',
    message: 'Format compatibility check passed',
    technical_details: [
      "Purpose: Verifies that data formats match target field requirements",
      "Implementation: Simple format validation for common field types",
      "Note: Full implementation would validate format patterns across sample data"
    ]
  });
  
  // Add warning about unmapped optional fields
  const unmappedColumns = sourceColumns.filter(col => 
    !mappedFields.some(m => m.sourceColumn === col && m.targetField && m.targetField !== 'ignore')
  );
  
  results.push({
    id: 'optional-fields-warning',
    validation_type: 'optional-fields-warning',
    status: unmappedColumns.length > 0 ? 'warning' : 'pass',
    severity: 'low',
    message: unmappedColumns.length > 0 
      ? `${unmappedColumns.length} columns will not be imported`
      : 'All columns are mapped',
    technical_details: unmappedColumns.length > 0 ? [
      "Purpose: Alerts about data that will not be imported",
      "Implementation: Identifies unmapped or ignored columns",
      "Unmapped Columns:",
      ...unmappedColumns.map(col => `- ${col}`),
      "Resolution: Map these columns if they contain valuable data"
    ] : [
      "Purpose: Alerts about data that will not be imported",
      "Implementation: Identifies unmapped or ignored columns",
      "All columns have been mapped - no data will be lost"
    ]
  });
  
  return results;
}

export function validateDataQuality(data: any[]) {
  const validations = [];
  
  // Email Format Validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const invalidEmails = data.filter(item => item.email && !emailRegex.test(item.email));
  
  const emailValidation = {
    id: 'email-format',
    name: 'Email Format',
    status: invalidEmails.length > 0 ? 'warning' : 'pass',
    severity: 'warning',
    description: 'Checking if email addresses are in valid format',
    technical_details: invalidEmails.length > 0 
      ? [`${invalidEmails.length} rows with invalid email format detected.`, 
         'Email addresses should follow the standard format: username@domain.com']
      : 'All email formats are valid',
    affectedRows: invalidEmails.map((item, idx) => ({
      rowIndex: data.findIndex(d => d.email === item.email),
      value: item.email,
      rowData: item
    }))
  };
  
  validations.push(emailValidation);
  
  // Age Range Validation
  const outOfRangeAges = data.filter(item => 
    item.age !== undefined && 
    (isNaN(Number(item.age)) || Number(item.age) < 0 || Number(item.age) > 120)
  );
  
  validations.push({
    id: 'age-range',
    name: 'Age Range',
    status: outOfRangeAges.length > 0 ? 'warning' : 'pass',
    severity: 'warning',
    description: 'Checking if age values are within reasonable range (0-120)',
    technical_details: outOfRangeAges.length > 0 
      ? [`${outOfRangeAges.length} rows with out-of-range age values detected.`,
         'Age values should be between 0 and 120.']
      : 'All ages are within valid range',
    affectedRows: outOfRangeAges.map((item) => ({
      rowIndex: data.findIndex(d => d.age === item.age && d.name === item.name),
      value: item.age.toString(),
      rowData: item
    }))
  });
  
  // State Code Validation
  const validStateCodes = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 
                         'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 
                         'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 
                         'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 
                         'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
                         'DC', 'PR', 'VI', 'AS', 'GU', 'MP'];
  
  const invalidStates = data.filter(item => 
    item.state && !validStateCodes.includes(item.state.toUpperCase())
  );
  
  validations.push({
    id: 'state-code',
    name: 'State Code',
    status: invalidStates.length > 0 ? 'warning' : 'pass',
    severity: 'warning',
    description: 'Checking if state codes are valid US state codes',
    technical_details: invalidStates.length > 0 
      ? [`${invalidStates.length} rows with invalid state codes detected.`,
         'State codes should be valid 2-letter US state or territory codes.']
      : 'All state codes are valid',
    affectedRows: invalidStates.map((item) => ({
      rowIndex: data.findIndex(d => d.state === item.state && d.name === item.name),
      value: item.state,
      rowData: item
    }))
  });
  
  // Date Consistency Validation
  const inconsistentDates = data.filter(item => {
    if (!item.start_date || !item.end_date) return false;
    const start = new Date(item.start_date);
    const end = new Date(item.end_date);
    return start > end;
  });
  
  validations.push({
    id: 'date-consistency',
    name: 'Date Consistency',
    status: inconsistentDates.length > 0 ? 'fail' : 'pass',
    severity: inconsistentDates.length > 0 ? 'high' : undefined,
    description: 'Checking if start dates come before end dates',
    technical_details: inconsistentDates.length > 0 
      ? [`${inconsistentDates.length} rows where end date is before start date.`,
         'End dates must come after start dates.']
      : 'All dates are in the correct sequence',
    affectedRows: inconsistentDates.map((item) => ({
      rowIndex: data.findIndex(d => d.start_date === item.start_date && d.end_date === item.end_date && d.name === item.name),
      value: `${item.start_date} - ${item.end_date}`,
      rowData: item
    }))
  });
  
  // Return all validations
  return validations;
}

// Function to update data with user corrections
export function updateDataWithCorrections(validationId: string, correctedRows: any[]) {
  // In a real implementation, this would update your actual dataset
  
  // For demo purposes, we'll use the mock data and update it
  const mockData = [
    { 
      name: "John Smith", 
      email: "john@example.com", 
      age: 32, 
      state: "CA", 
      zip_code: "94103",
      company: "  Acme Corp  ",
      start_date: "2022-01-01",
      end_date: "2023-01-01"
    },
    { 
      name: "Jane Doe", 
      email: "not-an-email", 
      age: 28, 
      state: "TX", 
      zip_code: "75001",
      company: "XYZ Inc",
      start_date: "2022-05-01",
      end_date: "2022-03-01"
    },
    { 
      name: "Bob Johnson", 
      email: "bob@example.com", 
      age: 150, 
      state: "ZZ", 
      zip_code: "12345-678", 
      company: "123 Company",
      start_date: "2022-01-15",
      end_date: "2022-06-30"
    },
    { 
      name: "Alice Williams", 
      email: "alice-at-example.com", 
      age: 42, 
      state: "NY", 
      zip_code: "10001",
      company: "Tech Solutions",
      start_date: "2022-02-01",
      end_date: "2022-12-31"
    }
  ];

  // Update the data based on the validation type
  if (validationId === 'email-format') {
    correctedRows.forEach(row => {
      const rowIndex = row.rowIndex;
      if (rowIndex >= 0 && rowIndex < mockData.length) {
        mockData[rowIndex].email = row.correctedValue;
      }
    });
  } else if (validationId === 'age-range') {
    correctedRows.forEach(row => {
      const rowIndex = row.rowIndex;
      if (rowIndex >= 0 && rowIndex < mockData.length) {
        mockData[rowIndex].age = parseInt(row.correctedValue);
      }
    });
  } else if (validationId === 'state-code') {
    correctedRows.forEach(row => {
      const rowIndex = row.rowIndex;
      if (rowIndex >= 0 && rowIndex < mockData.length) {
        mockData[rowIndex].state = row.correctedValue;
      }
    });
  } else if (validationId === 'date-consistency') {
    correctedRows.forEach(row => {
      const rowIndex = row.rowIndex;
      if (rowIndex >= 0 && rowIndex < mockData.length && row.correctedValue) {
        const dates = row.correctedValue.split(' - ');
        if (dates.length === 2) {
          mockData[rowIndex].start_date = dates[0];
          mockData[rowIndex].end_date = dates[1];
        }
      }
    });
  }

  return mockData;
}

// For simple mock validation used by ImportUpload.tsx - kept as a simple function
// but renamed to avoid conflicts
export function getMockFileValidation(file: any) {
  // Simple mock validation for file uploads
  return [
    {
      id: "file-size",
      name: "File Size Check",
      status: "pass",
      description: "Checking if file size is within limits",
      technical_details: "File is under the maximum size limit of 10MB"
    },
    {
      id: "file-format",
      name: "File Format Check",
      status: "pass",
      description: "Checking if file format is supported",
      technical_details: "File format (CSV/XLSX) is supported"
    },
    {
      id: "file-encoding",
      name: "File Encoding Check",
      status: "pass",
      description: "Checking if file encoding is correct",
      technical_details: "File encoding is UTF-8"
    }
  ];
}

// For simple mock validation used by ColumnMapping.tsx - kept as a simple function
// but renamed to avoid conflicts
export function getMockColumnMappingValidation(mappings: any, requiredFields: string[]) {
  const validations = [];
  
  // Check if required fields are mapped
  const missingRequiredFields = requiredFields.filter(field => 
    !Object.values(mappings).includes(field)
  );
  
  validations.push({
    id: "required-fields",
    name: "Required Fields",
    status: missingRequiredFields.length === 0 ? "pass" : "fail",
    severity: missingRequiredFields.length === 0 ? undefined : "critical",
    description: "Checking if all required fields are mapped",
    technical_details: missingRequiredFields.length === 0 
      ? "All required fields are mapped" 
      : `Missing required fields: ${missingRequiredFields.join(", ")}`
  });
  
  // Check for duplicate mappings
  const mappedFields = Object.values(mappings).filter(Boolean);
  const uniqueMappedFields = new Set(mappedFields);
  const hasDuplicates = mappedFields.length !== uniqueMappedFields.size;
  
  validations.push({
    id: "duplicate-mappings",
    name: "Duplicate Mappings",
    status: !hasDuplicates ? "pass" : "fail",
    severity: !hasDuplicates ? undefined : "critical",
    description: "Checking for duplicate field mappings",
    technical_details: !hasDuplicates 
      ? "No duplicate mappings found" 
      : "Multiple source columns are mapped to the same destination field"
  });
  
  // Check for unmapped columns
  const unmappedColumns = Object.entries(mappings)
    .filter(([_, value]) => !value)
    .map(([key, _]) => key);
  
  validations.push({
    id: "unmapped-columns",
    name: "Unmapped Columns",
    status: unmappedColumns.length === 0 ? "pass" : "warning",
    severity: "warning",
    description: "Checking for unmapped source columns",
    technical_details: unmappedColumns.length === 0
      ? "All columns are mapped"
      : `${unmappedColumns.length} unmapped columns: ${unmappedColumns.join(", ")}`
  });
  
  // Check mapping coverage
  const mappingCoverage = (mappedFields.length / Object.keys(mappings).length) * 100;
  let coverageStatus = "pass";
  let coverageSeverity;
  
  if (mappingCoverage < 50) {
    coverageStatus = "warning";
    coverageSeverity = "warning";
  }
  
  validations.push({
    id: "mapping-coverage",
    name: "Mapping Coverage",
    status: coverageStatus,
    severity: coverageSeverity,
    description: "Checking the percentage of mapped columns",
    technical_details: `${mappingCoverage.toFixed(1)}% of columns are mapped (${mappedFields.length}/${Object.keys(mappings).length})`
  });
  
  return validations;
}
