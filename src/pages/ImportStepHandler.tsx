import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loading } from '@/components/ui/loading';

interface EditDetails {
  PreflightFileID?: number;
  DocTypeID?: number;
  DocTypeName?: string;
  ImportName?: string;
  FilePath?: string;
  FileName?: string;
  Status?: string;
  CreatedBy?: number;
  MappedFieldIDs?: any[];
  DataSummary?: string;
  DataStatus?: string;
}

interface StatusObject {
  FileUpload?: string;
  FieldMapping?: string;
  DataPreflight?: string;
  DataValidation?: string;
  DataVerification?: string;
  Deduplication?: string;
  FinalReview?: string;
  ImportPush?: string;
}

const SectionSteps = [
  "FileUpload",
  "FieldMapping", 
  "DataPreflight",
  "DataValidation",
  "DataVerification",
  "FinalReview",
  "ImportPush",
];

const OrderOfPreflight = {
  "Not Started": "FileUpload",
  "In Progress": "FieldMapping",
  Error: "DataPreflight",
  Warning: "DataValidation",
  "Verification Pending": "DataVerification",
  "Review Pending": "FinalReview",
  "Ready for Import": "ImportPush",
  Success: "ImportPush",
};

const StepRoutes = {
  FileUpload: "/import-wizard/upload",
  FieldMapping: "/import-wizard/column-mapping",
  DataPreflight: "/import-wizard/verification",
  DataValidation: "/import-wizard/data-quality",
  DataVerification: "/import-wizard/normalization",
  FinalReview: "/import-wizard/review",
  ImportPush: "/import-wizard/import",
};

