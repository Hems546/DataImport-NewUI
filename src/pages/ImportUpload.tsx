import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { FileUploader } from "@/components/FileUploader";
import { FileInfo } from "@/components/FileInfo";
import { FileCheck, ArrowRight, ArrowLeft, FileBox, ClipboardCheck, ArrowUpCircle, FileUp, Info } from "lucide-react";
import MapColumns from "@/components/icons/MapColumns";
import DataQuality from "@/components/icons/DataQuality";
import TransformData from "@/components/icons/TransformData";
import ProgressStep from "@/components/ProgressStep";
import StepConnector from "@/components/StepConnector";
import ValidationStatus from '@/components/ValidationStatus';
import { ValidationCategory } from '@/constants/validations';
import { runValidationsForStage } from '@/services/validationRunner';

export default function ImportUpload() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResults, setValidationResults] = useState<any[]>([]);
  const [hasValidationErrors, setHasValidationErrors] = useState(false);

  const handleFileUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
    toast({
      title: "File uploaded",
      description: `${uploadedFile.name} has been uploaded successfully.`
    });
  };

  useEffect(() => {
    if (file) {
      validateUploadedFile();
    }
  }, [file]);

  const validateUploadedFile = async () => {
    if (!file) return;
    setIsValidating(true);
    
    try {
      // Run validations for FILE_UPLOAD stage using our validation runner
      const results = await runValidationsForStage(ValidationCategory.FILE_UPLOAD, file);
      
      setValidationResults(results);

      // Check if there are any failures
      const hasErrors = results.some(result => result.status === 'fail' && result.severity === 'critical');
      setHasValidationErrors(hasErrors);
      
      if (hasErrors) {
        toast({
          title: "Validation failed",
          description: "Please fix the errors before continuing.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Validation passed",
          description: "Your file has passed all validation checks."
        });
      }
      
      setIsValidating(false);
    } catch (error) {
      console.error('Validation error:', error);
      toast({
        title: "Validation error",
        description: "An error occurred during file validation.",
        variant: "destructive"
      });
      setIsValidating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header currentPage="import-wizard" />

      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="outline">
                  <ArrowLeft className="mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <h2 className="text-2xl font-bold">Import Wizard</h2>
            </div>
          </div>

          <div className="flex justify-between items-center mb-12">
            <ProgressStep 
              icon={<FileUp />}
              label="File Upload"
              isActive={true}
            />
            <StepConnector />
            <ProgressStep 
              icon={<FileCheck />}
              label="File Preflighting"
              isActive={file !== null}
            />
            <StepConnector />
            <ProgressStep 
              icon={<MapColumns />}
              label="Column Mapping"
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
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Upload Your File</h3>
              <p className="text-gray-500 mb-4">
                Upload a CSV or Excel file to begin the import process. 
                We'll help you map the columns and validate the data.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                <div className="flex items-start">
                  <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-800">File Requirements</h4>
                    <ul className="mt-1 text-sm text-blue-700 list-disc list-inside">
                      <li>CSV, XLS, or XLSX format</li>
                      <li>Maximum file size: 10MB</li>
                      <li>First row should contain column headers</li>
                      <li>UTF-8 encoding recommended</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <FileUploader 
                onFileUpload={handleFileUpload} 
                acceptedFileTypes={['.csv', '.xls', '.xlsx']}
                maxSizeMB={10}
              />
            </div>

            {file && (
              <div className="mt-8">
                <h3 className="text-lg font-medium mb-4">File Information</h3>
                <FileInfo file={file} />
                
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4">Validation Results</h3>
                  {isValidating ? (
                    <div className="flex flex-col items-center justify-center p-8 bg-gray-50 border rounded-md">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-purple mb-4"></div>
                      <p className="text-gray-500">Validating file...</p>
                    </div>
                  ) : (
                    validationResults.length > 0 && (
                      <ValidationStatus 
                        results={validationResults}
                        title="File Validation Results"
                      />
                    )
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-end">
            <Link to="/import-wizard/verification">
              <Button 
                className="bg-brand-purple hover:bg-brand-purple/90"
                disabled={!file || isValidating || hasValidationErrors}
              >
                Continue to File Verification
                <ArrowRight className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
