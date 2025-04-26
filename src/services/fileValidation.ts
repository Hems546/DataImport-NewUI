
import { supabase } from "@/integrations/supabase/client";
import Papa from 'papaparse';

export interface FileValidationResult {
  id: string;
  validation_type: string;
  status: 'pass' | 'fail' | 'warning';
  severity: 'critical' | 'warning';
  message: string;
}

export async function validateFile(file: File): Promise<FileValidationResult[]> {
  const results: FileValidationResult[] = [];
  
  // File size validation (10MB limit)
  if (file.size > 10 * 1024 * 1024) {
    results.push({
      id: 'file-size',
      validation_type: 'file-size',
      status: 'fail',
      severity: 'critical',
      message: 'File size exceeds 10MB limit'
    });
  } else {
    results.push({
      id: 'file-size',
      validation_type: 'file-size',
      status: 'pass',
      severity: 'critical',
      message: 'File size is within acceptable limits'
    });
  }

  // File type validation
  const allowedTypes = ['.csv', '.xls', '.xlsx'];
  const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
  if (!allowedTypes.includes(fileExtension)) {
    results.push({
      id: 'file-type',
      validation_type: 'file-type',
      status: 'fail',
      severity: 'critical',
      message: 'Invalid file type. Only CSV and Excel files are supported.'
    });
  } else {
    results.push({
      id: 'file-type',
      validation_type: 'file-type',
      status: 'pass',
      severity: 'critical',
      message: 'File type is supported'
    });
  }

  return new Promise((resolve, reject) => {
    Papa.parse(file, {
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

          const headers = parseResults.data[0] as string[];
          
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
          const rowLengths = parseResults.data.map(row => (row as string[]).length);
          const inconsistentRows = rowLengths.some(length => length !== headers.length);
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

          // Create import session in Supabase
          const { data: session, error: sessionError } = await supabase
            .from('import_sessions')
            .insert({
              original_filename: file.name,
              session_id: crypto.randomUUID(),
              row_count: parseResults.data.length,
              column_count: headers.length,
              source_columns: headers
            } as any)
            .select()
            .single();

          if (sessionError) throw sessionError;

          resolve(results);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => reject(error)
    });
  });
}
