import React, { useRef, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Upload,
  FileCheck,
  Eye,
  RotateCcw,
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
import { validations, getTechnicalDescription } from '@/constants/validations';
import { validateFile } from '@/services/fileValidation';

export default function ImportUpload() {
  const [progress] = React.useState(16);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [fileValidationResults, setFileValidationResults] = useState<ValidationResult[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (file) {
      const fileUploadChecks = validations
        .filter(v => v.category === 'File Upload')
        .map(v => ({
          id: v.id,
          name: v.name,
          description: v.description,
          status: 'pending' as const,
          severity: v.severity,
          technical_details: getTechnicalDescription(v.id)
        }));
      
      setFileValidationResults(fileUploadChecks);
      
      validateFile(file).then(validationResults => {
        const uiResults = fileUploadChecks.map(check => {
          const result = validationResults.find(r => r.id === check.id);
          if (result) {
            return {
              ...check,
              status: result.status as any,
              technical_details: getTechnicalDescription(check.id)
            };
          }
          return check;
        });
        
        setFileValidationResults(uiResults);
      }).catch(error => {
        console.error("Error validating file:", error);
        toast({
          title: "Validation error",
          description: "There was a problem validating the file",
          variant: "destructive",
        });
      });
    }
  }, [file]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      
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
    }
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
      
      const validTypes = ['.csv', '.xls', '.xlsx'];
      const fileExtension = droppedFile.name.substring(droppedFile.name.lastIndexOf('.')).toLowerCase();
      
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      
      if (!validTypes.includes(fileExtension)) {
        toast({
          title: "Invalid file type",
          description: "Please select a CSV or Excel file.",
          variant: "destructive",
        });
        return;
      }
      
      if (droppedFile.size > maxSize) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }
      
      setFile(droppedFile);
      toast({
        title: "File uploaded",
        description: `${droppedFile.name} (${(droppedFile.size / 1024 / 1024).toFixed(2)} MB)`,
      });
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleContinue = () => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && e.target.result) {
          localStorage.setItem('uploadedFile', e.target.result.toString());
          
          const fileInfo = {
            name: file.name,
            type: file.type,
            size: file.size,
            extension: file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
          };
          localStorage.setItem('uploadedFileInfo', JSON.stringify(fileInfo));
          
          navigate('/import-wizard/verification');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-brand-purple">
        <Header currentPage="import-wizard" />
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center text-white">
            <div className="flex items-center gap-4">
              <Link to="/import-wizard">
                <Button variant="ghost" className="text-white hover:text-white hover:bg-white/20">
                  <ArrowLeft className="mr-2" />
                  Back
                </Button>
              </Link>
              <h1 className="text-2xl font-semibold">Data Import</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" className="text-white hover:text-white hover:bg-white/20">
                Audit History
                <span className="ml-2 bg-white text-brand-purple rounded-full w-5 h-5 flex items-center justify-center text-xs">11</span>
              </Button>
              <Button variant="ghost" className="text-white hover:text-white hover:bg-white/20">
                File History
                <span className="ml-2 bg-white text-brand-purple rounded-full w-5 h-5 flex items-center justify-center text-xs">11</span>
              </Button>
              <Button variant="ghost" className="text-white hover:text-white hover:bg-white/20">
                Admin
              </Button>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="flex justify-between items-center text-white mb-2">
              <span>Upload Progress</span>
              <span>{progress}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>

      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">File Upload</h2>
            <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
              Target: customers
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
              icon={<FileCheck />}
              label="File Preflighting"
              isComplete={false}
            />
            <StepConnector />
            <ProgressStep 
              icon={<MapColumns />}
              label="Column Mapping"
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

          <div className="space-y-8">
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <h3 className="text-xl font-semibold mb-4">Upload Your Data File</h3>
              <p className="text-gray-600 mb-8">
                Upload a CSV or Excel file to begin the import process. Your file should include header rows.
              </p>

              <div 
                className={`border-2 border-dashed ${isDragging ? 'border-brand-purple bg-purple-50' : 'border-gray-300'} rounded-lg p-12 text-center transition-all`}
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
                className="bg-brand-purple hover:bg-brand-purple/90"
                onClick={handleContinue}
              >
                Continue to File Verification
                <ArrowRight className="ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