const ImportStepHandler: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editDetails = location.state?.editDetails as EditDetails | undefined;
  const requestedStep = location.state?.requestedStep as string | undefined;
  const existingPreflightInfo = location.state?.preflightFileInfo;
  const [isNavigating, setIsNavigating] = useState(true);

  
  const getCurrentDateTime = () => {
    const dt = new Date();
    return dt.toISOString();
  };

  // Parse status object if available
  const statusObject: StatusObject = editDetails?.DataStatus ? 
    (() => {
      try {
        const parsedData = JSON.parse(editDetails.DataStatus);
        return parsedData;
      } catch {
        return {};
      }
    })() : {};

  const [preflightFileInfo, setPreflightFileInfo] = useState(() => {
    // Use existing info if coming from another step, otherwise create from editDetails
    if (existingPreflightInfo) {
      // Preserve all existing fields and only add missing ones
      return {
        ...existingPreflightInfo,
        // Only set defaults for fields that are missing or empty
        PreflightFileID: existingPreflightInfo.PreflightFileID || 0,
        DocTypeID: existingPreflightInfo.DocTypeID || editDetails?.DocTypeID || 0,
        ImportTypeName: existingPreflightInfo.ImportTypeName || editDetails?.DocTypeName || "",
        ImportName: existingPreflightInfo.ImportName || editDetails?.ImportName || "Preflight_" + getCurrentDateTime(),
        FilePath: existingPreflightInfo.FilePath || editDetails?.FilePath || "",
        FileType: existingPreflightInfo.FileType || "text/csv",
        FileName: existingPreflightInfo.FileName || editDetails?.FileName || "",
        Status: existingPreflightInfo.Status || editDetails?.Status || "Not Started",
        // Preserve step-specific statuses or use defaults
        FileUploadStatus: existingPreflightInfo.FileUploadStatus || statusObject?.FileUpload || "Not Started",
        FieldMappingStatus: existingPreflightInfo.FieldMappingStatus || statusObject?.FieldMapping || "Not Started",
        DataPreflightStatus: existingPreflightInfo.DataPreflightStatus || statusObject?.DataPreflight || "Not Started",
        DataValidationStatus: existingPreflightInfo.DataValidationStatus || statusObject?.DataValidation || "Not Started",
        DataVerificationStatus: existingPreflightInfo.DataVerificationStatus || statusObject?.DataVerification || "Not Started",
        DeduplicationStatus: existingPreflightInfo.DeduplicationStatus || statusObject?.Deduplication || "Not Started",
        FinalReviewStatus: existingPreflightInfo.FinalReviewStatus || statusObject?.FinalReview || "Not Started",
        ImportPushStatus: existingPreflightInfo.ImportPushStatus || statusObject?.ImportPush || "Not Started",
        CreatedBy: existingPreflightInfo.CreatedBy || editDetails?.CreatedBy || 0,
        MappedFieldIDs: existingPreflightInfo.MappedFieldIDs || editDetails?.MappedFieldIDs || "",
        // Preserve existing fields or use defaults
        FileInput: existingPreflightInfo.FileInput || "",
        exportFileTypeValue: existingPreflightInfo.exportFileTypeValue || {
          Display: "CSV",
          Value: "text/csv",
        },
        exportTypeValue: existingPreflightInfo.exportTypeValue || {
          Display: "Blank Template",
          Value: 1,
        },
        IsValidate: existingPreflightInfo.IsValidate || false,
        Action: existingPreflightInfo.Action || "",
        DataSummary: existingPreflightInfo.DataSummary || editDetails?.DataSummary || "",
        AddColumns: existingPreflightInfo.AddColumns || [],
      };
    }
    
    return {
      PreflightFileID: editDetails?.PreflightFileID || 0,
      DocTypeID: editDetails?.DocTypeID || 0,
      ImportTypeName: editDetails?.DocTypeName || "",
      ImportName: editDetails?.ImportName || "Preflight_" + getCurrentDateTime(),
      FilePath: editDetails?.FilePath || "",
      FileType: "text/csv",
      FileName: editDetails?.FileName || "",
      Status: editDetails?.Status || "Not Started",
      FileUploadStatus: statusObject?.FileUpload || "Not Started",
      FieldMappingStatus: statusObject?.FieldMapping || "Not Started",
      DataPreflightStatus: statusObject?.DataPreflight || "Not Started",
      DataValidationStatus: statusObject?.DataValidation || "Not Started",
      DataVerificationStatus: statusObject?.DataVerification || "Not Started",
      DeduplicationStatus: statusObject?.Deduplication || "Not Started",
      FinalReviewStatus: statusObject?.FinalReview || "Not Started",
      ImportPushStatus: statusObject?.ImportPush || "Not Started",
      CreatedBy: editDetails?.CreatedBy || 0,
      MappedFieldIDs: editDetails?.MappedFieldIDs || "",
      FileInput: "",
      exportFileTypeValue: {
        Display: "CSV",
        Value: "text/csv",
      },
      exportTypeValue: {
        Display: "Blank Template",
        Value: 1,
      },
      IsValidate: false,
      Action: "",
      DataSummary: editDetails?.DataSummary || "",
      AddColumns: [],
    };
  });

  const [currentStep, setCurrentStep] = useState(() => {
    // If a specific step is requested, use that
    if (requestedStep) {
      return requestedStep;
    }
    
    // Otherwise determine from status - check individual step statuses first
    if (preflightFileInfo?.FinalReviewStatus === "Success") {
      return "ImportPush";
    } else if (preflightFileInfo?.DataVerificationStatus === "Success") {
      return "FinalReview";
    } else if (preflightFileInfo?.DataValidationStatus === "Success") {
      return "DataVerification";
    } else if (preflightFileInfo?.DataPreflightStatus === "Success") {
      return "DataValidation";
    } else if (preflightFileInfo?.FieldMappingStatus === "Success") {
      return "DataPreflight";
    } else if (preflightFileInfo?.FileUploadStatus === "Success") {
      return "FieldMapping";
    }
    
    // Fallback to legacy status mapping
    if (
      preflightFileInfo?.Status === "Warning" &&
      preflightFileInfo.DataValidationStatus === "Not Started"
    ) {
      return OrderOfPreflight["Error"];
    }
    return OrderOfPreflight[preflightFileInfo?.Status] || SectionSteps[0];
  });

  const [completedSteps, setCompletedSteps] = useState(() => {
    const stepIndex = SectionSteps.indexOf(currentStep);
    return stepIndex >= 0 ? SectionSteps.slice(0, stepIndex) : [];
  });

  useEffect(() => {
    // Set the current step status to "In Progress" if not already set to "Success"
    const updatedPreflightFileInfo = { ...preflightFileInfo };
    
    // Only set to "In Progress" if the step hasn't been completed yet
    let statusUpdated = false;
    switch (currentStep) {
      case "FileUpload":
        // FileUpload should remain "Not Started" until user uploads a file
        // Don't automatically set to "In Progress"
        break;
      case "FieldMapping":
        if (updatedPreflightFileInfo.FieldMappingStatus !== "Success") {
          updatedPreflightFileInfo.FieldMappingStatus = "In Progress";
          statusUpdated = true;
        }
        break;
      case "DataPreflight":
        if (updatedPreflightFileInfo.DataPreflightStatus !== "Success") {
          updatedPreflightFileInfo.DataPreflightStatus = "In Progress";
          statusUpdated = true;
        }
        break;
      case "DataValidation":
        if (updatedPreflightFileInfo.DataValidationStatus !== "Success") {
          updatedPreflightFileInfo.DataValidationStatus = "In Progress";
          statusUpdated = true;
        }
        break;
      case "DataVerification":
        if (updatedPreflightFileInfo.DataVerificationStatus !== "Success") {
          updatedPreflightFileInfo.DataVerificationStatus = "In Progress";
          statusUpdated = true;
        }
        break;
      case "FinalReview":
        if (updatedPreflightFileInfo.FinalReviewStatus !== "Success") {
          updatedPreflightFileInfo.FinalReviewStatus = "In Progress";
          statusUpdated = true;
        }
        break;
      case "ImportPush":
        if (updatedPreflightFileInfo.ImportPushStatus !== "Success") {
          updatedPreflightFileInfo.ImportPushStatus = "In Progress";
          statusUpdated = true;
        }
        break;
    }

    // Update the main Status field if we set a step to "In Progress"
    // But don't set main status to "In Progress" for FileUpload step
    if (statusUpdated && updatedPreflightFileInfo.Status !== "Success" && currentStep !== "FileUpload") {
      updatedPreflightFileInfo.Status = "In Progress";
    }

    // Navigate to the appropriate step with all data passed through state
    const targetRoute = StepRoutes[currentStep] || StepRoutes.FileUpload;
    
    // Add a small delay to ensure the component is mounted
    setTimeout(() => {
      navigate(targetRoute, { 
        replace: true,
        state: { 
          preflightFileInfo: updatedPreflightFileInfo,
          currentStep,
          completedSteps,
          isEdit: !!editDetails,
          // Pass individual values for easier access (using new field names)
          preflightFileID: updatedPreflightFileInfo.PreflightFileID?.toString()
        }
      });
      setIsNavigating(false);
    }, 100);
  }, [currentStep, editDetails, navigate, preflightFileInfo, completedSteps]);

  // Show loading while navigating
  if (isNavigating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading message="Redirecting..." />
      </div>
    );
  }

  // This component acts as a router, so it doesn't render anything visible after navigation
  return null;
};

export default ImportStepHandler; 