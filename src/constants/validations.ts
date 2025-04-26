
// Update the ValidationCategory enum
export enum ValidationCategory {
  FILE_UPLOAD = "File Upload",
  VERIFY_FILE = "Verify File", // Changed from FILE_PREFLIGHT
  COLUMN_MAPPING = "Column Mapping",
  DATA_QUALITY = "Data Quality",
  DATA_NORMALIZATION = "Data Normalization",
  DEDUPLICATION = "Deduplication"
}

// Update all validations with FILE_PREFLIGHT category to use VERIFY_FILE
export const validations: Validation[] = validations.map(validation => 
  validation.category === ValidationCategory.FILE_PREFLIGHT 
    ? { ...validation, category: ValidationCategory.VERIFY_FILE }
    : validation
);
