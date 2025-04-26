import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
import { validations, ValidationCategory } from '@/constants/validations';

export default function FileVerification() {
  const [progress] = React.useState(32);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [verificationResults, setVerificationResults] = useState<ValidationResult[]>([]);
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const fileVerificationChecks = validations
      .filter(v => v.category === ValidationCategory.VERIFY_FILE)
      .map(v => ({
        id: v.id,
        name: v.name,
        description: v.description,
        status: 'pending' as const,
        failureReason: '',
        remediation: ''
      }));

    setVerificationResults(fileVerificationChecks);

    const timer = setTimeout(() => {
      const results = fileVerificationChecks.map(check => {
        const passed = Math.random() > 0.2;
        if (passed) {
          return {
            ...check,
            status: 'pass' as const
          };
        }
        
        return {
          ...check,
          status: 'fail' as const,
          failureReason: getFailureReason(check.id),
          remediation: getRemediation(check.id)
        };
      });
      
      setVerificationResults(results);
      setIsVerifying(false);
      
      const failedChecks = results.filter(r => r.status === 'fail');
      if (failedChecks.length === 0) {
        toast({
          title: "File verification complete",
          description: "All checks passed. You can proceed to column mapping."
        });
      } else {
        toast({
          title: "File verification issues found",
          description: `${failedChecks.length} issues need attention. Please review the details below.`,
          variant: "destructive"
        });
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [toast]);

  const getFailureReason = (checkId: string): string => {
    const check = validations.find(v => v.id === checkId);
    let baseReason = '';
    switch (checkId) {
      case 'required-columns':
        baseReason = "Missing required columns in the file: Customer ID, Email, First Name";
        break;
      case 'header-uniqueness':
        baseReason = "Duplicate column headers found: 'Email' appears twice";
        break;
      case 'header-blank':
        baseReason = "Empty column headers detected in columns F and H";
        break;
      case 'header-format':
        baseReason = "Invalid characters found in column headers: '@', '#', '%'";
        break;
      case 'delimiter-consistency':
        baseReason = "Inconsistent delimiters found. Some rows use commas, others use semicolons";
        break;
      default:
        baseReason = check?.description || "Validation check failed";
    }
    return baseReason;
  };

  const getRemediation = (checkId: string): string => {
    let baseRemediation = '';
    switch (checkId) {
      case 'required-columns':
        baseRemediation = "Ensure your file includes all required columns: Customer ID, Email, and First Name";
        break;
      case 'header-uniqueness':
        baseRemediation = "Rename duplicate columns to have unique names. Consider using 'Primary Email' and 'Secondary Email'";
        break;
      case 'header-blank':
        baseRemediation = "Add descriptive names to all column headers. No blank headers are allowed";
        break;
      case 'header-format':
        baseRemediation = "Remove special characters from column headers. Use only letters, numbers, and underscores";
        break;
      case 'delimiter-consistency':
        baseRemediation = "Ensure all rows use the same delimiter (comma). Check for and remove any semicolons";
        break;
      default:
        baseRemediation = "Please review the file format requirements";
    }
    return `${baseRemediation}. Please fix the file and reimport the file.`;
  };

  const handleContinue = () => {
    navigate('/import-wizard/column-mapping');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-brand-purple">
        <Header currentPage="import-wizard" />
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center text-white">
            <div className="flex items-center gap-4">
              <Link to="/import-wizard/upload">
                <Button variant="ghost" className="text-white hover:text-white hover:bg-white/20">
                  <ArrowLeft className="mr-2" />
                  Back
                </Button>
              </Link>
              <h1 className="text-2xl font-semibold">Data Import</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" className="text-white hover:text-white hover:bg-white/20">
                Audit History
                <span className="ml-2 bg-white text-brand-purple rounded-full w-5 h-5 flex items-center justify-center text-xs">11</span>
              </Button>
              <Button variant="ghost" className="text-white hover:text-white hover:bg-white/20">
                File History
                <span className="ml-2 bg-white text-brand-purple rounded-full w-5 h-5 flex items-center justify-center text-xs">11</span>
              </Button>
              <Button variant="ghost" className="text-white hover:text-white hover:bg-white/20">
                Admin
              </Button>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="flex justify-between items-center text-white mb-2">
              <span>Upload Progress</span>
              <span>{progress}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>

      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">File Verification</h2>
            <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
              Target: customers
            </div>
          </div>

          <div className="flex justify-between items-center mb-12">
            <ProgressStep 
              icon={<FileCheck />}
              label="File Upload"
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
            <h3 className="text-xl font-semibold mb-4">File Verification</h3>
            <p className="text-gray-600 mb-4">
              We're checking your file for proper formatting and data quality.
            </p>
            
            {isVerifying ? (
              <div className="flex flex-col items-center justify-center p-8 bg-gray-50 border rounded-md">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-purple mb-4"></div>
                <p className="text-gray-500">File verification in progress...</p>
              </div>
            ) : (
              <ValidationStatus 
                results={verificationResults}
                title="File Verification Results"
              />
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
            <Button 
              className="bg-brand-purple hover:bg-brand-purple/90"
              onClick={handleContinue}
              disabled={isVerifying || verificationResults.some(v => v.status === 'fail')}
            >
              Continue to Column Mapping
              <ArrowRight className="ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
