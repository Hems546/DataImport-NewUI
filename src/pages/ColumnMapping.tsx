
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ColumnMappingForm, ColumnMapping as ColumnMappingType } from "@/components/admin/ColumnMappingForm";
import { 
  FileCheck,
  ArrowRight,
  ArrowLeft,
  FileBox,
  ClipboardCheck,
  ArrowUpCircle,
  Info
} from "lucide-react";
import MapColumns from "@/components/icons/MapColumns";
import DataQuality from "@/components/icons/DataQuality";
import TransformData from "@/components/icons/TransformData";
import ProgressStep from "@/components/ProgressStep";
import StepConnector from "@/components/StepConnector";
import ValidationStatus, { ValidationResult as ValidationStatusResult } from "@/components/ValidationStatus";
import { validateColumnMappings, FileValidationResult } from "@/services/fileValidation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { systemTemplates } from "@/data/systemTemplates";

export default function ColumnMapping() {
  const { toast } = useToast();
  const [validationResults, setValidationResults] = useState<ValidationStatusResult[]>([]);
  const [hasValidationErrors, setHasValidationErrors] = useState(false);
  const [mockData, setMockData] = useState<any[]>([]);
  
  // Mock source columns (would come from context or state in a real application)
  const sourceColumns = [
    "First Name", "Last Name", "Email Address", "Company", "Phone Number", 
    "Job Title", "Department", "Address Line 1", "City", "State/Province", 
    "Country", "ZIP/Postal"
  ];
  
  // Find the selected template (default to Contacts)
  const template = "Contacts";
  const selectedTemplate = systemTemplates.find(t => t.title === template) || systemTemplates[0];
  
  // Required fields (in a real app, this would come from the selected template)
  const requiredTargetFields = selectedTemplate.fields
    .filter(field => field.required)
    .map(field => field.name);
  
  useEffect(() => {
    // Generate some mock data for the spreadsheet view
    const generateMockData = () => {
      return [
        { 
          "First Name": "John", 
          "Last Name": "Doe", 
          "Email Address": "john@example.com", 
          "Company": "ACME Inc" 
        },
        { 
          "First Name": "Jane", 
          "Last Name": "Smith", 
          "Email Address": "jane@example.com", 
          "Company": "Globex Corp" 
        },
        { 
          "First Name": "Bob", 
          "Last Name": "Johnson", 
          "Email Address": "bob@example.com", 
          "Company": "Widget Co" 
        }
      ];
    };
    
    setMockData(generateMockData());
  }, []);

  const handleMappingSave = (mappings: ColumnMappingType[]) => {
    // Run validation on the mappings
    const fileValidationResults = validateColumnMappings(sourceColumns, mappings, requiredTargetFields);
    
    // Convert to ValidationStatusResult format
    const results: ValidationStatusResult[] = fileValidationResults.map(result => ({
      id: result.id || result.validation_type === "Required Field Missing" ? "required-columns" : result.validation_type,
      name: result.validation_type, // Use validation_type as name (required)
      status: result.status,
      description: result.message,
      severity: result.severity || 'warning',
      technical_details: result.technical_details
    }));
    
    setValidationResults(results);
    
    // Check if there are any critical failures
    const hasCriticalErrors = results.some(result => 
      result.status === 'fail' && result.severity === 'critical'
    );
    
    setHasValidationErrors(hasCriticalErrors);
    
    if (hasCriticalErrors) {
      toast({
        title: "Validation errors detected",
        description: "Please fix the critical errors before continuing.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Column mapping saved",
        description: "Your column mapping has been saved successfully."
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header currentPage="import-wizard" />

      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <Link to="/import-wizard/verification">
                <Button variant="outline">
                  <ArrowLeft className="mr-2" />
                  Back
                </Button>
              </Link>
              <h2 className="text-2xl font-bold">Column Mapping</h2>
            </div>
          </div>

          {/* Progress Steps */}
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

          {/* Instructions Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Map Your Columns</CardTitle>
              <CardDescription>
                Match your file columns with our system fields to ensure data is imported correctly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-medium">About column mapping:</p>
                  <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                    <li><strong>Auto-mapped columns</strong> are highlighted in green</li>
                    <li><strong>AI-suggested mappings</strong> are highlighted in blue</li>
                    <li><strong>Manual mapping</strong> is required for any remaining columns</li>
                  </ul>
                </AlertDescription>
              </Alert>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-medium">Tips for successful mapping:</p>
                  <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                    <li>Required fields are marked with a red asterisk (*)</li>
                    <li>Use "Ignore this column" for data you don't want to import</li>
                    <li>Review AI-suggested mappings for accuracy</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Validation Results Section */}
          {validationResults.length > 0 && (
            <div className="mb-6">
              <ValidationStatus
                results={validationResults}
                title="Column Mapping Validation Results"
                data={mockData}
              />
            </div>
          )}

          {/* Column Mapping Form */}
          <div className="bg-white p-8 rounded-lg border border-gray-200">
            <ColumnMappingForm onSave={handleMappingSave} />
          </div>

          {/* Navigation */}
          <div className="mt-8 flex justify-between items-center">
            <div className="flex gap-4">
              <Link to="/import-wizard/verification">
                <Button variant="outline">
                  <ArrowLeft className="mr-2" />
                  Back
                </Button>
              </Link>
            </div>
            <Link to="/import-wizard/data-quality">
              <Button 
                className="bg-brand-purple hover:bg-brand-purple/90"
                disabled={hasValidationErrors}
              >
                Continue to Data Quality
                <ArrowRight className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
