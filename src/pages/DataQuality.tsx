
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { 
  FileCheck,
  ArrowRight,
  ArrowLeft,
  FileBox,
  ClipboardCheck,
  ArrowUpCircle,
  Info,
  AlertTriangle
} from "lucide-react";
import MapColumns from "@/components/icons/MapColumns";
import DataQualityIcon from "@/components/icons/DataQuality";
import TransformData from "@/components/icons/TransformData";
import ProgressStep from "@/components/ProgressStep";
import StepConnector from "@/components/StepConnector";
import ValidationStatus, { ValidationResult as ValidationStatusResult } from '@/components/ValidationStatus';
import { validateDataQuality } from "@/services/fileValidation";
import Papa from 'papaparse';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function DataQualityPage() {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [validationResults, setValidationResults] = useState<ValidationStatusResult[]>([]);
  const [parsedData, setParsedData] = useState<any[]>([]);

  useEffect(() => {
    const analyzeDataQuality = async () => {
      try {
        setIsAnalyzing(true);
        
        // Get uploaded file data from localStorage
        const uploadedFile = localStorage.getItem('uploadedFile');
        const fileInfo = JSON.parse(localStorage.getItem('uploadedFileInfo') || '{}');

        if (!uploadedFile) {
          toast({
            title: "No file data found",
            description: "Please upload a file in the previous step.",
            variant: "destructive"
          });
          setIsAnalyzing(false);
          return;
        }

        // Parse the file data
        let fileData: any[] = [];
        
        // Convert base64 data back to a file object
        const dataType = uploadedFile.split(',')[0].split(':')[1].split(';')[0];
        const byteString = atob(uploadedFile.split(',')[1]);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        
        const blob = new Blob([ab], { type: dataType });
        const file = new File([blob], fileInfo.name || "file.csv", { type: dataType });
        
        // Parse the file depending on its type
        if (fileInfo.extension === '.csv') {
          await new Promise<void>((resolve) => {
            Papa.parse(file, {
              header: true,
              dynamicTyping: true,
              complete: (results) => {
                fileData = results.data.filter(row => 
                  Object.keys(row).length > 0 && 
                  !Object.keys(row).every(key => !row[key])
                );
                setParsedData(fileData);
                resolve();
              },
              error: (error) => {
                console.error('Error parsing CSV:', error);
                toast({
                  title: "Error parsing file",
                  description: "The file could not be parsed correctly.",
                  variant: "destructive"
                });
                resolve();
              }
            });
          });
        } else if (['.xls', '.xlsx'].includes(fileInfo.extension)) {
          // For Excel files, we'd use a library like SheetJS/xlsx
          // This is a simplified version showing the concept
          toast({
            title: "Excel processing",
            description: "Excel processing is simplified for this demo.",
            variant: "warning"
          });
          
          // Use mock data for non-CSV files in this demo
          fileData = [
            { name: "John Smith", email: "john@example.com", age: 32 },
            { name: "Jane Doe", email: "not-an-email", age: 28 }
          ];
          setParsedData(fileData);
        }
        
        // Run data quality validation on the actual data
        let results = validateDataQuality(fileData);
        
        // Add email format validation explicitly
        const invalidEmails = fileData.filter(row => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return row.email && typeof row.email === 'string' && !emailRegex.test(row.email);
        });
        
        const emailFormatValidation: ValidationStatusResult = {
          id: 'email-format',
          name: 'Email Format Validation',
          status: invalidEmails.length > 0 ? 'fail' : 'pass',
          severity: 'warning',
          technical_details: invalidEmails.length > 0 ? [
            `Found ${invalidEmails.length} records with invalid email formats:`,
            ...invalidEmails.map((row, index) => `- Row ${index + 1}: "${row.email}" is not a valid email address`)
          ] : ['All email addresses follow valid format']
        };
        
        // Ensure all results have the required properties for ValidationStatusResult
        const formattedResults: ValidationStatusResult[] = [
          ...results.map(result => ({
            ...result,
            name: result.name || result.id || ''
          })),
          emailFormatValidation
        ];

        setValidationResults(formattedResults);
        
        // Analyze results for toast notification
        const warnings = formattedResults.filter(r => r.status === 'warning');
        const failures = formattedResults.filter(r => r.status === 'fail' && r.severity === 'high');

        if (failures.length > 0) {
          toast({
            title: "Critical data quality issues found",
            description: `${failures.length} critical issues need attention.`,
            variant: "destructive"
          });
        } else if (warnings.length > 0) {
          toast({
            title: "Data quality warnings found",
            description: `${warnings.length} quality issues can be addressed in normalization.`,
            variant: "warning"
          });
        } else {
          toast({
            title: "Data quality check complete",
            description: "All quality checks passed successfully."
          });
        }
      } catch (error) {
        console.error('Data quality analysis error:', error);
        toast({
          title: "Analysis failed",
          description: "An error occurred during data quality analysis.",
          variant: "destructive"
        });
      } finally {
        setIsAnalyzing(false);
      }
    };

    analyzeDataQuality();
  }, [toast]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header currentPage="import-wizard" />

      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <Link to="/import-wizard/column-mapping">
                <Button variant="outline">
                  <ArrowLeft className="mr-2" />
                  Back
                </Button>
              </Link>
              <h2 className="text-2xl font-bold">Data Quality</h2>
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
              icon={<DataQualityIcon />}
              label="Data Quality"
              isActive={true}
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
          
          {/* Instructions Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Data Quality Analysis</CardTitle>
              <CardDescription>
                We're analyzing your data for quality issues and providing recommendations for improvement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-medium">About Data Quality Analysis:</p>
                  <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                    <li>Fields are being checked for proper formatting, valid values, and logical consistency</li>
                    <li>Critical issues must be resolved before proceeding</li>
                    <li>Warnings can be addressed in the normalization step</li>
                  </ul>
                </AlertDescription>
              </Alert>
              <Alert variant="warning">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Common issues include invalid email formats, out-of-range values, and inconsistent date ranges
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <div className="bg-white p-8 rounded-lg border border-gray-200">
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center p-8 bg-gray-50 border rounded-md">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-purple mb-4"></div>
                <p className="text-gray-500">Analyzing data quality...</p>
              </div>
            ) : parsedData.length > 0 ? (
              <ValidationStatus 
                results={validationResults}
                title="Data Quality Results"
                data={parsedData}
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-8 bg-gray-50 border rounded-md">
                <AlertTriangle className="h-10 w-10 text-yellow-500 mb-4" />
                <p className="text-gray-800 font-medium">No data available for analysis</p>
                <p className="text-gray-500 mt-2">Please ensure a valid file was uploaded in the previous step</p>
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-between items-center">
            <div className="flex gap-4">
              <Link to="/import-wizard/column-mapping">
                <Button variant="outline">
                  <ArrowLeft className="mr-2" />
                  Back
                </Button>
              </Link>
            </div>
            <Link to="/import-wizard/normalization">
              <Button 
                className="bg-brand-purple hover:bg-brand-purple/90"
                disabled={isAnalyzing || validationResults.some(v => v.status === 'fail' && v.severity === 'high')}
              >
                Continue to Data Normalization
                <ArrowRight className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
