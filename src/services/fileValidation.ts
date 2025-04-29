
export const validateDataQuality = (data: any[]): any[] => {
  const validations = [];
  
  // Email format validation
  const invalidEmails = data.filter(row => {
    const email = row.email;
    return email && (!email.includes('@') || !email.includes('.'));
  });
  
  validations.push({
    id: 'email-format',
    name: 'Email Format',
    status: invalidEmails.length > 0 ? 'warning' : 'pass',
    severity: 'warning',
    description: 'Checks that email addresses are properly formatted',
    technical_details: invalidEmails.length > 0 
      ? [`${invalidEmails.length} records have invalid email format`, 
         'Valid emails must contain @ and domain (e.g., user@example.com)']
      : 'All email addresses are properly formatted'
  });

  // Age range validation
  const outOfRangeAges = data.filter(row => {
    const age = Number(row.age);
    return !isNaN(age) && (age < 0 || age > 120);
  });
  
  validations.push({
    id: 'age-range',
    name: 'Age Range',
    status: outOfRangeAges.length > 0 ? 'warning' : 'pass',
    severity: 'warning',
    description: 'Checks that age values are within reasonable range (0-120)',
    technical_details: outOfRangeAges.length > 0
      ? [`${outOfRangeAges.length} records have age values outside acceptable range (0-120)`]
      : 'All age values are within acceptable range'
  });
  
  // State code validation
  const validStates = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 
                       'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 
                       'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 
                       'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 
                       'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'];
                       
  const invalidStates = data.filter(row => {
    return row.state && !validStates.includes(row.state);
  });
  
  validations.push({
    id: 'state-code',
    name: 'State Code',
    status: invalidStates.length > 0 ? 'warning' : 'pass',
    severity: 'warning',
    description: 'Checks that state codes are valid US state abbreviations',
    technical_details: invalidStates.length > 0
      ? [`${invalidStates.length} records have invalid state codes`, 
         'State codes must be valid two-letter US state abbreviations']
      : 'All state codes are valid'
  });
  
  // ZIP code format validation
  const invalidZipCodes = data.filter(row => {
    if (!row.zip_code) return false;
    const zipPattern = /^\d{5}(-\d{4})?$/;
    return !zipPattern.test(row.zip_code);
  });
  
  validations.push({
    id: 'zip-code-format',
    name: 'ZIP Code Format',
    status: invalidZipCodes.length > 0 ? 'warning' : 'pass',
    severity: 'warning',
    description: 'Checks that ZIP codes follow the standard US format (12345 or 12345-6789)',
    technical_details: invalidZipCodes.length > 0
      ? [`${invalidZipCodes.length} records have invalid ZIP code format`,
         'ZIP codes must be in 5-digit format (12345) or 9-digit format (12345-6789)']
      : 'All ZIP codes are properly formatted'
  });
  
  // Date consistency validation (start date must be before end date)
  const inconsistentDates = data.filter(row => {
    if (!row.start_date || !row.end_date) return false;
    const startDate = new Date(row.start_date);
    const endDate = new Date(row.end_date);
    return startDate > endDate;
  });
  
  validations.push({
    id: 'date-consistency',
    name: 'Date Consistency',
    status: inconsistentDates.length > 0 ? 'warning' : 'pass',
    severity: 'warning',
    description: 'Checks that start dates occur before end dates',
    technical_details: inconsistentDates.length > 0
      ? [`${inconsistentDates.length} records have start dates that occur after end dates`,
         'Start dates must be chronologically before end dates']
      : 'All date ranges are logically consistent'
  });
  
  // Check for excessive whitespace in text fields
  const excessiveWhitespace = data.filter(row => {
    if (!row.company) return false;
    const trimmedCompany = row.company.trim();
    return trimmedCompany !== row.company;
  });
  
  validations.push({
    id: 'whitespace-cleanup',
    name: 'Whitespace in Text Fields',
    status: excessiveWhitespace.length > 0 ? 'warning' : 'pass',
    severity: 'warning',
    description: 'Checks for leading or trailing whitespace in text fields',
    technical_details: excessiveWhitespace.length > 0
      ? [`${excessiveWhitespace.length} records have leading or trailing whitespace in text fields`,
         'Text fields should not contain unnecessary whitespace']
      : 'All text fields are properly formatted without excessive whitespace'
  });

  return validations;
};

// Add the validateFile function that's missing but referenced in ImportUpload.tsx
export const validateFile = async (file: File, fullValidation: boolean = true) => {
  // Mock implementation for file validation
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
  
  // Return some mock validations for demonstration
  return [
    {
      id: 'file-format',
      validation_type: 'file-format',
      status: 'pass',
      severity: 'critical',
      message: 'File format is valid'
    },
    {
      id: 'file-size',
      validation_type: 'file-size',
      status: 'pass',
      severity: 'critical',
      message: 'File size is within acceptable limits'
    },
    {
      id: 'header-row',
      validation_type: 'header-row',
      status: 'pass',
      severity: 'critical',
      message: 'Header row detected and valid'
    },
    {
      id: 'required-columns',
      validation_type: 'required-columns',
      status: fullValidation ? 'warning' : 'pass',
      severity: 'warning',
      message: fullValidation ? 'Some recommended columns are missing' : 'All required columns present'
    }
  ];
};
