
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
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      complete: async (results) => {
        try {
          // Create an import session
          const { data: session, error: sessionError } = await supabase
            .from('import_sessions')
            .insert({
              original_filename: file.name,
              session_id: crypto.randomUUID(),
              row_count: results.data.length,
              column_count: results.data[0] ? (results.data[0] as any[]).length : 0,
              // Cast source_columns to a JSON compatible format
              source_columns: results.data[0] || []
            } as any)
            .select()
            .single();

          if (sessionError) throw sessionError;

          // Call the header validation function
          const headers = results.data[0] as string[];
          await supabase.rpc('validate_file_headers', {
            p_headers: headers,
            p_import_session_id: session.id
          });

          // Fetch validation results
          const { data: validations, error: validationError } = await supabase
            .from('file_validations')
            .select('*')
            .eq('import_session_id', session.id);

          if (validationError) throw validationError;
          
          // Map database results to our FileValidationResult type
          const typedValidations: FileValidationResult[] = (validations || []).map(validation => ({
            id: validation.id,
            validation_type: validation.validation_type,
            status: validation.status as 'pass' | 'fail' | 'warning',
            severity: validation.severity as 'critical' | 'warning',
            message: validation.message
          }));
          
          resolve(typedValidations);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => reject(error)
    });
  });
}
