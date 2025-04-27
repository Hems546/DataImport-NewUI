import { supabase } from "@/integrations/supabase/client";
import Papa from 'papaparse';
import { getTechnicalDescription } from '@/constants/validations';

export interface FileValidationResult {
  id: string;
  validation_type: string;
  status: 'pass' | 'fail' | 'warning';
  severity: 'critical' | 'warning';
  message: string;
  technical_details?: string;
}

export async function validateFile(file: File): Promise<FileValidationResult[]> {
  const results: FileValidationResult[] = [];
  
  // File size validation (10MB limit)
  const fileSizeResult = {
    id: 'file-size',
    validation_type: 'file-size',
    status: file.size > 10 * 1024 * 1024 ? 'fail' as const : 'pass' as const,
    severity: 'critical' as const,
    message: file.size > 10 * 1024 * 1024 
      ? 'File size exceeds 10MB limit'
      : 'File size is within acceptable limits',
    technical_details: getTechnicalDescription('file-size')
  };
  results.push(fileSizeResult);

  // File type validation
  const allowedTypes = ['.csv', '.xls', '.xlsx'];
  const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
  const fileTypeResult = {
    id: 'file-type',
    validation_type: 'file-type',
    status: !allowedTypes.includes(fileExtension) ? 'fail' as const : 'pass' as const,
    severity: 'critical' as const,
    message: !allowedTypes.includes(fileExtension)
      ? 'Invalid file type. Only CSV and Excel files are supported.'
      : 'File type is supported',
    technical_details: getTechnicalDescription('file-type')
  };
  results.push(fileTypeResult);

  return new Promise((resolve) => {
    // Only attempt to parse CSV files
    if (fileExtension === '.csv') {
      Papa.parse(file, {
        header: true, // Parse the header row
        skipEmptyLines: true,
        complete: async (parseResults) => {
          try {
            if (!parseResults.data || parseResults.data.length === 0) {
              results.push({
                id: 'file-empty',
                validation_type: 'file-empty',
                status: 'fail',
                severity: 'critical',
                message: 'File appears to be empty'
              });
              resolve(results);
              return;
            }

            const headers = parseResults.meta.fields || [];
            
            // Header presence check
            if (!headers || headers.length === 0) {
              results.push({
                id: 'header-presence',
                validation_type: 'header-presence',
                status: 'fail',
                severity: 'critical',
                message: 'No headers found in file'
              });
            } else {
              results.push({
                id: 'header-presence',
                validation_type: 'header-presence',
                status: 'pass',
                severity: 'critical',
                message: 'Headers found in file'
              });
            }

            // Header uniqueness check
            const uniqueHeaders = new Set(headers);
            if (uniqueHeaders.size !== headers.length) {
              results.push({
                id: 'header-uniqueness',
                validation_type: 'header-uniqueness',
                status: 'fail',
                severity: 'critical',
                message: 'Duplicate column headers found'
              });
            } else {
              results.push({
                id: 'header-uniqueness',
                validation_type: 'header-uniqueness',
                status: 'pass',
                severity: 'critical',
                message: 'All column headers are unique'
              });
            }

            // Empty headers check
            if (headers.some(header => !header || header.trim() === '')) {
              results.push({
                id: 'header-blank',
                validation_type: 'header-blank',
                status: 'fail',
                severity: 'critical',
                message: 'Blank or empty column headers found'
              });
            } else {
              results.push({
                id: 'header-blank',
                validation_type: 'header-blank',
                status: 'pass',
                severity: 'critical',
                message: 'No blank column headers found'
              });
            }

            // Row length consistency check
            let inconsistentRows = false;
            const firstRowLength = Object.keys(parseResults.data[0]).length;
            
            for (let i = 1; i < parseResults.data.length; i++) {
              if (Object.keys(parseResults.data[i]).length !== firstRowLength) {
                inconsistentRows = true;
                break;
              }
            }

            if (inconsistentRows) {
              results.push({
                id: 'row-length-consistency',
                validation_type: 'row-length-consistency',
                status: 'fail',
                severity: 'critical',
                message: 'Inconsistent number of columns across rows'
              });
            } else {
              results.push({
                id: 'row-length-consistency',
                validation_type: 'row-length-consistency',
                status: 'pass',
                severity: 'critical',
                message: 'All rows have consistent column count'
              });
            }

            // Try to create import session in Supabase, but don't block validation results if it fails
            try {
              const { data: session, error: sessionError } = await supabase
                .from('import_sessions')
                .insert({
                  original_filename: file.name,
                  session_id: crypto.randomUUID(),
                  row_count: parseResults.data.length,
                  column_count: headers.length,
                  source_columns: headers
                })
                .select()
                .single();

              if (sessionError) {
                console.warn("Failed to save import session:", sessionError);
                // Continue with validation even if session saving fails
              }
            } catch (dbError) {
              console.warn("Error in database operation:", dbError);
              // Proceed with validation results even if DB operation fails
            }

            resolve(results);
          } catch (error) {
            console.error("Validation error:", error);
            // If there's an error in validation, still return what we have so far
            resolve(results);
          }
        },
        error: (error) => {
          console.error("Parse error:", error);
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
    } else {
      // For non-CSV files, we don't have parsing validation yet
      // Future enhancement: Add Excel file parsing and validation
      results.push({
        id: 'format-support',
        validation_type: 'format-support',
        status: 'warning',
        severity: 'warning',
        message: 'Excel files are supported for upload but detailed content validation is limited'
      });
      resolve(results);
    }
  });
}
