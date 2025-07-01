import React, { useRef, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { 
  Upload,
  FileCheck,
  RotateCcw,
  ArrowRight,
  ArrowLeft
} from "lucide-react";
import StepHeader from "@/components/StepHeader";
import { ImportStepHeader } from "@/components/ImportStepHeader";
import ValidationStatus, { ValidationResult } from '@/components/ValidationStatus';
import { validations, getTechnicalDescription } from '@/constants/validations';
import { validateFile } from '@/services/fileValidation';
import { preflightService } from "@/services/preflightService";

interface PreflightResponse {
  content: {
    Status: string;
    Data: {
      ID: number;
      Status: string;
      DataStatus: string;
      Message?: string;
    };
  };
}

interface DataStatus {
  FileUpload: string;
  FieldMapping: string;
  DataPreflight: string;
  DataValidation: string;
  DataVerification: string;
}

export default function ImportUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [fileValidationResults, setFileValidationResults] = useState<ValidationResult[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [preflightFileInfo, setPreflightFileInfo] = useState({
    PreflightFileID: 0,
    DocTypeID: 0,
    ImportTypeName: "",
    Status: "",
    FileUploadStatus: "",
    FieldMappingStatus: "",
    DataPreflightStatus: "",
    DataValidationStatus: "",
    DataVerificationStatus: "",
    ImportName: "",
    Action: "File Upload",
    AddColumns: "",
    FileName: "",
    FileType: "",
    FileSize: 0,
    FileExtension: "",
    FileData: ""
  });

  // Get data from route state and update preflightFileInfo if available
  useEffect(() => {
    const state = location.state as any;
    const { preflightFileInfo: incomingPreflightFileInfo } = state || {};
    
    if (incomingPreflightFileInfo) {
      setPreflightFileInfo(incomingPreflightFileInfo);
    }
  }, [location.state]);

  useEffect(() => {
    if (file) {
      const fileUploadChecks = validations
        .filter(v => v.category === 'File Upload')
        .map(v => ({
          id: v.id,
          name: v.name,
          description: v.description,
          status: 'pending' as const,
          severity: v.severity || '',
          technical_details: getTechnicalDescription(v.id)
        }));
      
      setFileValidationResults(fileUploadChecks);
      
      validateFile(file).then(results => {
        // Generate some sample file data for validation testing
        const mockFileData = [
          { name: "John Smith", email: "john@example.com", age: 32, phone: "123-456-7890" },
          { name: "Jane Doe", email: "not-an-email", age: "twenty-eight", phone: "123abc456" },
          { name: "Bob Johnson", email: "bob@invalid", age: 45, phone: "987-654-3210" }
        ];
        localStorage.setItem('sampleFileData', JSON.stringify(mockFileData));
        
        const uiResults = fileUploadChecks.map(check => {
          const result = results.find(r => r.id === check.id);
          if (result) {
            return {
              ...check,
              status: result.status,
              description: result.message,
              technical_details: getTechnicalDescription(check.id)
            };
          }
          return check;
        });
        
        setFileValidationResults(uiResults);
        
        const criticalFailures = results.filter(r => r.status === 'fail' && r.severity === 'critical');
        if (criticalFailures.length > 0) {
          toast({
            title: "File validation failed",
            description: `${criticalFailures.length} critical issues need attention.`,
            variant: "destructive"
          });
        }
        
        localStorage.setItem('uploadValidationResults', JSON.stringify(results));
      }).catch(error => {
        console.error("Error validating file:", error);
        toast({
          title: "Validation error",
          description: "There was a problem validating the file",
          variant: "destructive",
        });
      });
    }
  }, [file, toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      handleFileSelection(selectedFile);
    }
  };

  const handleFileSelection = (selectedFile: File) => {
    const validTypes = ['.csv', '.xls', '.xlsx'];
    const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
    
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    
    if (!validTypes.includes(fileExtension)) {
      toast({
        title: "Invalid file type",
        description: "Please select a CSV or Excel file.",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedFile.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }
    
    setFile(selectedFile);
    toast({
      title: "File selected",
      description: `${selectedFile.name} (${(selectedFile.size / 1024 / 1024).toFixed(2)} MB)`,
    });
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      handleFileSelection(droppedFile);
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleContinue = async () => {
    if (!file) return;

    try {
      setIsLoading(true);

      const reader = new FileReader();
      reader.onload = async (e) => {
        if (e.target && e.target.result) {
          const fileData = e.target.result.toString();
          const currentDateTime = getCurrentDateTime();

          // Prepare request object for API
          const request = {
            DocTypeID: preflightFileInfo.DocTypeID || 1, // Use from preflightFileInfo or fallback to 1
            FileName: file.name,
            FileType: file.type,
            FileInput: fileData,
            Status: "In Progress",
            Action: "File Upload",
            AddColumns: "",
            ImportName: preflightFileInfo.ImportName || "Preflight_" + (preflightFileInfo.ImportTypeName || "Unknown") + "_" + currentDateTime,
            FilePath: ""
          };
          console.log("request Body : ", request);

          try {
            const res = await preflightService.saveFile(request) as PreflightResponse;
            const result = res?.content?.Data;

            if (result?.ID > 0) {
              let dataStatus: DataStatus | null = null;
              if (result?.DataStatus && result?.DataStatus !== "") {
                dataStatus = JSON.parse(result.DataStatus) as DataStatus;
              }

              // Update preflightFileInfo state object with all the data
              const updatedPreflightFileInfo = {
                PreflightFileID: result.ID,
                DocTypeID: preflightFileInfo.DocTypeID,
                ImportTypeName: preflightFileInfo.ImportTypeName,
                Status: result.Status,
                FileUploadStatus: dataStatus?.FileUpload || "Completed",
                FieldMappingStatus: dataStatus?.FieldMapping || "Not Started",
                DataPreflightStatus: dataStatus?.DataPreflight || "Not Started",
                DataValidationStatus: dataStatus?.DataValidation || "Not Started",
                DataVerificationStatus: dataStatus?.DataVerification || "Not Started",
                ImportName: request.ImportName,
                Action: "File Upload",
                AddColumns: "",
                // Store file-related information
                FileName: file.name,
                FileType: file.type,
                FileSize: file.size,
                FileExtension: file.name.substring(file.name.lastIndexOf('.')).toLowerCase(),
                FileData: fileData
              };

              setPreflightFileInfo(updatedPreflightFileInfo);

              // Navigate with the updated state
              navigate('/import-wizard/column-mapping', {
                state: {
                  preflightFileInfo: updatedPreflightFileInfo,
                  currentStep: 'FieldMapping',
                  completedSteps: ['FileUpload']
                }
              });
            } else {
              toast({
                title: "Error",
                description: result?.Message || "Something went wrong! Please try again.",
                variant: "destructive"
              });
            }
          } catch (error) {
            console.error("Error saving file:", error);
            toast({
              title: "Error",
              description: "An error occurred while processing. Please try again.",
              variant: "destructive"
            });
          }
        }
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error processing file:", error);
      toast({
        title: "Error",
        description: "An error occurred while processing the file.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartOver = () => {
    // Clear localStorage data
    localStorage.removeItem('uploadedFileInfo');
    localStorage.removeItem('uploadedFile');
    localStorage.removeItem('uploadValidationResults');
    localStorage.removeItem('sampleFileData');
    localStorage.removeItem('preflightFileID');
    
    // Reset local state
    setFile(null);
    setFileValidationResults([]);
    setPreflightFileInfo({
      PreflightFileID: 0,
      DocTypeID: 0,
      ImportTypeName: "",
      Status: "",
      FileUploadStatus: "",
      FieldMappingStatus: "",
      DataPreflightStatus: "",
      DataValidationStatus: "",
      DataVerificationStatus: "",
      ImportName: "",
      Action: "File Upload",
      AddColumns: "",
      FileName: "",
      FileType: "",
      FileSize: 0,
      FileExtension: "",
      FileData: ""
    });
    
    // Navigate to ImportTypeSelection page
    navigate('/');
    
    toast({
      title: "Started Over",
      description: "Import process has been reset. Please select an import type to begin again.",
    });
  };

  // ex out put "2019-10-22 15:33:22"
 const getCurrentDateTime = (addDays = 0) => {
  let dt = new Date();
  let dateString =
    dt.getFullYear() +
    "-" +
    (dt.getMonth() + 1) +
    "-" +
    dt.getDate() +
    " " +
    dt.getHours() +
    ":" +
    dt.getMinutes() +
    ":" +
    dt.getSeconds();
  return dateString;
};

  // Prepare sample data for the spreadsheet view
  const getSampleData = () => {
    if (file && file.name.includes('invalid-emails')) {
      return [
        { name: "John Doe", email: "not-an-email", age: 30 },
        { name: "Jane Smith", email: "jane@invalid", age: 25 },
        { name: "Bob Johnson", email: "bob@example", age: 42 }
      ];
    }
    
    return [];
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header currentPage="import-wizard" />

      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Import Step Header */}
          <ImportStepHeader
            stepTitle="File Upload"
            status={preflightFileInfo.Status || 'Not Started'}
            docTypeName={preflightFileInfo.ImportTypeName || 'Unknown Type'}
            importName={preflightFileInfo.ImportName || 'Untitled Import'}
            currentStep="FileUpload"
            completedSteps={[]}
            onImportNameChange={(newName) => {
              const updatedPreflightFileInfo = {
                ...preflightFileInfo,
                ImportName: newName
              };
              setPreflightFileInfo(updatedPreflightFileInfo);
            }}
          />

          <div className="space-y-8">
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <h3 className="text-xl font-semibold mb-4">Upload Your Data File</h3>
              <p className="text-gray-600 mb-8">
                Upload a CSV or Excel file to begin the import process. Your file should include header rows.
              </p>

              <div 
                className={`border-2 border-dashed ${isDragging ? 'border-[rgb(59,130,246)] bg-[rgb(59,130,246,0.1)]' : 'border-gray-300'} rounded-lg p-12 text-center transition-all`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center">
                  {file ? (
                    <>
                      <FileCheck className="h-12 w-12 text-green-500 mb-4" />
                      <p className="text-gray-600 mb-1">
                        File selected: <span className="font-medium">{file.name}</span>
                      </p>
                      <p className="text-gray-500 text-sm mb-4">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <Button onClick={() => setFile(null)} variant="outline">
                        Change File
                      </Button>
                    </>
                  ) : (
                    <>
                      <Upload className="h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-600 mb-1">
                        Drag & drop your file here, or <span className="text-blue-600">browse</span>
                      </p>
                      <p className="text-gray-500 text-sm mb-4">
                        Supports CSV, XLS, XLSX (max 10MB)
                      </p>
                      <Button onClick={handleButtonClick}>Select File</Button>
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        className="hidden" 
                        accept=".csv,.xls,.xlsx"
                        onChange={handleFileChange}
                      />
                    </>
                  )}
                </div>
              </div>
              
              {file && fileValidationResults.length > 0 && (
                <ValidationStatus 
                  results={fileValidationResults}
                  title="File Upload Validations"
                  data={getSampleData()}
                />
              )}
            </div>

            <div className="mt-8 flex justify-between items-center">
              <div className="flex gap-4">
                <Link to="/import-wizard">
                  <Button variant="outline">
                    <ArrowLeft className="mr-2" />
                    Back
                  </Button>
                </Link>
                <Button variant="outline" onClick={handleStartOver}>
                  <RotateCcw className="mr-2" />
                  Start Over
                </Button>
              </div>
              <Button 
                disabled={!file} 
                className="bg-[rgb(59,130,246)] hover:bg-[rgb(37,99,235)]"
                onClick={handleContinue}
              >
                Continue to Column Mapping
                <ArrowRight className="ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
