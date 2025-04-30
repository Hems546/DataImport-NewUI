
import { ValidationCategory, validations } from '@/constants/validations';
import { validateFile, validateColumnMappings, validateDataQuality } from './fileValidation';

export interface ValidationExecutionResult {
  id: string;
  name: string;
  status: 'pending' | 'pass' | 'fail' | 'warning';
  description?: string;
  severity?: string;
  technical_details?: string | string[];
  affectedRows?: { rowIndex: number; value: string; rowData?: Record<string, any> }[];
}

/**
 * Runs validations for a specific stage of the import process
 * @param stage The validation category to run
 * @param data The data to validate (file, mapping config, etc.)
 * @returns Promise with validation results
 */
export async function runValidationsForStage(
  stage: ValidationCategory, 
  data: any
): Promise<ValidationExecutionResult[]> {
  
  // Get all validations for this stage
  const stageValidations = validations.filter(validation => validation.category === stage);
  
  if (stageValidations.length === 0) {
    console.warn(`No validations defined for stage: ${stage}`);
    return [];
  }

  // Execute appropriate validation functions based on the stage
  switch(stage) {
    case ValidationCategory.FILE_UPLOAD: {
      // File upload validations use the validateFile function
      const results = await validateFile(data, false);
      // Convert to expected return type
      return results.map(r => ({
        id: r.id,
        name: r.validation_type,
        status: r.status,
        severity: r.severity,
        description: r.message,
        technical_details: r.technical_details
      }));
    }
      
    case ValidationCategory.VERIFY_FILE: {
      // File verification uses the same validateFile function but focuses on structure
      const results = await validateFile(data, true);
      // Convert to expected return type
      return results.map(r => ({
        id: r.id,
        name: r.validation_type,
        status: r.status,
        severity: r.severity,
        description: r.message,
        technical_details: r.technical_details
      }));
    }
      
    case ValidationCategory.COLUMN_MAPPING: {
      // For column mapping, we assume data contains source columns and mapping config
      if (!data.sourceColumns || !data.mappings) {
        throw new Error('Invalid data for column mapping validation');
      }
      const results = validateColumnMappings(data.sourceColumns, data.mappings, data.requiredFields || []);
      // Convert to expected return type
      return results.map(r => ({
        id: r.id,
        name: r.validation_type,
        status: r.status,
        severity: r.severity,
        description: r.message,
        technical_details: r.technical_details
      }));
    }
      
    case ValidationCategory.DATA_QUALITY:
      // For data quality, we expect actual data rows
      return validateDataQuality(data);
      
    case ValidationCategory.DATA_NORMALIZATION:
      // Mock normalization validations for now
      return stageValidations.map(validation => ({
        id: validation.id,
        name: validation.name,
        status: 'pass', // Default to pass for now
        description: validation.description,
        severity: validation.severity,
        technical_details: `Data normalization check: ${validation.name}`
      }));
      
    case ValidationCategory.DEDUPLICATION:
      // Mock deduplication validations for now
      return stageValidations.map(validation => ({
        id: validation.id,
        name: validation.name,
        status: 'pass', // Default to pass for now
        description: validation.description,
        severity: validation.severity,
        technical_details: `Deduplication check: ${validation.name}`
      }));
      
    case ValidationCategory.FINAL_REVIEW:
      // Mock final review validations for now
      return stageValidations.map(validation => ({
        id: validation.id,
        name: validation.name,
        status: 'pass', // Default to pass for now
        description: validation.description,
        severity: validation.severity,
        technical_details: `Final review check: ${validation.name}`
      }));
      
    case ValidationCategory.IMPORT_PUSH:
      // Mock import/push validations for now
      return stageValidations.map(validation => ({
        id: validation.id,
        name: validation.name,
        status: 'pass', // Default to pass for now
        description: validation.description,
        severity: validation.severity,
        technical_details: `Import/push check: ${validation.name}`
      }));
      
    default:
      console.warn(`Unknown validation stage: ${stage}`);
      return [];
  }
}

/**
 * Gets a list of validation IDs for a specific stage
 * @param stage The validation category
 * @returns Array of validation IDs
 */
export function getValidationIdsForStage(stage: ValidationCategory): string[] {
  return validations
    .filter(validation => validation.category === stage)
    .map(validation => validation.id);
}

/**
 * Checks if all validations for a stage pass
 * @param results Validation results to check
 * @param ignoreSeverity If true, warnings will be considered passing
 * @returns boolean indicating if all validations pass
 */
export function allValidationsPass(
  results: ValidationExecutionResult[], 
  ignoreSeverity: 'warning' | 'none' = 'warning'
): boolean {
  return results.every(result => {
    if (result.status === 'pass') return true;
    if (result.status === 'warning' && ignoreSeverity === 'warning') return true;
    return false;
  });
}
