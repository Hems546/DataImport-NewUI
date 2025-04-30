
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft } from "lucide-react";
import ValidationStatus from "@/components/ValidationStatus";
import { useToast } from "@/hooks/use-toast";
import ValidationDashboard from "@/components/ValidationDashboard";

import { ValidationCategory } from "@/constants/validations";
import { runValidationsForStage, allValidationsPass } from "@/services/validationRunner";

export default function DataQuality() {
  const { toast } = useToast();
  const [isDataCorrected, setIsDataCorrected] = useState(false);
  const [isDataUploaded, setIsDataUploaded] = useState(false);
  const [isMappingDone, setIsMappingDone] = useState(false);
  const [isTransformationDone, setIsTransformationDone] = useState(false);
  const [isDeduplicationDone, setIsDeduplicationDone] = useState(false);
  const [isFinalReviewDone, setIsFinalReviewDone] = useState(false);
  const [isImportDone, setIsImportDone] = useState(false);
  const [isOverrideAvailable, setIsOverrideAvailable] = useState(false);
  const [validationResults, setValidationResults] = useState<any[]>([]);
  const [hasBlockingErrors, setHasBlockingErrors] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [allValidationResults, setAllValidationResults] = useState({
    [ValidationCategory.FILE_UPLOAD]: [],
    [ValidationCategory.VERIFY_FILE]: [],
    [ValidationCategory.COLUMN_MAPPING]: [],
    [ValidationCategory.DATA_QUALITY]: [],
    [ValidationCategory.DATA_NORMALIZATION]: [],
    [ValidationCategory.DEDUPLICATION]: [],
    [ValidationCategory.FINAL_REVIEW]: [],
    [ValidationCategory.IMPORT_PUSH]: []
  });
  
  const validateDataQuality = async () => {
    setIsValidating(true);
    
    try {
      // In a real app, we would get actual data from previous steps
      // For demo purposes, we'll create mock data
      const mockData = [
        { name: "John Smith", email: "john@example.com", age: 32, state: "CA" },
        { name: "Jane Doe", email: "not-an-email", age: 28, state: "TX" },
        { name: "Bob Johnson", email: "bob@example.com", age: 150, state: "ZZ" },
        { name: "Alice Williams", email: "alice-at-example.com", age: 42, state: "NY" }
      ];
      
      // Run validations for DATA_QUALITY stage
      const results = await runValidationsForStage(ValidationCategory.DATA_QUALITY, mockData);
      
      setValidationResults(results);
      
      // Update all validation results
      setAllValidationResults(prevResults => ({
        ...prevResults,
        [ValidationCategory.DATA_QUALITY]: results
      }));
      
      // Check if there are any critical errors that block continuing
      const hasCriticalErrors = !allValidationsPass(results, 'warning');
      setHasBlockingErrors(hasCriticalErrors);
      
      if (hasCriticalErrors) {
        toast({
          title: "Data quality issues detected",
          description: "Please fix these issues before proceeding.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error during data quality validation:", error);
      toast({
        title: "Validation error",
        description: "An error occurred during data validation.",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };
  
  // Run validation on component mount
  useEffect(() => {
    validateDataQuality();
  }, []);
  
  // Handle fixing data quality issues
  const handleFixIssues = (validationId: string, correctedRows: any[]) => {
    // In a real app, we would update the actual data
    console.log(`Fixing issues for validation ${validationId}`, correctedRows);
    
    // Re-run validation after fixes
    validateDataQuality();
    
    toast({
      title: "Data updated",
      description: "The data has been updated with your corrections.",
    });
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header currentPage="import-wizard" />
      
      <div className="container mx-auto mt-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Data Quality</h1>
            <p className="text-gray-600">
              Validate and fix data quality issues before proceeding
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-6">
          <ValidationDashboard validationResults={allValidationResults} />

          {isValidating ? (
            <div className="flex justify-center my-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="mt-6">
              {validationResults.length > 0 && (
                <ValidationStatus
                  results={validationResults}
                  title="Data Quality Validation Results"
                />
              )}
            </div>
          )}
        </div>
        
        <div className="flex justify-between mt-8">
          <Link to="/import-wizard/column-mapping">
            <Button variant="outline">
              <ArrowLeft className="mr-2" />
              Back to Column Mapping
            </Button>
          </Link>
          <Link to="/import-wizard/normalization">
            <Button 
              disabled={hasBlockingErrors || isValidating}
            >
              Continue to Data Transformation
              <ArrowRight className="ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
