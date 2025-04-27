
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
  RotateCcw
} from "lucide-react";
import MapColumns from "@/components/icons/MapColumns";
import DataQuality from "@/components/icons/DataQuality";
import TransformData from "@/components/icons/TransformData";
import ProgressStep from "@/components/ProgressStep";
import StepConnector from "@/components/StepConnector";
import ValidationStatus, { ValidationResult } from '@/components/ValidationStatus';

export default function Deduplication() {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [deduplicationResults, setDeduplicationResults] = useState<ValidationResult[]>([]);

  useEffect(() => {
    const analyzeDeduplication = async () => {
      try {
        setIsAnalyzing(true);
        // Simulated deduplication checks - in production these would come from your backend
        const results: ValidationResult[] = [
          {
            id: 'exact-duplicates',
            name: 'Exact Record Duplicates',
            status: 'warning',
            severity: 'warning',
            description: 'Found exact duplicate records',
            technical_details: [
              'Found 12 exact duplicate records based on email address',
              'Recommend removing 8 duplicate entries',
              'Action required: Review and confirm duplicate removal'
            ]
          },
          {
            id: 'fuzzy-matches',
            name: 'Fuzzy Match Detection',
            status: 'warning',
            severity: 'warning',
            description: 'Potential similar records detected',
            technical_details: [
              'Found 5 records with similar names and addresses',
              'Similarity threshold: 85%',
              'Manual review recommended'
            ]
          },
          {
            id: 'case-sensitivity',
            name: 'Case-Sensitive Duplicates',
            status: 'pass',
            severity: 'low',
            description: 'Case-sensitive duplicates will be normalized',
            technical_details: [
              'Found 3 records with case variations',
              'Will be automatically normalized',
              'No action required'
            ]
          },
          {
            id: 'merge-strategy',
            name: 'Merge Strategy Check',
            status: 'pass',
            severity: 'low',
            description: 'Merge strategy determined for duplicates',
            technical_details: [
              'Latest record will be kept for exact duplicates',
              'Manual review required for fuzzy matches',
              'Strategy is ready for implementation'
            ]
          }
        ];

        setDeduplicationResults(results);
        
        const warnings = results.filter(r => r.status === 'warning');
        const failures = results.filter(r => r.status === 'fail' && r.severity === 'critical');

        if (failures.length > 0) {
          toast({
            title: "Critical deduplication issues found",
            description: `${failures.length} critical issues need attention.`,
            variant: "destructive"
          });
        } else if (warnings.length > 0) {
          toast({
            title: "Deduplication review needed",
            description: `${warnings.length} potential duplicate records found.`,
            variant: "warning"
          });
        } else {
          toast({
            title: "Deduplication check complete",
            description: "No significant duplicate issues found."
          });
        }
      } catch (error) {
        console.error('Deduplication analysis error:', error);
        toast({
          title: "Analysis failed",
          description: "An error occurred during deduplication analysis.",
          variant: "destructive"
        });
      } finally {
        setIsAnalyzing(false);
      }
    };

    analyzeDeduplication();
  }, [toast]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header currentPage="import-wizard" />

      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <Link to="/import-wizard/normalization">
                <Button variant="outline">
                  <ArrowLeft className="mr-2" />
                  Back
                </Button>
              </Link>
              <h2 className="text-2xl font-bold">Deduplication</h2>
            </div>
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
              isComplete={true}
            />
            <StepConnector isCompleted={true} />
            <ProgressStep 
              icon={<FileBox />}
              label="Deduplication"
              isActive={true}
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
            <h3 className="text-xl font-semibold mb-4">Deduplication Analysis</h3>
            <p className="text-gray-600 mb-6">
              We're analyzing your data for duplicate records and similar entries.
            </p>
            
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center p-8 bg-gray-50 border rounded-md">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-purple mb-4"></div>
                <p className="text-gray-500">Analyzing data for duplicates...</p>
              </div>
            ) : (
              <ValidationStatus 
                results={deduplicationResults}
                title="Deduplication Results"
              />
            )}
          </div>

          <div className="mt-8 flex justify-between items-center">
            <div className="flex gap-4">
              <Link to="/import-wizard/normalization">
                <Button variant="outline">
                  <ArrowLeft className="mr-2" />
                  Back
                </Button>
              </Link>
              <Button variant="outline">
                <RotateCcw className="mr-2" />
                Start Over
              </Button>
            </div>
            <Link to="/import-wizard/review">
              <Button 
                className="bg-brand-purple hover:bg-brand-purple/90"
                disabled={isAnalyzing || deduplicationResults.some(v => v.status === 'fail' && v.severity === 'critical')}
              >
                Continue to Final Review
                <ArrowRight className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
