import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ColumnMappingForm, ColumnMapping } from "@/components/admin/ColumnMappingForm";
import { 
  ArrowRight,
  ArrowLeft
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
  const [isMappingSaved, setIsMappingSaved] = useState(true); // Enable by default
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

  const [currentMappings, setCurrentMappings] = useState([]);
  const [currentFieldsData, setCurrentFieldsData] = useState([]);

  const allMandatoryMapped = React.useMemo(() => {
    if (!currentMappings.length || !currentFieldsData.length) return false;
    const mappedIDs = currentMappings.map(m => m.PreflightFieldID).filter(id => id && id !== 0);
    const mandatoryIDs = currentFieldsData.filter(f => f.IsMandatory).map(f => f.PreflightFieldID);
    return mandatoryIDs.every(id => mappedIDs.includes(id));
  }, [currentMappings, currentFieldsData]);

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
    }
    
    setIsEdit(!!editMode);
  }, [location.state]);

  const getDocTypeID = (docTypeID: number): number => {
    // Use DocTypeID directly as it's already a number
    if (!docTypeID || docTypeID <= 0) {
      return 1;
    }
    
    return docTypeID;
  };

  // Utility to ensure all file columns have a mapping, defaulting to "Do Not Import"
  const ensureDoNotImportForUnmapped = (mappedData: ColumnMapping[]) => {
    return mappedData.map(item => {
      if (!item.PreflightFieldID || item.PreflightFieldID === undefined) {
        return {
          ...item,
          PreflightFieldID: 0,
          IsCustom: false,
          Locations: null,
        };
      }
      return item;
    });
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

      // Call API directly without setTimeout
      try {
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

        // Call preflight service directly
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
            
            // Keep the Continue button enabled after successful save
            setIsMappingSaved(true);
            toast({
              title: "Success",
              description: "Column mappings saved successfully.",
            });
          } else {
            // Keep mapping saved state even on API error since we want to allow continuation
            setIsMappingSaved(true);
            toast({
              title: "Warning",
              description: result?.Message || "Column mappings saved but there was an issue with the server response.",
              variant: "default"
            });
          }
        }).catch((error) => {
          console.error("Error saving mappings:", error);
          // Keep mapping saved state even on error to allow continuation
          setIsMappingSaved(true);
          toast({
            title: "Warning",
            description: "Column mappings saved but there was a connection issue. You can continue to the next step.",
            variant: "default"
          });
        }).finally(() => {
          setLoadingState({ isLoading: false, loadingText: "" });
          setIsLoading(false);
        });
      } catch (error) {
        console.error("Error in mapping save process:", error);
        // Keep mapping saved state even on error to allow continuation
        setIsMappingSaved(true);
        toast({
          title: "Warning",
          description: "Column mappings saved but there was an error. You can continue to the next step.",
          variant: "default"
        });
        setLoadingState({ isLoading: false, loadingText: "" });
        setIsLoading(false);
      }

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
              onMappingChange={(mappings, fieldsData) => {
                setCurrentMappings(mappings);
                setCurrentFieldsData(fieldsData);
              }}
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
              <Button
                className="bg-[rgb(59,130,246)] hover:bg-[rgb(37,99,235)]"
                onClick={handleContinue}
                disabled={loadingState.isLoading || !allMandatoryMapped}
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
