import React, { useRef, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { 
  Upload,
  FileCheck,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  FileBox,
  ClipboardCheck,
  ArrowUpCircle,
  FileSpreadsheet,
  Eye
} from "lucide-react";
import MapColumns from "@/components/icons/MapColumns";
import DataQuality from "@/components/icons/DataQuality";
import TransformData from "@/components/icons/TransformData";
import ProgressStep from "@/components/ProgressStep";
import StepConnector from "@/components/StepConnector";
import ValidationStatus, { ValidationResult } from '@/components/ValidationStatus';
import { validations, getTechnicalDescription } from '@/constants/validations';
import { validateFile } from '@/services/fileValidation';
import { TestFilesDropdown } from "@/components/TestFilesDropdown";
import { preflightService } from "@/services/preflightService";
import { useImport } from '@/contexts/ImportContext';

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
  const { selectedImportType, selectedImportTypeName } = useImport();
  const [fileValidationResults, setFileValidationResults] = useState<ValidationResult[]>([]);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Loading");
  const [preflightFileInfo, setPreflightFileInfo] = useState({
    PreflightFileID: 0,
    Status: "",
    FileUploadStatus: "",
    FieldMappingStatus: "",
    DataPreflightStatus: "",
    DataValidationStatus: "",
    DataVerificationStatus: "",
    ImportName: "",
    Action: "File Upload",
    AddColumns: ""
  });

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

  const handleTestFileGenerated = (generatedFile: File) => {
    handleFileSelection(generatedFile);
  };

  const handleContinue = async () => {
    if (!file) return;

    try {
      setIsLoading(true);
      setLoadingText("Processing file...");

      const reader = new FileReader();
      reader.onload = async (e) => {
        if (e.target && e.target.result) {
          const fileData = e.target.result.toString();
          const currentDateTime = getCurrentDateTime();
          const fileInfo = {
            name: file.name,
            type: file.type,
            size: file.size,
            extension: file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
          };
          localStorage.setItem('uploadedFileInfo', JSON.stringify(fileInfo));
          localStorage.setItem('uploadedFile', fileData);
          localStorage.setItem('selectedImportTypeName',selectedImportTypeName);
          localStorage.setItem('selectedImportType',selectedImportType);
          // Prepare request object for API
          const request = {
            DocTypeID: selectedImportType ? parseInt(selectedImportType) : 1, // Fallback to 1 if not found
            FileName: file.name,
            FileType: file.type,
            FileInput: fileData,
            Status: "In Progress",
            Action: "File Upload",
            AddColumns: "",
            ImportName: "Preflight_" + (selectedImportTypeName || "Unknown") + "_" + currentDateTime,
            FilePath:""
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

              const request2 = {
                DocTypeID: selectedImportType ? parseInt(selectedImportType) : 1, // Fallback to 1 if not found
                FileName: file.name,
                FileType: file.type,
                FileInput: fileData,
                Status: "In Progress",
                ImportName: "Preflight_" + (selectedImportTypeName || "Unknown") + "_" + currentDateTime,
                FilePath:"",
                MappedFieldIDs : "",
                IsValidate : true,
                Action : "Field Mappings",
                AddColumns : ""
              };
              setLoadingText("Please hold on while we process the Data Preflight. This may take a few moments to complete");
              const res2 = await preflightService.saveFile(request2) as PreflightResponse;
              const result2 = res2?.content?.Data;

              // Store the preflight file ID in localStorage
              localStorage.setItem('preflightFileID', result?.ID.toString() || '0');

              navigate('/import-wizard/column-mapping');
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
      setLoadingText("Loading");
    }
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
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">File Upload</h2>
            <div className="flex items-center gap-3">
              <TestFilesDropdown onFileGenerated={handleTestFileGenerated} />
            </div>
          </div>

          <div className="flex justify-between items-center mb-12">
            <ProgressStep 
              icon={<Upload />}
              label="File Upload"
              isActive={true}
            />
            <StepConnector />
            <ProgressStep 
              icon={<MapColumns />}
              label="Column Mapping"
            />
            <StepConnector />
            <ProgressStep 
              icon={<FileCheck />}
              label="File Preflighting"
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
              icon={<ClipboardCheck />}
              label="Final Review & Approval"
            />
            <StepConnector />
            <ProgressStep 
              icon={<ArrowUpCircle />}
              label="Import / Push"
            />
          </div>

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
                <Button variant="outline">
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
