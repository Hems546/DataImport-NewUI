
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
              column_count: results.data[0]?.length || 0,
              source_columns: results.data[0]
            })
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
          
          resolve(validations || []);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => reject(error)
    });
  });
}
