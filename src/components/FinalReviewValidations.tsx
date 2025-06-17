import React from 'react';
import { ValidationResult } from '@/components/ValidationStatus';
import { ClipboardCheck, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface FinalReviewValidationsProps {
  isLoading: boolean;
}

const FinalReviewValidations: React.FC<FinalReviewValidationsProps> = ({ isLoading }) => {
  // These validation results match the checks configured in the ValidationManager component
  const finalReviewChecks: ValidationResult[] = [
    {
      id: 'summary-validation',
      name: 'Import Summary Validation',
      status: 'pass',
      severity: 'low',
      description: 'Data import summary validated successfully',
      technical_details: [
        'Original record count: 500',
        'Valid record count: 492',
        'Overall data quality score: 98.4%'
      ]
    },
    {
      id: 'auto-fix-review',
      name: 'Auto-Fix Review',
      status: 'pass',
      severity: 'low',
      description: 'All automatic fixes have been reviewed',
      technical_details: [
        '3 types of automatic fixes applied',
        '85 total records modified',
        'All modifications logged and available for review'
      ]
    },
    {
      id: 'column-mapping-confirmation',
      name: 'Column Mapping Final Confirmation',
      status: 'pass',
      severity: 'low',
      description: 'Column mappings have been confirmed',
      technical_details: [
        'All required fields have been mapped',
        'Custom field mappings validated',
        'No column mapping conflicts detected'
      ]
    },
    {
      id: 'duplicate-strategy',
      name: 'Duplicate Handling Strategy Review',
      status: 'warning',
      severity: 'warning',
      description: 'Duplicate handling strategy requires review',
      technical_details: [
        '8 potential duplicate records identified',
        'Duplicates marked for manual review',
        'Records will be imported with duplicates flagged'
      ]
    },
    {
      id: 'data-transformations',
      name: 'Data Transformations Review',
      status: 'pass',
      severity: 'low',
      description: 'Data transformations have been verified',
      technical_details: [
        'Phone number formatting: 45 records modified',
        'Email domain corrections: 12 records modified',
        'State abbreviation standardization: 28 records modified'
      ]
    },
    {
      id: 'final-approval',
      name: 'User Final Approval',
      status: 'pending',
      severity: 'medium',
      description: 'User must provide final approval before import',
      technical_details: [
        'All validation checks have been reviewed',
        'Non-critical warnings have been acknowledged',
        'User must explicitly approve the import'
      ]
    }
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-50 border rounded-md">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-purple mb-4"></div>
        <p className="text-gray-500">Loading validation checks...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-800 mb-3 flex items-center">
        <ClipboardCheck className="h-5 w-5 text-[rgb(59,130,246)] mr-2" />
        Final Review Checks
      </h4>
      
      {finalReviewChecks.map((check) => (
        <Alert 
          key={check.id}
          variant={
            check.status === 'pass' ? "default" : 
            check.status === 'warning' ? "warning" : 
            check.status === 'fail' ? "destructive" : "default"
          }
          className="flex justify-between items-start"
        >
          <div className="flex-1">
            <AlertTitle className="flex items-center gap-2">
              {check.status === 'pass' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
              {check.status === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
              {check.name}
            </AlertTitle>
            <AlertDescription>
              {check.description}
              {check.technical_details && (
                <ul className="mt-2 text-sm list-disc pl-5 space-y-1">
                  {Array.isArray(check.technical_details) 
                    ? check.technical_details.map((detail, i) => <li key={i}>{detail}</li>)
                    : <li>{check.technical_details}</li>
                  }
                </ul>
              )}
            </AlertDescription>
          </div>
          
          {check.id === 'final-approval' && (
            <div className="ml-4 mt-1">
              <button className="px-3 py-1 bg-[rgb(59,130,246)] text-white text-sm rounded-md hover:bg-[rgb(37,99,235)]">
                Approve
              </button>
            </div>
          )}
        </Alert>
      ))}
    </div>
  );
};

export default FinalReviewValidations;
