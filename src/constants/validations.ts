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
    description: "Validates that the uploaded file is in a supported format (CSV, XLS, XLSX).",
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
  
  // Additional FILE_UPLOAD validations
  {
    id: "header-presence",
    name: "Header Presence Check",
    description: "Verifies that headers exist before proceeding with the import.",
    category: ValidationCategory.FILE_UPLOAD,
    severity: "critical",
    type: "format",
    failAction: "reject"
  },
  {
    id: "max-row-count",
    name: "Maximum Row Count Check",
    description: "Verifies the file doesn't exceed the maximum allowed rows (100,000).",
    category: ValidationCategory.FILE_UPLOAD,
    severity: "critical",
    type: "format",
    failAction: "reject"
  },

  // VERIFY_FILE (Preflight) validations
  {
    id: "required-columns",
    name: "Required Columns Check",
    description: "Verifies all mandatory columns are present in the file.",
    category: ValidationCategory.VERIFY_FILE,
    severity: "critical",
    type: "structure",
    failAction: "reject"
  },
  {
    id: "header-uniqueness",
    name: "Header Uniqueness Check",
    description: "Ensures there are no duplicate column headers in the file.",
    category: ValidationCategory.VERIFY_FILE,
    severity: "critical",
    type: "structure",
    failAction: "reject"
  },
  {
    id: "header-blank",
    name: "Blank Headers Check",
    description: "Verifies that no column headers are empty or contain only whitespace.",
    category: ValidationCategory.VERIFY_FILE,
    severity: "critical",
    type: "structure",
    failAction: "reject"
  },
  {
    id: "header-format",
    name: "Header Format Validation",
    description: "Checks that headers match expected patterns and contain no invalid characters.",
    category: ValidationCategory.VERIFY_FILE,
    severity: "critical",
    type: "structure",
    failAction: "reject"
  },
  {
    id: "delimiter-consistency",
    name: "Delimiter Consistency Check",
    description: "For CSV/TSV files, ensures consistent use of delimiters throughout the file.",
    category: ValidationCategory.VERIFY_FILE,
    severity: "critical",
    type: "structure",
    failAction: "reject"
  },
  {
    id: "blank-rows",
    name: "Blank Rows Detection",
    description: "Identifies and flags completely empty rows in the file.",
    category: ValidationCategory.VERIFY_FILE,
    severity: "high",
    type: "structure",
    failAction: "reject"
  },
  {
    id: "blank-columns",
    name: "Blank Columns Detection",
    description: "Identifies and flags completely empty columns in the file.",
    category: ValidationCategory.VERIFY_FILE,
    severity: "high",
    type: "structure",
    failAction: "reject"
  },
  {
    id: "row-length-consistency",
    name: "Row Length Consistency",
    description: "Verifies all rows have the same number of columns as the header.",
    category: ValidationCategory.VERIFY_FILE,
    severity: "critical",
    type: "structure",
    failAction: "reject"
  },
  {
    id: "excel-sheet-validation",
    name: "Excel Sheet Validation",
    description: "For Excel files, validates correct sheet selection and structure.",
    category: ValidationCategory.VERIFY_FILE,
    severity: "critical",
    type: "structure",
    failAction: "reject"
  },
  {
    id: "special-characters",
    name: "Special Characters Detection",
    description: "Checks for illegal or unexpected control characters in the file.",
    category: ValidationCategory.VERIFY_FILE,
    severity: "critical",
    type: "structure",
    failAction: "reject"
  },

  // Additional VERIFY_FILE validations
  {
    id: "line-ending-consistency",
    name: "Line Ending Consistency",
    description: "Checks for mixed line endings that could cause parsing issues.",
    category: ValidationCategory.VERIFY_FILE,
    severity: "high",
    type: "structure",
    failAction: "warn"
  },
  {
    id: "bom-detection",
    name: "BOM Detection",
    description: "Checks for invisible Unicode BOM characters that can cause parsing issues.",
    category: ValidationCategory.VERIFY_FILE,
    severity: "high",
    type: "structure",
    failAction: "warn"
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
  
  // Additional COLUMN_MAPPING validations
  {
    id: "data-preview-validation",
    name: "Data Preview Validation",
    description: "Verifies if mapped columns contain expected data patterns.",
    category: ValidationCategory.COLUMN_MAPPING,
    severity: "medium",
    type: "mapping",
    failAction: "warn"
  },
  {
    id: "format-compatibility",
    name: "Format Compatibility",
    description: "Ensures column formats are compatible with target fields.",
    category: ValidationCategory.COLUMN_MAPPING,
    severity: "high",
    type: "mapping",
    failAction: "reject"
  },
  {
    id: "optional-fields-warning",
    name: "Optional Fields Warning",
    description: "Alerts user about unmapped optional fields.",
    category: ValidationCategory.COLUMN_MAPPING,
    severity: "low",
    type: "mapping",
    failAction: "warn"
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
  
  // Additional DATA_QUALITY validations
  {
    id: "character-limit",
    name: "Character Limit Check",
    description: "Validates fields don't exceed database column length limits.",
    category: ValidationCategory.DATA_QUALITY,
    severity: "high",
    type: "content",
    failAction: "reject"
  },
  {
    id: "enum-validation",
    name: "Enum Value Validation",
    description: "Checks if values match predefined options for enum fields.",
    category: ValidationCategory.DATA_QUALITY,
    severity: "high",
    type: "content",
    failAction: "reject"
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

  // Additional DATA_NORMALIZATION validations
  {
    id: "currency-standardization",
    name: "Currency Format Standardization",
    description: "Normalizes different currency formats to a standard format.",
    category: ValidationCategory.DATA_NORMALIZATION,
    type: "conversion",
    severity: "medium",
    failAction: "auto-fix"
  },
  {
    id: "unit-conversion",
    name: "Unit Measurement Conversion",
    description: "Converts between different measurement units.",
    category: ValidationCategory.DATA_NORMALIZATION,
    type: "conversion",
    severity: "medium",
    failAction: "auto-fix"
  },
  {
    id: "address-verification",
    name: "Address Standardization",
    description: "Standardizes and verifies physical addresses.",
    category: ValidationCategory.DATA_NORMALIZATION,
    type: "conversion",
    severity: "medium",
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

  // Additional DEDUPLICATION validations
  {
    id: "time-window-dedup",
    name: "Time-Window Deduplication",
    description: "Flags records entered within a specific timeframe.",
    category: ValidationCategory.DEDUPLICATION,
    severity: "medium",
    type: "duplicate",
    failAction: "warn"
  },
  {
    id: "similarity-threshold",
    name: "Similarity Score Configuration",
    description: "Customizable thresholds for match similarity scores.",
    category: ValidationCategory.DEDUPLICATION,
    severity: "medium",
    type: "configuration",
    failAction: "warn"
  },
  {
    id: "merge-rules",
    name: "Merge Preference Rules",
    description: "Configures which field values take precedence during merging.",
    category: ValidationCategory.DEDUPLICATION,
    severity: "high",
    type: "configuration",
    failAction: "warn"
  },

  // FINAL_REVIEW validations
  {
    id: "validation-summary",
    name: "Validation Summary Report",
    description: "Generates a comprehensive report of all validation successes and failures.",
    category: ValidationCategory.FINAL_REVIEW,
    type: "review",
    severity: "high"
  },
  {
    id: "pending-errors-check",
    name: "Unresolved Issues Check",
    description: "Identifies any remaining unresolved validation issues that need attention.",
    category: ValidationCategory.FINAL_REVIEW,
    type: "review",
    severity: "critical"
  },
  {
    id: "auto-corrections-review",
    name: "Auto-corrections Review",
    description: "Review of all data that was automatically corrected during the import process.",
    category: ValidationCategory.FINAL_REVIEW,
    type: "review",
    severity: "medium"
  },
  {
    id: "row-count-verification",
    name: "Row Count Verification",
    description: "Confirms the number of rows successfully processed versus the original file count.",
    category: ValidationCategory.FINAL_REVIEW,
    type: "review",
    severity: "high"
  },
  {
    id: "ignored-errors-review",
    name: "Ignored Errors Review",
    description: "Lists all validation errors that were marked as ignored during the import process.",
    category: ValidationCategory.FINAL_REVIEW,
    type: "review",
    severity: "medium"
  },
  {
    id: "data-transformations-log",
    name: "Data Transformations Log",
    description: "Detailed log of all data transformations and normalizations applied.",
    category: ValidationCategory.FINAL_REVIEW,
    type: "review",
    severity: "low"
  },
  {
    id: "final-approval-required",
    name: "Final Approval Requirement",
    description: "Requires explicit user approval before proceeding with the final import.",
    category: ValidationCategory.FINAL_REVIEW,
    type: "review",
    severity: "critical",
    failAction: "block"
  },

  // Additional FINAL_REVIEW validations
  {
    id: "impact-analysis",
    name: "Impact Analysis",
    description: "Shows how import will affect existing data.",
    category: ValidationCategory.FINAL_REVIEW,
    type: "review",
    severity: "high"
  },
  {
    id: "rollback-plan",
    name: "Rollback Verification",
    description: "Ensures ability to undo the import if needed.",
    category: ValidationCategory.FINAL_REVIEW,
    type: "review",
    severity: "critical"
  },
  {
    id: "compliance-check",
    name: "Compliance Verification",
    description: "Verifies the import meets regulatory requirements.",
    category: ValidationCategory.FINAL_REVIEW,
    type: "review",
    severity: "critical"
  },

  // IMPORT_PUSH validations
  {
    id: "schema-compatibility",
    name: "Schema Compatibility Check",
    description: "Ensures all fields comply with target system's schema requirements and data types.",
    category: ValidationCategory.IMPORT_PUSH,
    severity: "critical",
    type: "structure",
    failAction: "reject"
  },
  {
    id: "batch-size-validation",
    name: "Batch Size Validation",
    description: "Verifies that the import size meets system batch processing limits and requirements.",
    category: ValidationCategory.IMPORT_PUSH,
    severity: "high",
    type: "system",
    failAction: "warn"
  },
  {
    id: "test-batch-validation",
    name: "Test Batch Verification",
    description: "Processes a small test batch to verify system compatibility before full import.",
    category: ValidationCategory.IMPORT_PUSH,
    severity: "medium",
    type: "system",
    failAction: "warn"
  },
  {
    id: "transaction-integrity",
    name: "Transaction Integrity Check",
    description: "Ensures all data can be committed in a single transaction if required.",
    category: ValidationCategory.IMPORT_PUSH,
    severity: "critical",
    type: "system",
    failAction: "reject"
  },

  // Additional IMPORT_PUSH validations
  {
    id: "system-readiness",
    name: "System Readiness Check",
    description: "Verifies target system is available and ready.",
    category: ValidationCategory.IMPORT_PUSH,
    severity: "critical",
    type: "system",
    failAction: "reject"
  },
  {
    id: "rate-limit",
    name: "Rate Limit Awareness",
    description: "Manages API rate limits for external systems.",
    category: ValidationCategory.IMPORT_PUSH,
    severity: "high",
    type: "system",
    failAction: "warn"
  },
  {
    id: "notification-config",
    name: "Notification Configuration",
    description: "Sets up success/failure notifications for the import process.",
    category: ValidationCategory.IMPORT_PUSH,
    severity: "medium",
    type: "system",
    failAction: "warn"
  }
];

// Add detailed technical descriptions for file format checks
export const getTechnicalDescription = (validationId: string): string[] => {
  const descriptions: Record<string, string[]> = {
    'file-type': [
      "Purpose: Ensures uploaded file matches supported formats",
      "Implementation: Validates file extension and MIME type",
      "Common Issues:",
      "- Unsupported file formats",
      "- Mismatched extensions",
      "- Hidden file extensions",
      "Resolution Steps:",
      "1. Verify file has .csv, .xls, or .xlsx extension",
      "2. Ensure file is not renamed from another format",
      "3. Check file is not corrupted"
    ],
    'file-size': [
      "Purpose: Prevents oversized file uploads",
      "Implementation: Checks file size against 10MB limit",
      "Common Issues:",
      "- Files exceeding size limit",
      "- Hidden content increasing file size",
      "Resolution Steps:",
      "1. Check file size before upload",
      "2. Remove unnecessary data/formatting",
      "3. Split large files if needed"
    ],
    'file-encoding': [
      "Purpose: Validates character encoding compatibility",
      "Implementation: Checks for UTF-8 encoding",
      "Common Issues:",
      "- Non-UTF-8 encoded files",
      "- Special character corruption",
      "- Mixed encodings",
      "Resolution Steps:",
      "1. Save file with UTF-8 encoding",
      "2. Remove special characters if needed",
      "3. Use text editor to convert encoding"
    ],
    'file-corruption': [
      "Purpose: Detects file integrity issues",
      "Implementation: Validates file can be properly parsed",
      "Common Issues:",
      "- Partially downloaded files",
      "- Network transmission errors",
      "- Binary file corruption",
      "Resolution Steps:",
      "1. Re-download or re-export file",
      "2. Check for complete file transfer",
      "3. Verify source file is valid"
    ],
        'row-length-consistency': [
        "Purpose: Verifies data structure integrity by comparing row lengths",
        "Implementation: Counts columns in each row and compares to header length",
        "Common Issues:",
        "- Missing delimiters causing merged columns",
        "- Extra delimiters creating empty columns",
        "- Line breaks within fields causing row splits",
        "Resolution Steps:",
        "1. Export data with proper delimiters",
        "2. Remove any line breaks within fields",
        "3. Ensure all rows have consistent delimiters"
      ],
      'required-columns': [
        "Purpose: Ensures all mandatory fields are present in the import file",
        "Implementation: Compares header names against required field list",
        "Common Issues:",
        "- Missing required column headers",
        "- Misspelled column names",
        "- Case sensitivity mismatches",
        "Resolution Steps:",
        "1. Compare headers against template",
        "2. Add missing columns with valid data",
        "3. Correct any misspelled headers"
      ],
      'header-uniqueness': [
        "Purpose: Prevents ambiguous column mapping",
        "Implementation: Checks for duplicate column names",
        "Common Issues:",
        "- Multiple columns with same name",
        "- Hidden whitespace in headers",
        "Resolution Steps:",
        "1. Rename duplicate columns uniquely",
        "2. Remove any trailing/leading spaces"
      ],
      'data-type-validation': [
        "Purpose: Ensures data matches expected format and type",
        "Implementation: Validates each cell against field type rules",
        "Common Issues:",
        "- Text in numeric fields",
        "- Incorrectly formatted dates",
        "- Invalid email formats",
        "Resolution Steps:",
        "1. Review data type requirements",
        "2. Convert data to correct format",
        "3. Clean up any special characters"
      ]
  };
  
  return descriptions[validationId] || [
    "Technical details for this validation are not yet documented.",
    "Please refer to the validation documentation for more information."
  ];
};
