import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft } from "lucide-react";
import ValidationStatus from "@/components/ValidationStatus";
import { ValidationCategory } from "@/constants/validations";
import { runValidationsForStage, allValidationsPass } from "@/services/validationRunner";
import { useToast } from "@/hooks/use-toast";

export default function FileVerification() {
  const [file, setFile] = useState<File | null>(null);
  const [isValidating, setIsValidating] = useState(true);
  const [validationResults, setValidationResults] = useState<any[]>([]);
  const [hasBlockingErrors, setHasBlockingErrors] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // In a real app, we would get the file from a state manager or session storage
    // For demo purposes, we'll create a mock file
    const mockFile = new File(["dummy content"], "sample.csv", { type: "text/csv" });
    setFile(mockFile);
    runValidations(mockFile);
  }, []);

  const runValidations = async (fileToValidate: File) => {
    setIsValidating(true);
    
    try {
      // Run validations for the FILE_VERIFICATION stage
      const results = await runValidationsForStage(ValidationCategory.VERIFY_FILE, fileToValidate);
      
      setValidationResults(results);
      
      // Check if there are any critical errors that block continuing
      const hasCriticalErrors = !allValidationsPass(results, 'none');
      setHasBlockingErrors(hasCriticalErrors);
      
      if (hasCriticalErrors) {
        toast({
          title: "Critical issues detected",
          description: "Please fix these issues before proceeding.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error during file verification:", error);
      toast({
        title: "Verification error",
        description: "An error occurred during file verification.",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleContinue = () => {
    if (!hasBlockingErrors) {
      navigate("/import-wizard/column-mapping");
    }
  };

  return (
    <div>
      <Header />
      <div className="container mx-auto mt-8">
        <h2 className="text-2xl font-bold mb-4">File Verification</h2>
        
        {file ? (
          <div>
            {isValidating ? (
              <p>Validating file...</p>
            ) : (
              <div>
                {validationResults.length > 0 && (
                  <ValidationStatus 
                    results={validationResults} 
                    title="File Verification Results" 
                  />
                )}
                
                <div className="flex justify-between mt-6">
                  <Link to="/import-wizard/upload">
                    <Button variant="outline">
                      <ArrowLeft className="mr-2" />
                      Back to Upload
                    </Button>
                  </Link>
                  <Button onClick={handleContinue} disabled={hasBlockingErrors}>
                    Continue to Mapping
                    <ArrowRight className="ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p>No file to verify. Please upload a file first.</p>
        )}
      </div>
    </div>
  );
}
