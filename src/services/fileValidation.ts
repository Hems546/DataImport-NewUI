
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
          }

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
