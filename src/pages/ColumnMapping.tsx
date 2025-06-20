import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ColumnMappingForm, ColumnMapping } from "@/components/admin/ColumnMappingForm";
import { 
  FileCheck,
  ArrowRight,
  ArrowLeft,
  FileBox,
  ClipboardCheck,
  ArrowUpCircle,
  Info,
  FileType
} from "lucide-react";
import MapColumns from "@/components/icons/MapColumns";
import DataQuality from "@/components/icons/DataQuality";
import TransformData from "@/components/icons/TransformData";
import ProgressStep from "@/components/ProgressStep";
import StepConnector from "@/components/StepConnector";
import ValidationStatus, { ValidationResult } from '@/components/ValidationStatus';
import { validateColumnMappings } from '@/services/fileValidation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { preflightService } from "@/services/preflightService";
import { Loading } from "@/components/ui/loading";

interface PreflightResponse {
  content?: {
    Data?: {
      ID: number;
      Message?: string;
    };
  };
}

export default function ColumnMappingPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [preflightFileID, setPreflightFileID] = useState<number>(0);
  const [isEdit, setIsEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [hasValidationErrors, setHasValidationErrors] = useState(false);

  useEffect(() => {
    // Get preflight file ID from localStorage
    const storedFileID = localStorage.getItem('preflightFileID');
    if (storedFileID) {
      setPreflightFileID(parseInt(storedFileID));
    }

    // Check if we're in edit mode
    const editMode = localStorage.getItem('editMode') === 'true';
    setIsEdit(editMode);
  }, []);

  const handleMappingSave = (mappings: ColumnMapping[]) => {
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
        setIsLoading(false);
        return;
      }

      // Validate mappings
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
        toast({
          title: "Validation Error",
          description: "Please fix the critical errors before continuing.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

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
        FilePath: localStorage.getItem('uploadedFilePath') || "",
        FileType: JSON.parse(localStorage.getItem('uploadedFileInfo') || '{}').type || "",
        PreflightFileID: preflightFileID,
        FileName: JSON.parse(localStorage.getItem('uploadedFileInfo') || '{}').name || "",
        ImportName: "Preflight_" + (localStorage.getItem('selectedImportTypeName') || "Unknown") + "_" + new Date().toISOString(),
        DocTypeID: parseInt(localStorage.getItem('selectedImportType') || '1')
      };

      // Call preflight service
      preflightService.saveFile(request).then((res: PreflightResponse) => {
        const result = res?.content?.Data;
        if (result?.ID > 0) {
          toast({
            title: "Success",
            description: "Column mappings saved successfully.",
          });
        } else {
          toast({
            title: "Error",
            description: result?.Message || "Failed to save column mappings. Please try again.",
            variant: "destructive"
          });
        }
      }).catch((error) => {
        console.error("Error saving mappings:", error);
        toast({
          title: "Error",
          description: "Failed to save column mappings. Please try again.",
          variant: "destructive"
        });
      });

    } catch (error) {
      console.error("Error saving mappings:", error);
      toast({
        title: "Error",
        description: "Failed to save column mappings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    if (hasValidationErrors) {
      toast({
        title: "Validation Error",
        description: "Please fix all validation errors before continuing.",
        variant: "destructive"
      });
      return;
    }

    // Navigate to verification page
    navigate('/import-wizard/verification');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-semibold text-gray-900">Column Mapping</h1>
            </div>
            <div className="flex justify-between items-center mb-12">
              <ProgressStep 
                icon={<FileCheck />} 
                label="File Upload" 
                isComplete={true} 
              />
              <StepConnector isCompleted={true} />
              <ProgressStep 
                icon={<MapColumns />} 
                label="Column Mapping" 
                isActive={true} 
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
              {/* <ProgressStep 
                icon={<FileBox />} 
                label="Deduplication" 
              />
              <StepConnector /> */}
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
          </div>

          {/* Map Your Columns Info Section */}
          <div className="mb-8">
            <div className="border rounded-2xl bg-white/50 p-8">
              <h2 className="text-2xl font-bold mb-1">Map Your Columns</h2>
              <p className="text-gray-500 mb-6">
                Match your file columns with our system fields to ensure data is imported correctly
              </p>
              <div className="space-y-5">
                <div className="flex items-start gap-3 border rounded-xl bg-gray-50 p-5">
                  <span className="mt-1 text-blue-500">
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path stroke="currentColor" strokeWidth="2" d="M12 8v4m0 4h.01"/></svg>
                  </span>
                  <div>
                    <div className="font-semibold mb-1">About column mapping:</div>
                    <ul className="list-disc list-inside text-sm text-gray-700">
                      <li>
                        <span className="font-bold">Auto-mapped columns</span> are highlighted in <span className="text-green-700 font-bold">green</span>
                      </li>
                      <li>
                        <span className="font-bold">AI-suggested mappings</span> are highlighted in <span className="text-blue-700 font-bold">blue</span>
                      </li>
                      <li>
                        <span className="font-bold">Manual mapping</span> is required for any remaining columns
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="flex items-start gap-3 border rounded-xl bg-gray-50 p-5">
                  <span className="mt-1 text-blue-500">
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path stroke="currentColor" strokeWidth="2" d="M12 8v4m0 4h.01"/></svg>
                  </span>
                  <div>
                    <div className="font-semibold mb-1">Tips for successful mapping:</div>
                    <ul className="list-disc list-inside text-sm text-gray-700">
                      <li>Required fields are marked with a red asterisk (<span className="text-red-500">*</span>)</li>
                      <li>Use "Ignore this column" for data you don't want to import</li>
                      <li>Review AI-suggested mappings for accuracy</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {validationResults.length > 0 && (
            <div className="mb-6">
              <ValidationStatus 
                results={validationResults}
                title="Column Mapping Validation Results"
              />
            </div>
          )}

          <div className="bg-white p-8 rounded-lg border border-gray-200">
            {isLoading ? (
              <Loading message="Loading column mappings..." />
            ) : (
              <ColumnMappingForm
                preflightFileID={preflightFileID}
                onSave={handleMappingSave}
                isEdit={isEdit}
              />
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8">
            <Button
              variant="outline"
              onClick={() => navigate('/import-wizard/upload')}
            >
              <ArrowLeft className="mr-2" />
              Back
            </Button>
            <Button
              onClick={handleContinue}
              disabled={hasValidationErrors || isLoading}
            >
              Continue to Data Preflight
              <ArrowRight className="ml-2" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
