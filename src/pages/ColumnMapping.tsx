import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ColumnMappingForm, ColumnMapping } from "@/components/admin/ColumnMappingForm";
import { 
  ArrowRight,
  ArrowLeft,
  RefreshCw
} from "lucide-react";
import { ImportStepHeader } from "@/components/ImportStepHeader";
import ValidationStatus, { ValidationResult } from '@/components/ValidationStatus';
import { validateColumnMappings } from '@/services/fileValidation';
import { preflightService } from "@/services/preflightService";

interface PreflightResponse {
  content?: {
    Data?: {
      ID: number;
      Message?: string;
      Status?: string;
      DataStatus?: string;
    };
  };
}

export default function ColumnMappingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Get data from location state
  const locationPreflightFileInfo = location.state?.preflightFileInfo;
  const currentStep = location.state?.currentStep;
  const completedSteps = location.state?.completedSteps || [];
  
  const [preflightFileID, setPreflightFileID] = useState<number>(0);
  const [isEdit, setIsEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMappingSaved, setIsMappingSaved] = useState(false);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [hasValidationErrors, setHasValidationErrors] = useState(false);
  const [loadingState, setLoadingState] = useState({
    isLoading: false,
    loadingText: ""
  });
  const [preflightFileInfo, setPreflightFileInfo] = useState(() => 
    locationPreflightFileInfo || {
      PreflightFileID: 0,
      Status: "",
      FileUploadStatus: "Success", // Default to Success to show File Upload as completed
      FieldMappingStatus: "In Progress", // Current step
      DataPreflightStatus: "",
      DataValidationStatus: "",
      DataVerificationStatus: "",
      ImportName: "",
      Action: "Field Mapping",
      AddColumns: "",
      FileName: "",
      FileType: "",
      FileSize: 0,
      FileExtension: "",
      FileData: "",
      DocTypeID: 0,
      ImportTypeName: "Company & Contact Data",
      MappedFieldIDs: [],
      FilePath: ""
    }
  );
  


  useEffect(() => {
    // Get data from route state instead of localStorage
    const state = location.state as any;
    const { preflightFileInfo: incomingPreflightFileInfo, isEdit: editMode } = state || {};
    
    if (incomingPreflightFileInfo) {
      // Use the incoming preflightFileInfo which contains the correct DocTypeID from the previous page
      setPreflightFileInfo(incomingPreflightFileInfo);
      
      if (incomingPreflightFileInfo.PreflightFileID) {
        setPreflightFileID(incomingPreflightFileInfo.PreflightFileID);
      }

      // If FieldMappingStatus is already Success, enable the Continue button
      if (incomingPreflightFileInfo.FieldMappingStatus === "Success") {
        setIsMappingSaved(true);
      }
    }
    
    setIsEdit(!!editMode);
  }, [location.state]);

  // Watch for changes to FieldMappingStatus and enable Continue button if it becomes Success
  useEffect(() => {
    if (preflightFileInfo.FieldMappingStatus === "Success") {
      setIsMappingSaved(true);
    } else if (preflightFileInfo.FieldMappingStatus === "In Progress") {
      // For large datasets, the status might remain "In Progress" initially
      // We'll keep the button disabled until it becomes "Success"
      setIsMappingSaved(false);
    }
  }, [preflightFileInfo.FieldMappingStatus]);

  const getDocTypeID = (docTypeID: number): number => {
    // Use DocTypeID directly as it's already a number
    if (!docTypeID || docTypeID <= 0) {
      return 1;
    }
    
    return docTypeID;
  };

  // Function to check current status and retry if needed
  const checkCurrentStatus = async () => {
    if (!preflightFileID) return;
    
    setLoadingState({
      isLoading: true,
      loadingText: "Checking current processing status..."
    });
    
    try {
      // Call the API to get current status
      const request = {
        PreflightFileID: preflightFileID,
        Action: "Check Status",
        IsValidate: false,
        AddColumns: "",
        FilePath: preflightFileInfo.FilePath || "",
        FileType: preflightFileInfo.FileType || "",
        FileName: preflightFileInfo.FileName || "",
        ImportName: preflightFileInfo.ImportName || "",
        DocTypeID: getDocTypeID(preflightFileInfo.DocTypeID)
      };
      
      const res = await preflightService.saveFile(request) as PreflightResponse;
      const result = res?.content?.Data;
      
      if (result?.ID > 0) {
        let dataStatus: any = result?.DataStatus;
        if (dataStatus && dataStatus !== "") {
          try {
            dataStatus = JSON.parse(dataStatus);
          } catch (e) {
            console.error("Error parsing DataStatus:", e);
            dataStatus = {};
          }
        } else {
          dataStatus = {};
        }
        
        // Update preflightFileInfo with latest status
        setPreflightFileInfo((prev) => ({
          ...prev,
          PreflightFileID: result?.ID,
          Status: result?.Status,
          FileUploadStatus: dataStatus?.FileUpload,
          FieldMappingStatus: dataStatus?.FieldMapping,
          DataPreflightStatus: dataStatus?.DataPreflight,
          DataValidationStatus: dataStatus?.DataValidation,
          DataVerificationStatus: dataStatus?.DataVerification,
        }));
        
        if (dataStatus?.FieldMapping === "Success") {
          setIsMappingSaved(true);
          toast({
            title: "Success",
            description: "Column mappings have been processed successfully!",
          });
        } else {
          toast({
            title: "Still Processing",
            description: "Column mappings are still being processed. Please wait a moment and try again.",
            variant: "default"
          });
        }
      }
    } catch (error) {
      console.error("Error checking status:", error);
      toast({
        title: "Error",
        description: "Failed to check current status. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoadingState({ isLoading: false, loadingText: "" });
    }
  };



  const handleMappingSave = (mappings: ColumnMapping[]) => {
    setLoadingState({
      isLoading: true,
      loadingText: "Saving column mappings and validating data. Please wait..."
    });
    setIsLoading(true);
    
    try {
      // Save mappings to localStorage
      localStorage.setItem('columnMappings', JSON.stringify(mappings));

      // Check for duplicate field mappings
      const originValues = mappings
        ?.filter(
          (x) =>
            x.PreflightFieldID !== 0 &&
            !x.PreflightFieldID?.toString().startsWith('-9999')
        )
        ?.map((x) => x.PreflightFieldID);
      
      const duplicates = originValues?.filter(
        (item, index) => originValues.indexOf(item) !== index
      );
      const duplicateValues = Array.from(new Set(duplicates));

      if (duplicateValues?.length) {
        let duplicateNames = "";
        for (let i = 0; i < duplicateValues.length; i++) {
          let fieldInfo = mappings.find(
            (x) => x.PreflightFieldID == duplicateValues[i]
          );
          if (fieldInfo) {
            duplicateNames += fieldInfo["DisplayName"] + ",";
          }
        }
        duplicateNames = duplicateNames.substring(0, duplicateNames.length - 1);
        toast({
          title: "Validation Error",
          description: `The fields below are already assigned to another column. Please choose a different one: ${duplicateNames}`,
          variant: "destructive"
        });
        setLoadingState({ isLoading: false, loadingText: "" });
        setIsLoading(false);
        return;
      }

      // Update loading text for validation phase
      setLoadingState({
        isLoading: true,
        loadingText: "Validating column mappings and checking for errors..."
      });

      // Function to proceed with API call after validation
      const proceedWithApiCall = () => {
        // Update loading text for API call phase
        setLoadingState({
          isLoading: true,
          loadingText: "Communicating with server to save your mappings..."
        });

        // Prepare request object for preflight service
        const request = {
          MappedFieldIDs: mappings.map(mapping => ({
            FileColumnName: mapping.sourceColumn,
            PreflightFieldID: mapping.PreflightFieldID,
            IsCustom: mapping.IsCustom,
            Location: mapping.Locations
          })),
          IsValidate: true,
          Action: "Field Mappings",
          AddColumns: "",
          FilePath: preflightFileInfo.FilePath || "",
          FileType: preflightFileInfo.FileType || "",
          PreflightFileID: preflightFileID,
          FileName: preflightFileInfo.FileName || "",
          ImportName: preflightFileInfo.ImportName || "",
          DocTypeID: getDocTypeID(preflightFileInfo.DocTypeID)
        };

        // Call preflight service
        preflightService.saveFile(request).then((res: PreflightResponse) => {
          const result = res?.content?.Data;
          if (result?.ID > 0) {
            // Parse and update status information from API response
            let dataStatus: any = result?.DataStatus;
            if (dataStatus && dataStatus !== "") {
              try {
                dataStatus = JSON.parse(dataStatus);
              } catch (e) {
                console.error("Error parsing DataStatus:", e);
                dataStatus = {};
              }
            } else {
              dataStatus = {};
            }
            
            // Update preflightFileInfo with latest status information
            setPreflightFileInfo((prev) => ({
              ...prev,
              PreflightFileID: result?.ID,
              Status: result?.Status,
              FileUploadStatus: dataStatus?.FileUpload,
              FieldMappingStatus: dataStatus?.FieldMapping,
              DataPreflightStatus: dataStatus?.DataPreflight,
              DataValidationStatus: dataStatus?.DataValidation,
              DataVerificationStatus: dataStatus?.DataVerification,
            }));
            
            // Check if FieldMapping status is Success to enable the button
            if (dataStatus?.FieldMapping === "Success") {
              setIsMappingSaved(true);
              toast({
                title: "Success",
                description: "Column mappings saved successfully.",
              });
            } else {
              // If FieldMapping is still "In Progress", we need to wait or handle differently
              setIsMappingSaved(false);
              toast({
                title: "Processing",
                description: "Column mappings are being processed. For large datasets, this may take a moment. You can try saving again or wait for processing to complete.",
                variant: "default"
              });
            }
          } else {
            // Reset mapping saved state on error
            setIsMappingSaved(false);
            toast({
              title: "Error",
              description: result?.Message || "Failed to save column mappings. Please try again.",
              variant: "destructive"
            });
          }
        }).catch((error) => {
          console.error("Error saving mappings:", error);
          // Reset mapping saved state on error
          setIsMappingSaved(false);
          toast({
            title: "Error",
            description: "Failed to save column mappings. Please try again.",
            variant: "destructive"
          });
        }).finally(() => {
          setLoadingState({ isLoading: false, loadingText: "" });
          setIsLoading(false);
        });
      };

      // Validate mappings asynchronously to prevent UI blocking with large data
      setTimeout(() => {
        try {
          const sourceColumns = mappings.map(m => m.sourceColumn);
          const mappedFields = mappings.map(m => ({
            sourceColumn: m.sourceColumn,
            targetField: m.targetField
          }));

          const validationResults = validateColumnMappings(sourceColumns, mappedFields);
          const formattedResults: ValidationResult[] = validationResults.map(result => ({
            id: result.id,
            name: result.validation_type,
            status: result.status,
            description: result.message,
            severity: result.severity,
            technical_details: result.technical_details
          }));
          
          setValidationResults(formattedResults);

          // Check for critical errors
          const hasCriticalErrors = formattedResults.some(
            result => result.severity === 'critical' && result.status === 'fail'
          );
          setHasValidationErrors(hasCriticalErrors);

          if (hasCriticalErrors) {
            setIsMappingSaved(false);
            toast({
              title: "Validation Error",
              description: "Please fix the critical errors before continuing.",
              variant: "destructive"
            });
            setLoadingState({ isLoading: false, loadingText: "" });
            setIsLoading(false);
            return;
          }

          // Continue with API call if validation passes
          proceedWithApiCall();
        } catch (validationError) {
          console.error("Validation error:", validationError);
          setIsMappingSaved(false);
          toast({
            title: "Validation Error",
            description: "An error occurred during validation. Please try again.",
            variant: "destructive"
          });
          setLoadingState({ isLoading: false, loadingText: "" });
          setIsLoading(false);
        }
      }, 0);


    } catch (error) {
      console.error("Error saving mappings:", error);
      // Reset mapping saved state on error
      setIsMappingSaved(false);
      toast({
        title: "Error",
        description: "Failed to save column mappings. Please try again.",
        variant: "destructive"
      });
      setLoadingState({ isLoading: false, loadingText: "" });
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    if (!isMappingSaved) {
      toast({
        title: "Save Required",
        description: "Please save your column mappings before continuing to the next step.",
        variant: "warning"
      });
      return;
    }

    if (hasValidationErrors) {
      toast({
        title: "Validation Error",
        description: "Please fix all validation errors before continuing.",
        variant: "destructive"
      });
      return;
    }

    // Navigate to ImportStepHandler to determine next step
    navigate('/import-step-handler', {
      state: {
        requestedStep: 'DataPreflight',
        preflightFileInfo: {
          ...preflightFileInfo,
          FieldMappingStatus: 'Success'
        }
      }
    });
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Full-Screen Loading Overlay - Similar to Split Full Address */}
      {loadingState.isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md mx-4">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <h3 className="text-lg font-semibold mb-2">Processing Column Mappings</h3>
              <p className="text-gray-600 text-center">
                {loadingState.loadingText || "Please wait while we process your request..."}
              </p>
              <div className="w-64 bg-gray-200 rounded-full h-2 mt-4">
                <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '65%'}}></div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <Header />
      <main className="container mx-auto px-6 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Import Step Header */}
          <ImportStepHeader
            stepTitle="Column Mapping"
            status={preflightFileInfo.Status || 'Not Started'}
            docTypeName={preflightFileInfo.ImportTypeName || 'Company & Contact Data'}
            importName={preflightFileInfo.ImportName || 'Untitled Import'}
            currentStep={currentStep || "FieldMapping"}
            completedSteps={completedSteps.length > 0 ? completedSteps : ["FileUpload"]}
            preflightFileInfo={preflightFileInfo}
            setPreflightFileInfo={setPreflightFileInfo}
          />

          {/* Map Your Columns Info Section */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-4">
            <div className="text-center mb-3">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                Map Your Columns
              </h1>
              <p className="text-sm text-gray-600">
                Match your file columns with our system fields to ensure data is imported correctly
              </p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-2 text-sm">About column mapping:</h3>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-700">
                        <span className="font-medium text-green-700">Auto-mapped</span> columns are highlighted in green
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-700">
                        <span className="font-medium text-blue-700">AI-suggested</span> mappings are highlighted in blue
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span className="text-gray-700">
                        <span className="font-medium text-gray-700">Manual mapping</span> required for remaining columns
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {validationResults.length > 0 && (
            <div className="mb-4">
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                <ValidationStatus 
                  results={validationResults}
                  title="Column Mapping Validation Results"
                />
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <ColumnMappingForm
              preflightFileID={preflightFileID}
              onSave={handleMappingSave}
              isEdit={isEdit}
              isSaving={isLoading}
            />
          </div>

          {/* Navigation Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row sm:justify-between items-center gap-4">
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => navigate('/import-wizard/upload', {
                  state: {
                    preflightFileInfo: preflightFileInfo
                  }
                })}
                disabled={loadingState.isLoading}
              >
                <ArrowLeft className="mr-2" />
                Back
              </Button>
            </div>
            <div className="flex gap-4">
              {/* Show Check Status button when FieldMapping is In Progress */}
              {preflightFileInfo.FieldMappingStatus === "In Progress" && (
                <Button
                  variant="outline"
                  onClick={checkCurrentStatus}
                  disabled={loadingState.isLoading}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Check Status
                </Button>
              )}
              <Button
                className="bg-[rgb(59,130,246)] hover:bg-[rgb(37,99,235)]"
                onClick={handleContinue}
                disabled={hasValidationErrors || loadingState.isLoading || !isMappingSaved}
                title={!isMappingSaved ? "Please save your column mappings to continue" : ""}
              >
                Continue to Data Preflight
                <ArrowRight className="ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
