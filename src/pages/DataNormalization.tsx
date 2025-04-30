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
  ArrowUpCircle
} from "lucide-react";
import MapColumns from "@/components/icons/MapColumns";
import DataQuality from "@/components/icons/DataQuality";
import TransformData from "@/components/icons/TransformData";
import ProgressStep from "@/components/ProgressStep";
import StepConnector from "@/components/StepConnector";
import ValidationStatus, { ValidationResult } from '@/components/ValidationStatus';
import { ValidationCategory } from "@/constants/validations";
import { runValidationsForStage, allValidationsPass } from "@/services/validationRunner";

export default function DataNormalization() {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [normalizationResults, setNormalizationResults] = useState<ValidationResult[]>([]);
  const [validationResults, setValidationResults] = useState<any[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    const analyzeNormalization = async () => {
      try {
        setIsAnalyzing(true);
        const results: ValidationResult[] = [
          {
            id: 'phone-standardization',
            name: 'Phone Number Standardization',
            status: 'warning',
            severity: 'warning',
            description: 'Phone numbers need formatting standardization',
            technical_details: [
              'Found inconsistent phone number formats',
              '15 numbers missing country codes',
              '8 numbers using varying separators',
              'Recommended format: +X-XXX-XXX-XXXX'
            ]
          },
          {
            id: 'email-casing',
            name: 'Email Address Casing',
            status: 'pass',
            severity: 'low',
            description: 'Email addresses will be normalized to lowercase',
            technical_details: [
              '23 email addresses contain uppercase characters',
              'Will be automatically converted to lowercase',
              'No action required'
            ]
          },
          {
            id: 'name-capitalization',
            name: 'Name Field Capitalization',
            status: 'warning',
            severity: 'warning',
            description: 'Name fields have inconsistent capitalization',
            technical_details: [
              'Found 18 records with lowercase names',
              'Found 7 records with ALL CAPS names',
              'Will normalize to Title Case format'
            ]
          },
          {
            id: 'address-format',
            name: 'Address Format Standardization',
            status: 'pass',
            severity: 'high',
            description: 'Address formats are consistent',
            technical_details: [
              'Street addresses follow standard format',
              'City names properly capitalized',
              'State codes are standardized'
            ]
          }
        ];

        setNormalizationResults(results);
        
        const warnings = results.filter(r => r.status === 'warning');
        const failures = results.filter(r => r.status === 'fail' && r.severity === 'critical');

        if (failures.length > 0) {
          toast({
            title: "Critical normalization issues found",
            description: `${failures.length} critical issues need attention.`,
            variant: "destructive"
          });
        } else if (warnings.length > 0) {
          toast({
            title: "Normalization suggestions available",
            description: `${warnings.length} data fields can be normalized.`,
            variant: "warning"
          });
        } else {
          toast({
            title: "Normalization check complete",
            description: "All data follows standard formats."
          });
        }
      } catch (error) {
        console.error('Normalization analysis error:', error);
        toast({
          title: "Analysis failed",
          description: "An error occurred during normalization analysis.",
          variant: "destructive"
        });
      } finally {
        setIsAnalyzing(false);
      }
    };

    analyzeNormalization();
  }, [toast]);

  const runNormalizationValidations = async () => {
    setIsValidating(true);
    
    try {
      // In a real app, we would get actual data from previous steps
      // For demo purposes, we'll create mock data
      const mockData = {
        rows: [
          { name: "  John Smith  ", email: "JOHN@EXAMPLE.COM", date: "1/2/2023", phone: "(123) 456-7890" },
          { name: "Jane Doe", email: "jane.doe@example.com", date: "01/15/2023", phone: "123.456.7890" },
          { name: "Bob Johnson", email: "bob@example.com", date: "2023-01-30", phone: "123-456-7890" }
        ]
      };
      
      // Run validations for DATA_NORMALIZATION stage
      const results = await runValidationsForStage(ValidationCategory.DATA_NORMALIZATION, mockData);
      
      setValidationResults(results);
    } catch (error) {
      console.error("Error during data normalization:", error);
      toast({
        title: "Normalization error",
        description: "An error occurred during data normalization.",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  useEffect(() => {
    runNormalizationValidations();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header currentPage="import-wizard" />

      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <Link to="/import-wizard/data-quality">
                <Button variant="outline">
                  <ArrowLeft className="mr-2" />
                  Back
                </Button>
              </Link>
              <h2 className="text-2xl font-bold">Data Normalization</h2>
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
              icon={<DataQuality />}
              label="Data Quality"
              isComplete={true}
            />
            <StepConnector isCompleted={true} />
            <ProgressStep 
              icon={<TransformData />}
              label="Data Normalization"
              isActive={true}
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
            <h3 className="text-xl font-semibold mb-4">Data Normalization Analysis</h3>
            <p className="text-gray-600 mb-6">
              We're analyzing your data for inconsistencies and standardization opportunities.
            </p>
            
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center p-8 bg-gray-50 border rounded-md">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-purple mb-4"></div>
                <p className="text-gray-500">Analyzing data formats...</p>
              </div>
            ) : (
              <ValidationStatus 
                results={normalizationResults}
                title="Normalization Results"
              />
            )}
          </div>

          <div className="mt-8 flex justify-between items-center">
            <div className="flex gap-4">
              <Link to="/import-wizard/data-quality">
                <Button variant="outline">
                  <ArrowLeft className="mr-2" />
                  Back
                </Button>
              </Link>
            </div>
            <Link to="/import-wizard/deduplication">
              <Button 
                className="bg-brand-purple hover:bg-brand-purple/90"
                disabled={isAnalyzing || normalizationResults.some(v => v.status === 'fail' && v.severity === 'critical')}
              >
                Continue to Deduplication
                <ArrowRight className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
