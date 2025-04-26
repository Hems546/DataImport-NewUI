// Define the ValidationCategory enum with all required categories
export enum ValidationCategory {
  FILE_UPLOAD = "File Upload",
  VERIFY_FILE = "Verify File",
  COLUMN_MAPPING = "Column Mapping",
  DATA_QUALITY = "Data Quality",
  DATA_NORMALIZATION = "Data Normalization",
  DEDUPLICATION = "Deduplication"
}

// Define the Validation interface to provide type safety
export interface Validation {
  id: string;
  name: string;
  description: string;
  category: ValidationCategory;
  severity?: string;
  type?: string;
  failAction?: string;
}

// Sample validations array with entries for each category
export const validations: Validation[] = [
  // FILE UPLOAD validations
  {
    id: "file-type",
    name: "File Type Check",
    description: "Validates that the uploaded file is in a supported format (CSV, XLS, XLSX).",
    category: ValidationCategory.FILE_UPLOAD,
    severity: "critical",
    type: "format"
  },
  {
    id: "file-size",
    name: "File Size Check",
    description: "Ensures the file is within the allowed size limit (10MB).",
    category: ValidationCategory.FILE_UPLOAD,
    severity: "critical",
    type: "format"
  },
  
  // VERIFY FILE validations (previously FILE_PREFLIGHT)
  {
    id: "has-headers",
    name: "Header Row Check",
    description: "Verifies the file has a proper header row.",
    category: ValidationCategory.VERIFY_FILE,
    severity: "critical",
    type: "structure",
    failAction: "reject"
  },
  {
    id: "min-rows",
    name: "Minimum Row Count",
    description: "Checks if the file has at least 1 data row.",
    category: ValidationCategory.VERIFY_FILE,
    severity: "critical",
    type: "structure"
  },
  
  // COLUMN MAPPING validations
  {
    id: "required-columns",
    name: "Required Columns",
    description: "Verifies that all required columns can be mapped to the source data.",
    category: ValidationCategory.COLUMN_MAPPING,
    severity: "high",
    type: "mapping"
  },
  {
    id: "column-format",
    name: "Column Format",
    description: "Checks that mapped columns match expected data formats.",
    category: ValidationCategory.COLUMN_MAPPING,
    severity: "medium",
    type: "format"
  },
  
  // DATA QUALITY validations
  {
    id: "required-fields",
    name: "Required Fields",
    description: "Validates that all required fields contain values.",
    category: ValidationCategory.DATA_QUALITY,
    severity: "high",
    type: "content"
  },
  {
    id: "email-format",
    name: "Email Format",
    description: "Checks that email addresses have a valid format.",
    category: ValidationCategory.DATA_QUALITY,
    severity: "medium",
    type: "format"
  },
  
  // DATA NORMALIZATION validations
  {
    id: "trim-whitespace",
    name: "Trim Whitespace",
    description: "Automatically removes leading and trailing spaces from text fields.",
    category: ValidationCategory.DATA_NORMALIZATION,
    type: "auto-fix"
  },
  {
    id: "date-format",
    name: "Date Standardization",
    description: "Converts various date formats to a standard format (YYYY-MM-DD).",
    category: ValidationCategory.DATA_NORMALIZATION,
    type: "conversion"
  },
  {
    id: "text-case",
    name: "Text Case Normalization",
    description: "Standardizes case for certain fields (e.g., lower case for emails).",
    category: ValidationCategory.DATA_NORMALIZATION,
    type: "auto-fix"
  },
  
  // DEDUPLICATION validations
  {
    id: "exact-duplicate",
    name: "Exact Duplicate Detection",
    description: "Identifies rows that are exact duplicates of other rows in the import.",
    category: ValidationCategory.DEDUPLICATION,
    severity: "high",
    type: "duplicate"
  },
  {
    id: "key-field-duplicate",
    name: "Key Field Matching",
    description: "Identifies records with matching key fields (e.g., email address).",
    category: ValidationCategory.DEDUPLICATION,
    severity: "medium",
    type: "duplicate"
  },
  {
    id: "fuzzy-matching",
    name: "Fuzzy Name Matching",
    description: "Uses algorithms to find similar names that may be duplicates.",
    category: ValidationCategory.DEDUPLICATION,
    severity: "low",
    type: "duplicate"
  }
];
