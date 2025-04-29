
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
  Wrench
} from "lucide-react";
import MapColumns from "@/components/icons/MapColumns";
import DataQualityIcon from "@/components/icons/DataQuality";
import TransformData from "@/components/icons/TransformData";
import ProgressStep from "@/components/ProgressStep";
import StepConnector from "@/components/StepConnector";
import ValidationStatus, { ValidationResult as ValidationStatusResult } from '@/components/ValidationStatus';
import ErrorCorrectionDialog, { ErrorRow } from '@/components/ErrorCorrectionDialog';
import { validateDataQuality } from "@/services/fileValidation";
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
  const [isErrorCorrectionOpen, setIsErrorCorrectionOpen] = useState(false);
  const [currentValidation, setCurrentValidation] = useState<ValidationStatusResult | null>(null);
  const [errorRowsToFix, setErrorRowsToFix] = useState<ErrorRow[]>([]);
  const [mockData, setMockData] = useState<any[]>([]);

  useEffect(() => {
    const analyzeDataQuality = async () => {
      try {
        setIsAnalyzing(true);
        
        // In a real application, this would come from your state/context
        // For demonstration, we'll use mock data
        const initialMockData = [
          { 
            name: "John Smith", 
            email: "john@example.com", 
            age: 32, 
            state: "CA", 
            zip_code: "94103",
            company: "  Acme Corp  ",
            start_date: "2022-01-01",
            end_date: "2023-01-01"
          },
          { 
            name: "Jane Doe", 
            email: "not-an-email", 
            age: 28, 
            state: "TX", 
            zip_code: "75001",
            company: "XYZ Inc",
            start_date: "2022-05-01",
            end_date: "2022-03-01" // intentional error: end before start
          },
          { 
            name: "Bob Johnson", 
            email: "bob@example.com", 
            age: 150, // out of range
            state: "ZZ", // invalid state
            zip_code: "12345-678", // invalid format
            company: "123 Company",
            start_date: "2022-01-15",
            end_date: "2022-06-30"
          }
        ];

        setMockData(initialMockData);

        // Run data quality validation
        const results = validateDataQuality(initialMockData);

        // Ensure all results have the required properties for ValidationStatusResult
        const formattedResults: ValidationStatusResult[] = results.map(result => ({
          ...result,
          name: result.name || result.id || ''
        }));

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

  const handleFixValidation = (validation: ValidationStatusResult) => {
    setCurrentValidation(validation);
    
    // Find rows with issues based on validation type
    let rowsWithErrors: ErrorRow[] = [];
    
    // This is a simplified example - in a real app, you would have proper error detection logic
    switch(validation.id) {
      case 'email-format':
        rowsWithErrors = mockData
          .map((row, index) => {
            const email = row.email;
            if (!email || !email.includes('@') || !email.includes('.')) {
              return {
                rowIndex: index,
                rowData: {...row},
                errorColumns: ['email']
              };
            }
            return null;
          })
          .filter(Boolean) as ErrorRow[];
        break;

      case 'age-range':
        rowsWithErrors = mockData
          .map((row, index) => {
            if (row.age < 0 || row.age > 120) {
              return {
                rowIndex: index,
                rowData: {...row},
                errorColumns: ['age']
              };
            }
            return null;
          })
          .filter(Boolean) as ErrorRow[];
        break;

      case 'state-code':
        rowsWithErrors = mockData
          .map((row, index) => {
            const validStates = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 
                                'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 
                                'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 
                                'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 
                                'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'];
            if (!validStates.includes(row.state)) {
              return {
                rowIndex: index,
                rowData: {...row},
                errorColumns: ['state']
              };
            }
            return null;
          })
          .filter(Boolean) as ErrorRow[];
        break;

      case 'zip-code-format':
        rowsWithErrors = mockData
          .map((row, index) => {
            const zipPattern = /^\d{5}(-\d{4})?$/;
            if (!zipPattern.test(row.zip_code)) {
              return {
                rowIndex: index,
                rowData: {...row},
                errorColumns: ['zip_code']
              };
            }
            return null;
          })
          .filter(Boolean) as ErrorRow[];
        break;

      case 'date-consistency':
        rowsWithErrors = mockData
          .map((row, index) => {
            const startDate = new Date(row.start_date);
            const endDate = new Date(row.end_date);
            
            if (startDate > endDate) {
              return {
                rowIndex: index,
                rowData: {...row},
                errorColumns: ['start_date', 'end_date']
              };
            }
            return null;
          })
          .filter(Boolean) as ErrorRow[];
        break;

      default:
        // For any other validation, include a sample row for demonstration
        rowsWithErrors = [{
          rowIndex: 0,
          rowData: mockData[0],
          errorColumns: ['name', 'email']
        }];
    }

    setErrorRowsToFix(rowsWithErrors);
    setIsErrorCorrectionOpen(true);
  };

  const handleSaveCorrections = (correctedRows: ErrorRow[]) => {
    // Update mock data with corrections
    const updatedData = [...mockData];
    
    correctedRows.forEach(correctedRow => {
      updatedData[correctedRow.rowIndex] = {
        ...updatedData[correctedRow.rowIndex],
        ...correctedRow.rowData
      };
    });
    
    setMockData(updatedData);
    
    // Update validation results - in a real application, you would re-run validation
    if (currentValidation) {
      const updatedResults = validationResults.map(result => {
        if (result.id === currentValidation.id) {
          return {
            ...result,
            status: 'pass',
            description: 'Manually corrected by user'
          };
        }
        return result;
      });
      
      setValidationResults(updatedResults);
    }
  };

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
            ) : (
              <ValidationStatus 
                results={validationResults}
                title="Data Quality Results"
                actionButtons={result => 
                  (result.status === 'warning' || result.status === 'fail') && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex items-center gap-1 mt-2"
                      onClick={() => handleFixValidation(result)}
                    >
                      <Wrench className="h-3.5 w-3.5" />
                      Fix Issues
                    </Button>
                  )
                }
              />
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

      {/* Error correction dialog */}
      <ErrorCorrectionDialog
        open={isErrorCorrectionOpen}
        onClose={() => setIsErrorCorrectionOpen(false)}
        title={currentValidation?.name || "Fix Data Issues"}
        description={currentValidation?.description || ""}
        errorRows={errorRowsToFix}
        onSaveCorrections={handleSaveCorrections}
      />
    </div>
  );
}
