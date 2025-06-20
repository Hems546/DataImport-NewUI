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
  AlertTriangle,
  FileSpreadsheet
} from "lucide-react";
import MapColumns from "@/components/icons/MapColumns";
import DataQualityIcon from "@/components/icons/DataQuality";
import TransformData from "@/components/icons/TransformData";
import ProgressStep from "@/components/ProgressStep";
import StepConnector from "@/components/StepConnector";
import ValidationStatus, { ValidationResult as ValidationStatusResult } from '@/components/ValidationStatus';
import { validateDataQuality } from "@/services/fileValidation";
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loading } from "@/components/ui/loading";

export default function DataQualityPage() {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [validationResults, setValidationResults] = useState<ValidationStatusResult[]>([]);
  const [parsedData, setParsedData] = useState<any[]>([]);

  const parseExcelData = (base64Data: string): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      try {
        // Convert base64 to binary string
        const binaryString = atob(base64Data);
        
        // Convert binary string to array buffer
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        // Read the Excel file
        const workbook = XLSX.read(bytes, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON with headers
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        resolve(jsonData as any[]);
      } catch (error) {
        console.error('Error parsing Excel data:', error);
        reject(error);
      }
    });
  };

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
        
        // Get the base64 data part
        const base64Data = uploadedFile.split(',')[1];
        
        // Parse the file depending on its type
        if (fileInfo.extension === '.csv') {
          await new Promise<void>((resolve) => {
            // Convert base64 data back to a file object
            const dataType = uploadedFile.split(',')[0].split(':')[1].split(';')[0];
            const byteString = atob(base64Data);
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            
            for (let i = 0; i < byteString.length; i++) {
              ia[i] = byteString.charCodeAt(i);
            }
            
            const blob = new Blob([ab], { type: dataType });
            const file = new File([blob], fileInfo.name || "file.csv", { type: dataType });
            
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
          try {
            // Parse Excel data from base64
            fileData = await parseExcelData(base64Data);
            setParsedData(fileData);
            
            toast({
              title: "Excel file processed",
              description: `Successfully parsed ${fileData.length} rows from the Excel file.`
            });
          } catch (error) {
            console.error('Error processing Excel file:', error);
            toast({
              title: "Error processing Excel file",
              description: "Could not process the Excel file. It may be corrupted or in an unsupported format.",
              variant: "destructive"
            });
            setIsAnalyzing(false);
            return;
          }
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
            ...invalidEmails.slice(0, 5).map((row, index) => `- Row ${index + 1}: "${row.email}" is not a valid email address`),
            invalidEmails.length > 5 ? `- And ${invalidEmails.length - 5} more...` : ''
          ].filter(Boolean) : ['All email addresses follow valid format']
        };

        // Add numeric values validation explicitly
        const invalidNumeric = fileData.filter(row => {
          return row.age !== undefined && isNaN(parseFloat(row.age));
        });

        const numericValidation: ValidationStatusResult = {
          id: 'numeric-values',
          name: 'Numeric Data Validation',
          status: invalidNumeric.length > 0 ? 'fail' : 'pass',
          severity: 'warning',
          technical_details: invalidNumeric.length > 0 ? [
            `Found ${invalidNumeric.length} records with non-numeric values in numeric fields:`,
            ...invalidNumeric.slice(0, 5).map((row, index) => `- Row ${index + 1}: "${row.age}" in age field is not a valid number`),
            invalidNumeric.length > 5 ? `- And ${invalidNumeric.length - 5} more...` : ''
          ].filter(Boolean) : ['All numeric fields contain valid numbers']
        };

        // Add phone format validation
        const invalidPhone = fileData.filter(row => {
          const phoneRegex = /^[\d\+\-\(\)\s]+$/;
          return row.phone && !phoneRegex.test(String(row.phone));
        });

        const phoneValidation: ValidationStatusResult = {
          id: 'phone-format',
          name: 'Phone Format Validation',
          status: invalidPhone.length > 0 ? 'fail' : 'pass',
          severity: 'warning',
          technical_details: invalidPhone.length > 0 ? [
            `Found ${invalidPhone.length} records with invalid phone formats:`,
            ...invalidPhone.slice(0, 5).map((row, index) => `- Row ${index + 1}: "${row.phone}" is not a valid phone number`),
            invalidPhone.length > 5 ? `- And ${invalidPhone.length - 5} more...` : ''
          ].filter(Boolean) : ['All phone numbers follow valid format']
        };
        
        // Ensure all results have the required properties for ValidationStatusResult
        const formattedResults: ValidationStatusResult[] = [
          ...results.map(result => ({
            ...result,
            name: result.name || result.id || ''
          })),
          emailFormatValidation,
          numericValidation,
          phoneValidation
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
            description: `${warnings.length} quality issues can be addressed in spreadsheet mode.`,
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

          {/* Progress Steps */}
          <ScrollArea className="w-full pb-4">
            <div className="flex justify-between items-center mb-12 min-w-max pr-6">
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
          </ScrollArea>
          
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
                    <li>Warnings can be addressed using the Spreadsheet Mode to fix data issues</li>
                    <li>Click the <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-blue-100 text-blue-800"><FileSpreadsheet className="h-3 w-3 mr-1" />Fix Data</span> button to correct issues</li>
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
              <Loading message="Analyzing data quality..." />
            ) : parsedData.length > 0 ? (
              <div className="overflow-hidden">
                <ScrollArea className="w-full h-[600px]">
                  <div className="min-w-full pr-6">
                    <ValidationStatus 
                      results={validationResults}
                      title="Data Quality Results"
                      data={parsedData}
                    />
                  </div>
                </ScrollArea>
              </div>
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
