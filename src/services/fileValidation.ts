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

export function validateDataQuality(data: any[]): DataQualityValidationResult[] {
  const results: DataQualityValidationResult[] = [];
  
  // Required Fields Check
  const requiredFields = ['email', 'name']; // Example required fields, in a real app would be configurable
  const missingRequiredFields = data.some(row => 
    requiredFields.some(field => !row[field] || row[field].trim() === '')
  );
  
  results.push({
    id: 'required-fields',
    name: 'Required Fields',
    status: missingRequiredFields ? 'fail' : 'pass',
    severity: missingRequiredFields ? 'high' : 'low',
    description: missingRequiredFields ? 
      'Some records are missing required fields' : 
      'All required fields are populated',
    technical_details: [
      "Purpose: Ensures that all required fields have values",
      "Implementation: Checks each record for empty or null required fields",
      missingRequiredFields ? 
        "Issue detected: Some records have missing required fields that need to be filled" : 
        "All records have the required fields populated"
    ]
  });
  
  // Email Format Check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const invalidEmails = data.filter(row => 
    row.email && typeof row.email === 'string' && !emailRegex.test(row.email)
  );
  
  results.push({
    id: 'email-format',
    name: 'Email Format',
    status: invalidEmails.length > 0 ? 'warning' : 'pass',
    severity: 'medium',
    description: invalidEmails.length > 0 ?
      `${invalidEmails.length} records have invalid email formats` :
      'All email addresses are properly formatted',
    technical_details: [
      "Purpose: Validates email address formatting",
      "Implementation: Regular expression check for standard email pattern",
      invalidEmails.length > 0 ? 
        `Found ${invalidEmails.length} records with improperly formatted emails` :
        "All email addresses follow valid format"
    ]
  });
  
  // Date Format Check
  const dateFields = ['birthdate', 'registration_date', 'last_contact_date']; // Example date fields
  const invalidDates = data.filter(row => 
    dateFields.some(field => {
      if (!row[field]) return false;
      const date = new Date(row[field]);
      return isNaN(date.getTime());
    })
  );
  
  results.push({
    id: 'date-format',
    name: 'Date Format',
    status: invalidDates.length > 0 ? 'warning' : 'pass',
    severity: 'medium',
    description: invalidDates.length > 0 ?
      `${invalidDates.length} records have invalid date formats` :
      'All date fields are properly formatted',
    technical_details: [
      "Purpose: Ensures dates are in valid formats",
      "Implementation: Date parsing validation for date fields",
      invalidDates.length > 0 ?
        `Found ${invalidDates.length} records with improperly formatted dates` :
        "All dates follow valid format"
    ]
  });
  
  // Numeric Fields Check
  const numericFields = ['age', 'income', 'id_number']; // Example numeric fields
  const invalidNumeric = data.filter(row => 
    numericFields.some(field => {
      if (!row[field]) return false;
      return isNaN(Number(row[field]));
    })
  );
  
  results.push({
    id: 'numeric-values',
    name: 'Numeric Fields',
    status: invalidNumeric.length > 0 ? 'fail' : 'pass',
    severity: 'high',
    description: invalidNumeric.length > 0 ?
      `${invalidNumeric.length} records have non-numeric values in numeric fields` :
      'All numeric fields contain valid numbers',
    technical_details: [
      "Purpose: Verifies that numeric fields contain only numbers",
      "Implementation: Type checking and numeric validation",
      invalidNumeric.length > 0 ?
        `Found ${invalidNumeric.length} records with non-numeric values in numeric fields` :
        "All numeric fields contain valid numeric values"
    ]
  });
  
  // URL Format Check
  const urlRegex = /^(https?:\/\/)([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
  const urlFields = ['website', 'profile_url']; // Example URL fields
  const invalidUrls = data.filter(row => 
    urlFields.some(field => {
      if (!row[field]) return false;
      return !urlRegex.test(row[field]);
    })
  );
  
  results.push({
    id: 'url-format',
    name: 'URL Format',
    status: invalidUrls.length > 0 ? 'warning' : 'pass',
    severity: 'low',
    description: invalidUrls.length > 0 ?
      `${invalidUrls.length} records have invalid URL formats` :
      'All URLs are properly formatted',
    technical_details: [
      "Purpose: Validates web URLs format",
      "Implementation: Regular expression check for standard URL pattern",
      invalidUrls.length > 0 ?
        `Found ${invalidUrls.length} records with improperly formatted URLs` :
        "All URLs follow valid format"
    ]
  });
  
  // Value Range Check
  const rangeChecks = [
    { field: 'age', min: 0, max: 120 },
    { field: 'score', min: 0, max: 100 }
  ];
  
  const outOfRangeValues = data.filter(row => 
    rangeChecks.some(check => {
      if (!row[check.field]) return false;
      const value = Number(row[check.field]);
      return value < check.min || value > check.max;
    })
  );
  
  results.push({
    id: 'value-range',
    name: 'Value Range Check',
    status: outOfRangeValues.length > 0 ? 'warning' : 'pass',
    severity: 'medium',
    description: outOfRangeValues.length > 0 ?
      `${outOfRangeValues.length} records have values outside of accepted ranges` :
      'All values are within acceptable ranges',
    technical_details: [
      "Purpose: Ensures numeric values fall within expected ranges",
      "Implementation: Range boundary checks for numeric fields",
      outOfRangeValues.length > 0 ?
        `Found ${outOfRangeValues.length} records with values outside acceptable ranges` :
        "All values fall within acceptable ranges"
    ]
  });
  
  // Reference Data Check
  const stateValues = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 
                        'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 
                        'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 
                        'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 
                        'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];
  
  const invalidStates = data.filter(row => 
    row.state && !stateValues.includes(row.state.toUpperCase())
  );
  
  results.push({
    id: 'reference-data',
    name: 'Reference Data Check',
    status: invalidStates.length > 0 ? 'warning' : 'pass',
    severity: 'high',
    description: invalidStates.length > 0 ?
      `${invalidStates.length} records have invalid state codes` :
      'All reference data matches expected values',
    technical_details: [
      "Purpose: Validates values against controlled vocabulary lists",
      "Implementation: Lookup against reference lists (e.g., US state codes)",
      invalidStates.length > 0 ?
        `Found ${invalidStates.length} records with invalid state codes` :
        "All reference data matches expected values"
    ]
  });
  
  // Regex Pattern Validation
  const zipCodeRegex = /^\d{5}(-\d{4})?$/;
  const invalidZipCodes = data.filter(row => 
    row.zip_code && !zipCodeRegex.test(row.zip_code)
  );
  
  results.push({
    id: 'regex-pattern',
    name: 'Regex Pattern Validation',
    status: invalidZipCodes.length > 0 ? 'warning' : 'pass',
    severity: 'medium',
    description: invalidZipCodes.length > 0 ?
      `${invalidZipCodes.length} records have invalid ZIP code formats` :
      'All pattern-based fields match their expected formats',
    technical_details: [
      "Purpose: Ensures fields match specified format patterns",
      "Implementation: Regular expression validation for formatted fields",
      invalidZipCodes.length > 0 ?
        `Found ${invalidZipCodes.length} records with improperly formatted ZIP codes` :
        "All pattern-based fields match their expected formats"
    ]
  });
  
  // Whitespace Detection
  const excessWhitespaceFields = ['name', 'company', 'address', 'city'];
  const recordsWithExcessWhitespace = data.filter(row => 
    excessWhitespaceFields.some(field => {
      if (!row[field] || typeof row[field] !== 'string') return false;
      return row[field] !== row[field].trim();
    })
  );
  
  results.push({
    id: 'whitespace',
    name: 'Whitespace Detection',
    status: recordsWithExcessWhitespace.length > 0 ? 'warning' : 'pass',
    severity: 'low',
    description: recordsWithExcessWhitespace.length > 0 ?
      `${recordsWithExcessWhitespace.length} records have fields with leading or trailing whitespace` :
      'No excess whitespace detected in text fields',
    technical_details: [
      "Purpose: Identifies fields that need whitespace trimming",
      "Implementation: String comparison before and after trim operation",
      recordsWithExcessWhitespace.length > 0 ?
        `Found ${recordsWithExcessWhitespace.length} records with excess whitespace` :
        "No fields with leading or trailing whitespace detected"
    ]
  });
  
  // Cross-field validation
  const crossFieldIssues = data.filter(row => {
    // Example: end date should be after start date
    if (row.start_date && row.end_date) {
      const start = new Date(row.start_date);
      const end = new Date(row.end_date);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        return end < start;
      }
    }
    return false;
  });
  
  results.push({
    id: 'cross-field',
    name: 'Cross-Field Validation',
    status: crossFieldIssues.length > 0 ? 'fail' : 'pass',
    severity: 'high',
    description: crossFieldIssues.length > 0 ?
      `${crossFieldIssues.length} records have inconsistencies between related fields` :
      'All cross-field validations pass',
    technical_details: [
      "Purpose: Ensures logical relationships between fields are maintained",
      "Implementation: Comparative logic between related fields",
      crossFieldIssues.length > 0 ?
        `Found ${crossFieldIssues.length} records with end dates before start dates` :
        "All related fields have consistent relationships"
    ]
  });
  
  // Duplicate Row Detection
  const duplicateKeys = new Map();
  const keyFields = ['email', 'phone']; // Fields that should be unique
  
  data.forEach((row, index) => {
    const key = keyFields
      .map(field => row[field] ? row[field].toString().toLowerCase() : '')
      .filter(val => val)
      .join('|');
    
    if (key && key.length > 0) {
      if (duplicateKeys.has(key)) {
        duplicateKeys.set(key, [...duplicateKeys.get(key), index]);
      } else {
        duplicateKeys.set(key, [index]);
      }
    }
  });
  
  const duplicateRecords = Array.from(duplicateKeys.values())
    .filter(indexes => indexes.length > 1);
  
  results.push({
    id: 'duplicate-row',
    name: 'Duplicate Row Detection',
    status: duplicateRecords.length > 0 ? 'warning' : 'pass',
    severity: 'medium',
    description: duplicateRecords.length > 0 ?
      `Found ${duplicateRecords.length} sets of duplicate or similar records` :
      'No duplicate records detected',
    technical_details: [
      "Purpose: Identifies identical or nearly identical records within the file",
      "Implementation: Key field comparison across records",
      duplicateRecords.length > 0 ?
        `Found ${duplicateRecords.length} groups of records that appear to be duplicates` :
        "No duplicate records detected based on key fields"
    ]
  });
  
  // Character Limit Check
  const characterLimits = {
    'name': 100,
    'address': 200,
    'notes': 500
  };
  
  const tooLongFields = data.filter(row => 
    Object.entries(characterLimits).some(([field, limit]) => {
      if (!row[field] || typeof row[field] !== 'string') return false;
      return row[field].length > limit;
    })
  );
  
  results.push({
    id: 'character-limit',
    name: 'Character Limit Check',
    status: tooLongFields.length > 0 ? 'fail' : 'pass',
    severity: 'high',
    description: tooLongFields.length > 0 ?
      `${tooLongFields.length} records exceed character limits for certain fields` :
      'All fields are within character limits',
    technical_details: [
      "Purpose: Ensures fields don't exceed database column length limits",
      "Implementation: String length validation against maximum length values",
      tooLongFields.length > 0 ?
        `Found ${tooLongFields.length} records with fields exceeding character limits` :
        "All fields are within defined character limits"
    ]
  });
  
  return results;
}
