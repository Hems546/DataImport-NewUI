// Define the ValidationCategory enum with all required categories
export enum ValidationCategory {
  FILE_UPLOAD = "File Upload",
  VERIFY_FILE = "File Preflighting",
  COLUMN_MAPPING = "Column Mapping",
  DATA_QUALITY = "Data Quality",
  DATA_NORMALIZATION = "Data Normalization",
  DEDUPLICATION = "Deduplication",
  FINAL_REVIEW = "Final Review & Approval",
  IMPORT_PUSH = "Import / Push to Target System"
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
    name: "File Format Check",
    description: "Validates that the uploaded file is in a supported format (CSV, XLS, XLSX, TSV).",
    category: ValidationCategory.FILE_UPLOAD,
    severity: "critical",
    type: "format",
    failAction: "reject"
  },
  {
    id: "file-size",
    name: "File Size Limit",
    description: "Ensures the file is within the allowed size limit (50MB).",
    category: ValidationCategory.FILE_UPLOAD,
    severity: "critical",
    type: "format",
    failAction: "reject"
  },
  {
    id: "file-encoding",
    name: "Character Encoding",
    description: "Verifies the file uses proper character encoding (UTF-8 preferred).",
    category: ValidationCategory.FILE_UPLOAD,
    severity: "high",
    type: "format",
    failAction: "warn"
  },
  {
    id: "file-corruption",
    name: "File Integrity Check",
    description: "Detects if the file is corrupted or unreadable.",
    category: ValidationCategory.FILE_UPLOAD,
    severity: "critical",
    type: "format",
    failAction: "reject"
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
    id: "auto-mapping-accuracy",
    name: "Auto-Mapping Accuracy",
    description: "System attempts to intelligently map columns based on name similarity using fuzzy matching algorithms.",
    category: ValidationCategory.COLUMN_MAPPING,
    severity: "medium",
    type: "mapping",
    failAction: "warn"
  },
  {
    id: "required-columns",
    name: "Required Fields Mapping",
    description: "Verifies that all required target fields have been mapped to source columns.",
    category: ValidationCategory.COLUMN_MAPPING,
    severity: "critical",
    type: "mapping",
    failAction: "reject"
  },
  {
    id: "duplicate-mapping",
    name: "Duplicate Mapping Prevention",
    description: "Prevents mapping multiple source columns to the same target field unless explicitly allowed.",
    category: ValidationCategory.COLUMN_MAPPING,
    severity: "high",
    type: "mapping",
    failAction: "reject"
  },
  {
    id: "field-type-compatibility",
    name: "Field Type Compatibility",
    description: "Ensures mapped columns match their target fields' expected data types (e.g., dates to date fields, numbers to numeric fields).",
    category: ValidationCategory.COLUMN_MAPPING,
    severity: "critical",
    type: "format",
    failAction: "reject"
  },
  
  // DATA QUALITY validations
  {
    id: "required-fields",
    name: "Required Fields",
    description: "Validates that all required fields contain values.",
    category: ValidationCategory.DATA_QUALITY,
    severity: "high",
    type: "content",
    failAction: "reject"
  },
  {
    id: "email-format",
    name: "Email Format",
    description: "Checks that email addresses have a valid format with @ symbol and valid domain.",
    category: ValidationCategory.DATA_QUALITY,
    severity: "medium",
    type: "format",
    failAction: "warn"
  },
  {
    id: "date-format",
    name: "Date Format",
    description: "Validates date fields are in the correct format (e.g., MM/DD/YYYY).",
    category: ValidationCategory.DATA_QUALITY,
    severity: "medium",
    type: "format",
    failAction: "warn"
  },
  {
    id: "numeric-values",
    name: "Numeric Fields",
    description: "Ensures numeric fields contain only valid numbers.",
    category: ValidationCategory.DATA_QUALITY,
    severity: "high",
    type: "format",
    failAction: "reject"
  },
  {
    id: "url-format",
    name: "URL Format",
    description: "Verifies that URL fields contain properly formatted web addresses.",
    category: ValidationCategory.DATA_QUALITY,
    severity: "low",
    type: "format",
    failAction: "warn"
  },
  {
    id: "value-range",
    name: "Value Range Check",
    description: "Checks that numeric values fall within acceptable ranges (e.g., age cannot be negative).",
    category: ValidationCategory.DATA_QUALITY,
    severity: "medium",
    type: "content",
    failAction: "warn"
  },
  {
    id: "reference-data",
    name: "Reference Data Check",
    description: "Validates values against controlled vocabularies (e.g., state codes match U.S. states list).",
    category: ValidationCategory.DATA_QUALITY,
    severity: "high",
    type: "content",
    failAction: "warn"
  },
  {
    id: "regex-pattern",
    name: "Regex Pattern Validation",
    description: "Checks that fields match specified patterns (e.g., ZIP codes = 5 digits or 5+4 format).",
    category: ValidationCategory.DATA_QUALITY,
    severity: "medium",
    type: "format",
    failAction: "warn"
  },
  {
    id: "whitespace",
    name: "Whitespace Detection",
    description: "Flags fields with leading or trailing spaces that may need trimming.",
    category: ValidationCategory.DATA_QUALITY,
    severity: "low",
    type: "format",
    failAction: "auto-fix"
  },
  {
    id: "multi-value",
    name: "Multi-value Field Check",
    description: "Validates separator characters in multi-value fields (e.g., tags separated by commas).",
    category: ValidationCategory.DATA_QUALITY,
    severity: "low",
    type: "format",
    failAction: "warn"
  },
  {
    id: "cross-field",
    name: "Cross-Field Validation",
    description: "Checks relationships between fields (e.g., End Date must be after Start Date).",
    category: ValidationCategory.DATA_QUALITY,
    severity: "high",
    type: "content",
    failAction: "reject"
  },
  {
    id: "duplicate-row",
    name: "Duplicate Row Detection",
    description: "Flags identical or nearly identical rows within the imported file.",
    category: ValidationCategory.DATA_QUALITY,
    severity: "medium",
    type: "duplicate",
    failAction: "warn"
  },
  
  // DATA NORMALIZATION validations
  {
    id: "trim-whitespace",
    name: "Trim Whitespace",
    description: "Automatically removes leading and trailing spaces from text fields.",
    category: ValidationCategory.DATA_NORMALIZATION,
    type: "auto-fix",
    severity: "low",
    failAction: "auto-fix"
  },
  {
    id: "text-case",
    name: "Text Case Normalization",
    description: "Standardizes case for certain fields (e.g., Title Case for names, lowercase for emails).",
    category: ValidationCategory.DATA_NORMALIZATION,
    type: "auto-fix",
    severity: "low",
    failAction: "auto-fix"
  },
  {
    id: "date-standardization",
    name: "Date Format Standardization",
    description: "Converts various date formats to ISO standard (YYYY-MM-DD).",
    category: ValidationCategory.DATA_NORMALIZATION,
    type: "conversion",
    severity: "medium",
    failAction: "auto-fix"
  },
  {
    id: "phone-format",
    name: "Phone Number Formatting",
    description: "Standardizes phone numbers to E.164 international format.",
    category: ValidationCategory.DATA_NORMALIZATION,
    type: "auto-fix",
    severity: "low",
    failAction: "auto-fix"
  },
  {
    id: "email-lowercase",
    name: "Email Case Normalization",
    description: "Converts all email addresses to lowercase for consistency.",
    category: ValidationCategory.DATA_NORMALIZATION,
    type: "auto-fix",
    severity: "low",
    failAction: "auto-fix"
  },
  {
    id: "location-names",
    name: "Location Name Standardization",
    description: "Normalizes country and state names to standard formats (e.g., 'USA' to 'United States').",
    category: ValidationCategory.DATA_NORMALIZATION,
    type: "conversion",
    severity: "medium",
    failAction: "auto-fix"
  },
  {
    id: "auto-correct",
    name: "Auto-correction Rules",
    description: "Applies predefined rules to automatically correct known common errors.",
    category: ValidationCategory.DATA_NORMALIZATION,
    type: "auto-fix",
    severity: "low",
    failAction: "auto-fix"
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
  },
  {
    id: "standardized-match",
    name: "Standardized Field Matching",
    description: "Matches records after normalizing case, whitespace, and punctuation.",
    category: ValidationCategory.DEDUPLICATION,
    severity: "medium",
    type: "duplicate"
  },
  {
    id: "phonetic-matching",
    name: "Phonetic Similarity Detection",
    description: "Finds records where names sound similar (e.g., Smith vs. Smyth).",
    category: ValidationCategory.DEDUPLICATION,
    severity: "low",
    type: "duplicate"
  },
  {
    id: "cross-field-matching",
    name: "Cross-Field Duplicate Detection",
    description: "Identifies potential duplicates by matching across multiple fields (e.g., name + address).",
    category: ValidationCategory.DEDUPLICATION,
    severity: "medium",
    type: "duplicate"
  },
  {
    id: "name-nickname-matching",
    name: "Name/Nickname Resolution",
    description: "Matches records where one has a formal name and another uses a nickname (e.g., William vs. Bill).",
    category: ValidationCategory.DEDUPLICATION,
    severity: "low",
    type: "duplicate"
  },
  {
    id: "email-domain-matching", 
    name: "Username + Email Domain Matching",
    description: "Identifies similar email patterns that may indicate the same person (john.smith@example.com vs jsmith@example.com).",
    category: ValidationCategory.DEDUPLICATION,
    severity: "medium",
    type: "duplicate"
  },
  {
    id: "address-normalization-matching",
    name: "Normalized Address Matching",
    description: "Matches addresses after standardizing formats (e.g., 'Street' vs 'St.', 'Avenue' vs 'Ave').",
    category: ValidationCategory.DEDUPLICATION,
    severity: "medium",
    type: "duplicate"
  },
  {
    id: "company-name-matching",
    name: "Company Name Variant Matching",
    description: "Identifies company names that refer to the same entity with different formats (IBM Corp vs International Business Machines).",
    category: ValidationCategory.DEDUPLICATION,
    severity: "medium",
    type: "duplicate"
  },
  {
    id: "levenshtein-distance",
    name: "Edit Distance Calculation",
    description: "Uses Levenshtein distance to find text with minimal character differences.",
    category: ValidationCategory.DEDUPLICATION,
    severity: "low",
    type: "duplicate"
  },
  {
    id: "auto-merge-duplicates",
    name: "Auto-merge Similar Records",
    description: "Automatically combines records with high similarity scores (configurable threshold).",
    category: ValidationCategory.DEDUPLICATION,
    severity: "high",
    type: "action",
    failAction: "merge"
  },
  {
    id: "manual-review-queue",
    name: "Manual Review Flagging",
    description: "Flags records with moderate similarity for human review before merging.",
    category: ValidationCategory.DEDUPLICATION,
    severity: "medium",
    type: "action",
    failAction: "flag"
  },
  
  // FINAL_REVIEW validations
  {
    id: "auto-corrections-review",
    name: "Auto-corrections Review",
    description: "Review of all data that was automatically corrected during the import process.",
    category: ValidationCategory.FINAL_REVIEW,
    type: "review"
  },
  {
    id: "manual-corrections-review",
    name: "Manual Corrections Review",
    description: "Summary of all manual corrections made to the data.",
    category: ValidationCategory.FINAL_REVIEW,
    type: "review"
  },
  {
    id: "missing-data-review",
    name: "Missing Data Review",
    description: "Overview of any ignored or missing data in the import.",
    category: ValidationCategory.FINAL_REVIEW,
    type: "review"
  },
  
  // IMPORT_PUSH validations
  {
    id: "connection-check",
    name: "Target System Connection Check",
    description: "Verifies that the connection to the target system is active and authenticated.",
    category: ValidationCategory.IMPORT_PUSH,
    severity: "critical",
    type: "connection"
  },
  {
    id: "schema-compatibility",
    name: "Schema Compatibility Check",
    description: "Ensures the data structure matches the target system's requirements.",
    category: ValidationCategory.IMPORT_PUSH,
    severity: "critical",
    type: "structure"
  },
  {
    id: "data-integrity",
    name: "Data Integrity Verification",
    description: "Final verification of data integrity before pushing to target system.",
    category: ValidationCategory.IMPORT_PUSH,
    severity: "high",
    type: "validation"
  }
];
