import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft } from "lucide-react";
import ValidationStatus from "@/components/ValidationStatus";
import { useToast } from "@/hooks/use-toast";

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
    
      
        Data Quality
      
      
        
          
            
              Upload File
            
            
              Verify File
            
            
              Map Columns
            
            
              Data Quality
            
            
              Transform Data
            
            
              Deduplication
            
            
              Final Review
            
          
        

        
          
            
              
                
                  
                    
                      
                        
                          
                            
                              
                                
                                  
                                  
                                
                              
                            
                          
                        
                      
                    
                  
                
              
            
          
        

        
          
            
              
                
                  
                    
                      
                        
                          
                            
                              
                                
                                  
                                  
                                
                              
                            
                          
                        
                      
                    
                  
                
              
            
          
        

        
          
            
              
                
                  
                    
                      
                        
                          
                            
                              
                                
                                  
                                  
                                
                              
                            
                          
                        
                      
                    
                  
                
              
            
          
        

        
          
            
              
                
                  
                    
                      
                        
                          
                            
                              
                                
                                  
                                  
                                
                              
                            
                          
                        
                      
                    
                  
                
              
            
          
        

        
          
            
              
                
                  
                    
                      
                        
                          
                            
                              
                                
                                  
                                  
                                
                              
                            
                          
                        
                      
                    
                  
                
              
            
          
        

        
          
            
              
                
                  
                    
                      
                        
                          
                            
                              
                                
                                  
                                  
                                
                              
                            
                          
                        
                      
                    
                  
                
              
            
          
        
      

      
        
          
            
              
                
                  
                    
                      
                        
                          
                            
                              
                                
                                  
                                  
                                
                              
                            
                          
                        
                      
                    
                  
                
              
            
          
        
      
    
  );
}
