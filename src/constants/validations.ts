
// Validation categories based on when they should be performed

export type Validation = {
  id: string;
  category: ValidationCategory;
  name: string;
  description: string;
};

export enum ValidationCategory {
  FILE_PREFLIGHT = "File Preflight",
  DATA_VALIDATION = "Data Validation",
  FIELD_MAPPING = "Field Mapping",
  DEDUPLICATION = "Deduplication"
}

export const validations: Validation[] = [
  // FILE PREFLIGHT validations (critical issues that require a new file upload)
  {
    id: "file-format",
    category: ValidationCategory.FILE_PREFLIGHT,
    name: "File Format Check",
    description: "Verifies the file is in a supported format (CSV, XLS, XLSX)"
  },
  {
    id: "file-size",
    category: ValidationCategory.FILE_PREFLIGHT,
    name: "File Size Check",
    description: "Ensures the file size is within acceptable limits"
  },
  {
    id: "file-encoding",
    category: ValidationCategory.FILE_PREFLIGHT,
    name: "File Encoding Check",
    description: "Validates that the file uses a supported character encoding (e.g., UTF-8)"
  },
  {
    id: "header-row",
    category: ValidationCategory.FILE_PREFLIGHT,
    name: "Header Row Check",
    description: "Confirms the presence of a header row with column names"
  },
  {
    id: "required-columns",
    category: ValidationCategory.FILE_PREFLIGHT,
    name: "Required Columns Check",
    description: "Verifies all required columns are present in the file"
  },
  {
    id: "empty-file",
    category: ValidationCategory.FILE_PREFLIGHT,
    name: "Empty File Check",
    description: "Ensures the file contains data beyond the header row"
  },
  {
    id: "corrupt-file",
    category: ValidationCategory.FILE_PREFLIGHT,
    name: "Corrupt File Check",
    description: "Detects if the file is corrupted or unreadable"
  },
  {
    id: "column-count",
    category: ValidationCategory.FILE_PREFLIGHT,
    name: "Column Count Consistency",
    description: "Checks if all rows have the same number of columns"
  },
  
  // DATA VALIDATION checks (issues that can be fixed within the app)
  {
    id: "data-type",
    category: ValidationCategory.DATA_VALIDATION,
    name: "Data Type Validation",
    description: "Ensures data matches expected types (numbers, dates, text, etc.)"
  },
  {
    id: "data-range",
    category: ValidationCategory.DATA_VALIDATION,
    name: "Data Range Validation",
    description: "Validates that numeric values fall within acceptable ranges"
  },
  {
    id: "date-format",
    category: ValidationCategory.DATA_VALIDATION,
    name: "Date Format Validation",
    description: "Checks that dates match required format patterns"
  },
  {
    id: "email-format",
    category: ValidationCategory.DATA_VALIDATION,
    name: "Email Format Validation",
    description: "Verifies email addresses follow standard format"
  },
  {
    id: "phone-format",
    category: ValidationCategory.DATA_VALIDATION,
    name: "Phone Number Format",
    description: "Validates phone numbers match expected patterns"
  },
  {
    id: "missing-values",
    category: ValidationCategory.DATA_VALIDATION,
    name: "Missing Values Check",
    description: "Identifies required fields with missing values"
  },
  {
    id: "character-limit",
    category: ValidationCategory.DATA_VALIDATION,
    name: "Character Limit Check",
    description: "Ensures text fields don't exceed maximum allowed length"
  },
  {
    id: "special-characters",
    category: ValidationCategory.DATA_VALIDATION,
    name: "Special Characters Check",
    description: "Identifies potentially problematic special characters"
  },
  {
    id: "regex-pattern",
    category: ValidationCategory.DATA_VALIDATION,
    name: "Pattern Matching",
    description: "Validates data against custom regular expression patterns"
  },
  {
    id: "whitespace",
    category: ValidationCategory.DATA_VALIDATION,
    name: "Whitespace Check",
    description: "Detects unnecessary leading/trailing whitespace"
  },
  {
    id: "case-consistency",
    category: ValidationCategory.DATA_VALIDATION,
    name: "Case Consistency",
    description: "Checks for consistent letter case in categorical fields"
  },
  {
    id: "url-format",
    category: ValidationCategory.DATA_VALIDATION,
    name: "URL Format Validation",
    description: "Validates URLs follow correct format"
  },
  {
    id: "foreign-key",
    category: ValidationCategory.DATA_VALIDATION,
    name: "Foreign Key Validation",
    description: "Ensures values reference existing entities in other datasets"
  },
  {
    id: "json-validation",
    category: ValidationCategory.DATA_VALIDATION,
    name: "JSON Structure Validation",
    description: "Validates JSON fields have correct structure"
  },
  {
    id: "enumeration",
    category: ValidationCategory.DATA_VALIDATION,
    name: "Enumeration Check",
    description: "Verifies values belong to a predefined set of allowed values"
  },
  
  // FIELD MAPPING checks
  {
    id: "column-mapping",
    category: ValidationCategory.FIELD_MAPPING,
    name: "Column Mapping Verification",
    description: "Ensures all required destination fields are mapped to source columns"
  },
  {
    id: "header-synonyms",
    category: ValidationCategory.FIELD_MAPPING,
    name: "Header Synonym Recognition",
    description: "Identifies common variations of column headers to suggest mappings"
  },
  {
    id: "data-transformation",
    category: ValidationCategory.FIELD_MAPPING,
    name: "Transformation Compatibility",
    description: "Validates that data can be successfully transformed to target format"
  },
  {
    id: "multi-column-mapping",
    category: ValidationCategory.FIELD_MAPPING,
    name: "Multi-column Mapping Check",
    description: "Verifies correct mapping when destination fields require multiple source columns"
  },
  {
    id: "field-combination",
    category: ValidationCategory.FIELD_MAPPING,
    name: "Field Combination Validation",
    description: "Ensures fields that should be used together are properly mapped"
  },
  
  // DEDUPLICATION checks
  {
    id: "exact-duplicates",
    category: ValidationCategory.DEDUPLICATION,
    name: "Exact Duplicate Detection",
    description: "Identifies rows that are completely identical"
  },
  {
    id: "fuzzy-duplicates",
    category: ValidationCategory.DEDUPLICATION,
    name: "Fuzzy Duplicate Detection",
    description: "Finds likely duplicates with minor differences (spelling, capitalization, etc.)"
  },
  {
    id: "key-field-duplicates",
    category: ValidationCategory.DEDUPLICATION,
    name: "Key Field Duplicate Check",
    description: "Detects duplicates based on specific key fields (e.g., email, ID)"
  },
  {
    id: "cross-file-duplicates",
    category: ValidationCategory.DEDUPLICATION,
    name: "Cross-file Duplicate Check",
    description: "Identifies duplicates between the imported file and existing data"
  },
  {
    id: "partial-duplicates", 
    category: ValidationCategory.DEDUPLICATION,
    name: "Partial Duplicate Detection",
    description: "Finds records that may be partial duplicates (same person, different addresses)"
  },
  {
    id: "time-based-duplicates",
    category: ValidationCategory.DEDUPLICATION,
    name: "Time-based Duplicate Analysis",
    description: "Identifies potential duplicates with date/time differences"
  }
];
