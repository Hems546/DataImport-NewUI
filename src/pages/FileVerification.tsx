import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { 
  FileCheck,
  ArrowRight,
  ArrowLeft,
  FileBox,
  ClipboardCheck,
  ArrowUpCircle
} from "lucide-react";
import MapColumns from "@/components/icons/MapColumns";
import DataQuality from "@/components/icons/DataQuality";
import TransformData from "@/components/icons/TransformData";
import ProgressStep from "@/components/ProgressStep";
import StepConnector from "@/components/StepConnector";
import ValidationStatus, { ValidationResult } from '@/components/ValidationStatus';
import { validateFile } from '@/services/fileValidation';
import { getTechnicalDescription } from '@/constants/validations';

export default function FileVerification() {
  const [progress] = React.useState(32);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [verificationResults, setVerificationResults] = useState<ValidationResult[]>([]);
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const validateUploadedFile = async () => {
      try {
        setIsVerifying(true);
        const fileData = localStorage.getItem('uploadedFile');
        if (!fileData) {
          throw new Error('No file found');
        }

        const fileInfo = JSON.parse(localStorage.getItem('uploadedFileInfo') || '{}');
        const file = dataURLtoFile(fileData, fileInfo.name || 'uploaded-file.csv');
        
        const validationResults = await validateFile(file, false);
        
        const results: ValidationResult[] = validationResults.map(validation => ({
          id: validation.validation_type,
          name: formatValidationName(validation.validation_type),
          status: validation.status === 'pass' ? 'pass' as const : 
                 validation.status === 'warning' ? 'warning' as const : 'fail' as const,
          severity: validation.severity as 'critical' | 'warning',
          description: validation.message,
          technical_details: getTechnicalDescription(validation.validation_type)
        }));

        setVerificationResults(results);
        
        const criticalFailures = results.filter(r => r.status === 'fail' && r.severity === 'critical');
        const warnings = results.filter(r => r.status === 'warning' || (r.status === 'fail' && r.severity === 'warning'));
        
        if (criticalFailures.length === 0 && warnings.length === 0) {
          toast({
            title: "File verification complete",
            description: "All checks passed. You can proceed to column mapping."
          });
        } else if (criticalFailures.length > 0) {
          toast({
            title: "File verification issues found",
            description: `${criticalFailures.length} critical issues need attention.`,
            variant: "destructive"
          });
        } else {
          toast({
            title: "File verification warnings found",
            description: `${warnings.length} warnings found. You can proceed or address these issues.`,
            variant: "warning"
          });
        }
      } catch (error) {
        console.error('Validation error:', error);
        toast({
          title: "Validation failed",
          description: "An error occurred while validating the file.",
          variant: "destructive"
        });
        setVerificationResults([]);
      } finally {
        setIsVerifying(false);
      }
    };

    validateUploadedFile();
  }, [toast]);

  const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || '';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const formatValidationName = (type: string): string => {
    return type
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleContinue = () => {
    navigate('/import-wizard/column-mapping');
  };

  const handleOverride = () => {
    toast({
      title: "Validation overridden",
      description: "Proceeding to column mapping despite validation issues",
      variant: "destructive"
    });
    navigate('/import-wizard/column-mapping');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header currentPage="import-wizard" />

      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">File Verification</h2>
          </div>

          <div className="flex justify-between items-center mb-12">
            <ProgressStep 
              icon={<FileCheck />}
              label="File Upload"
              isComplete={true}
            />
            <StepConnector isCompleted={true} />
            <ProgressStep 
              icon={<MapColumns />}
              label="Column Mapping"
              isComplete={true}
            />
            <StepConnector isCompleted={true} />
            <ProgressStep 
              icon={<FileCheck />}
              label="File Preflighting"
              isActive={true}
            />
            <StepConnector />
            <ProgressStep 
              icon={<DataQuality />}
              label="Data Quality"
            />
            <StepConnector />
            <ProgressStep 
              icon={<TransformData />}
              label="Data Normalization"
            />
            <StepConnector />
            <ProgressStep 
              icon={<FileBox />}
              label="Deduplication"
            />
            <StepConnector />
            <ProgressStep 
              icon={<ClipboardCheck />}
              label="Final Review & Approval"
            />
            <StepConnector />
            <ProgressStep 
              icon={<ArrowUpCircle />}
              label="Import / Push"
            />
          </div>

          <div className="bg-white p-8 rounded-lg border border-gray-200">
            <h3 className="text-xl font-semibold mb-4">File Verification</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-700">
                We're checking your file for proper formatting and data quality. This includes:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>File structure validation</li>
                  <li>Header validation (uniqueness, required columns)</li>
                  <li>Data structure consistency</li>
                  <li>Row count verification</li>
                </ul>
              </p>
            </div>
            <p className="text-gray-600 mb-6">
              If any critical issues are found, you'll need to fix them before proceeding. Warnings can be reviewed but won't block the import process.
            </p>
            
            {isVerifying ? (
              <div className="flex flex-col items-center justify-center p-8 bg-gray-50 border rounded-md">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-purple mb-4"></div>
                <p className="text-gray-500">File verification in progress...</p>
              </div>
            ) : (
              <>
                {verificationResults.length > 0 ? (
                  <ValidationStatus 
                    results={verificationResults}
                    title="File Verification Results"
                  />
                ) : (
                  <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-700">No validation checks were completed. There might be an issue with the file format.</p>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="mt-8 flex justify-between items-center">
            <div className="flex gap-4">
              <Link to="/import-wizard/upload">
                <Button variant="outline">
                  <ArrowLeft className="mr-2" />
                  Back
                </Button>
              </Link>
            </div>
            <div className="flex gap-4">
              {verificationResults.some(v => v.status === 'fail' && v.severity === 'critical') && (
                <Button 
                  variant="destructive"
                  onClick={handleOverride}
                >
                  Override Errors
                </Button>
              )}
              <Button 
                className="bg-brand-purple hover:bg-brand-purple/90"
                onClick={handleContinue}
                disabled={isVerifying || verificationResults.some(v => v.status === 'fail' && v.severity === 'critical')}
              >
                Continue to Column Mapping
                <ArrowRight className="ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
