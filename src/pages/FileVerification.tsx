import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { 
  FileCheck,
  ArrowRight,
  ArrowLeft,
  FileBox,
  ClipboardCheck,
  ArrowUpCircle,
  AlertTriangle,
  Info,
  X
} from "lucide-react";
import MapColumns from "@/components/icons/MapColumns";
import DataQuality from "@/components/icons/DataQuality";
import TransformData from "@/components/icons/TransformData";
import ProgressStep from "@/components/ProgressStep";
import StepConnector from "@/components/StepConnector";
import ValidationStatus, { ValidationResult } from '@/components/ValidationStatus';
import { validateFile } from '@/services/fileValidation';
import { getTechnicalDescription } from '@/constants/validations';
import { preflightService } from '@/services/preflightService';
import Grid from '@/components/GridGrouping';
import PagerTop from '@/components/Pager';
import StatusDropdown from '@/components/StatusDropdown';
import SidePanel from '@/components/SidePanel';
import Modal from '@/components/Modal';
import { defaultPagerData } from '../constants/pager';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import './FileVerification.css';

interface PreflightResponse {
  content: {
    Status: string;
    Data: {
      Result: string;
      Count: number;
      MappedFields: string;
    };
  };
}

interface PreflightService {
  getPreflightImportLogs: (
    preflightFileID: string | number,
    startIndex: number,
    pageSize: number,
    excludeSystemColumns: boolean,
    action: string,
    filter: string,
    preflightType: string
  ) => Promise<PreflightResponse>;
}

export default function FileVerification() {
  const [progress] = React.useState(32);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [verificationResults, setVerificationResults] = useState<ValidationResult[]>([]);
  const [isVerifying, setIsVerifying] = useState(true);
  const [filter, setFilter] = useState("All");
  const tableRef = useRef();
  const [headers, setHeaders] = useState([]);
  const [pagerData, setPagerData] = useState(defaultPagerData);
  const [gridData, setGridData] = useState([]);
  const [fileData, setFileData] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [columnsInfo, setColumnsInfo] = useState([]);
  const [logsPageLoad, setLogsPageLoad] = useState(false);
  const [loadGridData, setLoadGridData] = useState(false);
  const [masterDropdownData, setMasterDropdownData] = useState({});
  const [showSummarySidePanel, setShowSummarySidePanel] = useState(false);
  const [manualFilter, setManualFilter] = useState(false);
  const [correctionCell, setCorrectionCell] = useState({
    showPopup: false,
    columnName: "",
    actionType: "",
    searchText: "",
    replaceText: "",
  });
  const [loadSidePanelOnSave, setLoadSidePanelOnSave] = useState(false);
  const [errorCellDetails, setErrorCellDetails] = useState([]);
  const [errorCellUniqueKey, setErrorCellUniqueKey] = useState("");
  const [preflightFileInfo, setPreflightFileInfo] = useState({
    PreflightFileID: 0,
    MappedFieldIDs: [],
    ImportTypeName: "records"
  });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmDialogConfig, setConfirmDialogConfig] = useState({
    message: "",
    onConfirm: () => {},
    onReject: () => {}
  });
  const [hasErrors, setHasErrors] = useState(false);

  // Add preflightType constant to match original implementation
  const preflightType = "DataPreflight";

  useEffect(() => {
    const validateUploadedFile = async () => {
      try {
        setIsVerifying(true);
        const fileData = localStorage.getItem('uploadedFile');
        if (!fileData) {
          throw new Error('No file found');
        }

        const fileInfo = JSON.parse(localStorage.getItem('uploadedFileInfo') || '{}');
        const file = dataURLtoFile(fileData, fileInfo.name || 'uploaded-file.csv');
        
        const validationResults = await validateFile(file, false);
        
        const results: ValidationResult[] = validationResults.map(validation => ({
          id: validation.validation_type,
          name: formatValidationName(validation.validation_type),
          status: validation.status === 'pass' ? 'pass' as const : 
                 validation.status === 'warning' ? 'warning' as const : 'fail' as const,
          severity: validation.severity as 'critical' | 'warning',
          description: validation.message,
          technical_details: getTechnicalDescription(validation.validation_type)
        }));

        setVerificationResults(results);
        
        const criticalFailures = results.filter(r => r.status === 'fail' && r.severity === 'critical');
        const warnings = results.filter(r => r.status === 'warning' || (r.status === 'fail' && r.severity === 'warning'));
        
        if (criticalFailures.length === 0 && warnings.length === 0) {
          toast({
            title: "File verification complete",
            description: "All checks passed. You can proceed to column mapping."
          });
        } else if (criticalFailures.length > 0) {
          toast({
            title: "File verification issues found",
            description: `${criticalFailures.length} critical issues need attention.`,
            variant: "destructive"
          });
        } else {
          toast({
            title: "File verification warnings found",
            description: `${warnings.length} warnings found. You can proceed or address these issues.`,
            variant: "warning"
          });
        }

        // Get preflight logs after validation
        const preflightFileID = localStorage.getItem('preflightFileID');
        if (preflightFileID) {
          setPreflightFileInfo(prev => ({
            ...prev,
            PreflightFileID: parseInt(preflightFileID),
          }));
          getImportLogs(preflightFileID);
        }
      } catch (error) {
        console.error('Validation error:', error);
        toast({
          title: "Validation failed",
          description: "An error occurred while validating the file.",
          variant: "destructive"
        });
        setVerificationResults([]);
      } finally {
        setIsVerifying(false);
      }
    };

    validateUploadedFile();
  }, [toast]);

  // Trigger refresh when filter or pager changes
  useEffect(() => {
    if (preflightFileInfo.PreflightFileID !== 0) {
      getImportLogs(preflightFileInfo.PreflightFileID);
    }
  }, [filter, pagerData.currentPageIndex, refresh]);

  // Handle grid data reload for Tab navigation
  useEffect(() => {
    if (loadGridData) {
      const processedGridData = getGridData(fileData);
      setGridData(processedGridData);
      setLoadGridData(false);
    }
  }, [loadGridData, fileData]);

  // Add this function to check for errors
  const checkForErrors = (data) => {
    const hasAnyErrors = data.some(record => {
      if (record.StatusMessage && record.StatusMessage !== "") {
        try {
          const errorMessages = JSON.parse(record.StatusMessage);
          return errorMessages.some(error => {
            const errorDetail = error[Object.keys(error)[0]];
            return typeof errorDetail === 'object' ? 
              errorDetail.Type === 'Error' : 
              true; // If it's not an object, treat it as an error
          });
        } catch (e) {
          console.error('Error parsing StatusMessage:', e);
          return true; // If we can't parse the message, treat it as an error
        }
      }
      return false;
    });
    setHasErrors(hasAnyErrors);
  };

  // Helper functions to match original implementation
  const showAlert = (config) => {
    toast({
      title: "Alert",
      description: config.message,
      variant: "destructive"
    });
  };

  const showConfirm = (config) => {
    return new Promise((resolve) => {
      setConfirmDialogConfig({
        message: config.message,
        onConfirm: () => {
          setShowConfirmDialog(false);
          resolve(true);
        },
        onReject: () => {
          setShowConfirmDialog(false);
          if (config.RejectFunction) {
            config.RejectFunction();
          }
          resolve(false);
        }
      });
      setShowConfirmDialog(true);
    });
  };

  const getImportLogs = (preflightFileID, ExcludeSystemColumns = false) => {
    setLogsPageLoad(true);
    (preflightService as PreflightService).getPreflightImportLogs(
      preflightFileID,
      (pagerData.currentPageIndex - 1) * pagerData.pageSize,
      pagerData.pageSize,
      ExcludeSystemColumns,
      "Result",
      filter,
      preflightType
    )
    .then(function (res: PreflightResponse) {
      if (res?.content?.Status === "Success") {
        if(res.content.Data.Result === "[]" && filter !== "All" && !manualFilter){
          setFilter("All");
          return;
        }
        setManualFilter(false);
        getLogsData(res);
      } else {
        showAlert({ message: "Unable to fetch the data" });
        setLogsPageLoad(false);
      }
    })
    .catch((err) => {
      console.log(err);
      setLogsPageLoad(false);
    });
  };

  const getLogsData = (res) => {
    if (res?.content?.Data?.Result) {
      let records = JSON.parse(res.content.Data.Result);
      const mappedFields = JSON.parse(res.content.Data?.MappedFields || "[]");
      
      setFileData(records);
      getHeaders(records, mappedFields);
      
      // Set up mapped field IDs for API calls
      setPreflightFileInfo(prev => ({
        ...prev,
        MappedFieldIDs: mappedFields.map(field => ({
          FileColumnName: field.FileColumnName,
          PreflightFieldID: field.PreflightFieldID
        }))
      }));
      
      // Generate grid data immediately after getting logs data
      const processedGridData = getGridData(records);
      setGridData(processedGridData);
      
      // Check for errors in the data
      checkForErrors(records);
      
      setPagerData({
        ...pagerData,
        total: res.content.Data.Count,
        currentPageTotal: records.length,
      });
    }
    setLogsPageLoad(false);
  };

  function getGridData(records) {
    // Create error cell details for navigation - ensure we extract actual values
    let errorCellDetailsArray = [];
    records.forEach((r, rIndex) => {
      if (r.hasOwnProperty("StatusMessage") && r.StatusMessage !== "") {
        const errorMessages = JSON.parse(r.StatusMessage);
        errorMessages.forEach((e, cellIndex) => {
          const columnName = Object.keys(e)[0];
          
          // Extract the actual string value from the record instead of keeping the object
          let actualValue = "";
          const rawValue = r[columnName];
          
          if (typeof rawValue === 'string') {
            actualValue = rawValue;
          } else if (rawValue && typeof rawValue === 'object') {
            // Try to extract meaningful value from object
            if (rawValue.props && rawValue.props.defaultValue) {
              actualValue = String(rawValue.props.defaultValue);
            } else if (rawValue.defaultValue) {
              actualValue = String(rawValue.defaultValue);
            } else if (rawValue.value) {
              actualValue = String(rawValue.value);
            } else {
              // Try other common properties
              const tryExtract = (obj) => {
                if (obj && typeof obj === 'object') {
                  if (obj.text !== undefined) return obj.text;
                  if (obj.display !== undefined) return obj.display;
                  if (obj.name !== undefined) return obj.name;
                  if (obj.content !== undefined) return obj.content;
                }
                return "[Data needs correction]";
              };
              actualValue = tryExtract(rawValue);
            }
          } else {
            actualValue = "[Data needs correction]";
          }
          
          // Don't trim values as requested by user
          
          errorCellDetailsArray.push({
            RowID: r.RowID,
            [columnName]: actualValue, // Store the extracted string value, not the object
            UniqueKey: columnName + "_" + (rIndex + 1) + "_" + (cellIndex + 1),
          });
        });
      }
    });
    setErrorCellDetails(errorCellDetailsArray);

    return records.map((record, rowIndex) => {
      let rowStatus = "Success";
      let errorCount = 0;
      let warningCount = 0;

      let errorData =
        record["StatusMessage"] !== "" && record["StatusMessage"] !== undefined
          ? JSON.parse(record["StatusMessage"])
          : [];

      const columnsWithColor = errorData.map((item, index) => {
        const keyName = Object.keys(item)[0];
        const errorDetail = item[keyName];
        let errorMessage, errorType;

        var errorCellDetail = errorCellDetailsArray.find(
          (x) =>
            x &&
            x !== undefined &&
            x.hasOwnProperty("RowID") &&
            x.RowID === record.RowID &&
            x.hasOwnProperty(keyName)
        );

        if (typeof errorDetail === "object" && errorDetail !== null) {
          errorMessage = errorDetail.Message || "";
          errorType = errorDetail.Type || "Error";
        } else {
          errorMessage = item[keyName];
          errorType = "Error";
        }

        if (errorType === "Error") {
          errorCount++;
        } else if (errorType === "Warning") {
          warningCount++;
        }

        // Enhanced value extraction to handle React component objects
        let originalValue = "";
        
        // First, try to extract from errorCellDetail
        if (errorCellDetail && errorCellDetail[keyName]) {
          const cellValue = errorCellDetail[keyName];
          
          // If it's a React component object, try to extract the defaultValue
          if (typeof cellValue === 'object' && cellValue !== null) {
            // Function to recursively extract value from React component
            const extractValueFromComponent = (component) => {
              if (component && typeof component === 'object') {
                // Check if this component has a defaultValue prop
                if (component.props && component.props.defaultValue !== undefined) {
                  return component.props.defaultValue;
                }
                
                // Check if this component has a value prop
                if (component.props && component.props.value !== undefined) {
                  return component.props.value;
                }
                
                // Recursively search in children
                if (component.props && component.props.children) {
                  if (Array.isArray(component.props.children)) {
                    for (const child of component.props.children) {
                      const found = extractValueFromComponent(child);
                      if (found !== undefined && found !== null && found !== "") {
                        return found;
                      }
                    }
                  } else {
                    const found = extractValueFromComponent(component.props.children);
                    if (found !== undefined && found !== null && found !== "") {
                      return found;
                    }
                  }
                }
                
                // Check if it has a type property and it's an Input or similar
                if (component.type && component.props) {
                  const props = component.props;
                  if (props.defaultValue !== undefined) {
                    return props.defaultValue;
                  }
                  if (props.value !== undefined) {
                    return props.value;
                  }
                }
              }
              return undefined;
            };
            
            const extractedValue = extractValueFromComponent(cellValue);
            if (extractedValue !== undefined && extractedValue !== null && extractedValue !== "" && extractedValue !== "[object Object]") {
              originalValue = String(extractedValue);
            } else {
              // Try direct string conversion as fallback
              const directValue = String(cellValue);
              if (directValue !== "[object Object]" && directValue !== "undefined" && directValue !== "null") {
                originalValue = directValue;
              }
            }
          } else if (typeof cellValue === 'string' && cellValue !== "") {
            originalValue = cellValue;
          }
        }
        
        // If we still don't have a value, try the record directly
        if (!originalValue || originalValue === "[object Object]" || originalValue === "undefined") {
          if (typeof record[keyName] === 'string' && record[keyName] !== "") {
            originalValue = record[keyName];
          } else if (record[keyName] && typeof record[keyName] === 'object') {
            // Try to extract from record object
            const recordValue = record[keyName];
            
            if (recordValue.props && recordValue.props.defaultValue) {
              originalValue = String(recordValue.props.defaultValue);
            } else if (recordValue.defaultValue) {
              originalValue = String(recordValue.defaultValue);
            } else {
              // Try more extraction methods
              const tryExtractFromRecordValue = (obj) => {
                if (obj && typeof obj === 'object') {
                  // Check common property names
                  if (obj.value !== undefined) return obj.value;
                  if (obj.text !== undefined) return obj.text;
                  if (obj.display !== undefined) return obj.display;
                  if (obj.name !== undefined) return obj.name;
                  if (obj.content !== undefined) return obj.content;
                  
                  // If it has a toString that's not the default object toString
                  if (obj.toString && obj.toString !== Object.prototype.toString) {
                    const strValue = obj.toString();
                    if (strValue !== "[object Object]") return strValue;
                  }
                }
                return null;
              };
              
              const extractedFromRecord = tryExtractFromRecordValue(recordValue);
              if (extractedFromRecord) {
                originalValue = String(extractedFromRecord);
              }
            }
          }
        }
        
        // Additional fallback: try to find the value in the original fileData by row index
        if (!originalValue || originalValue === "[object Object]" || originalValue === "undefined") {
          const currentRowIndex = records.findIndex(r => r.RowID === record.RowID);
          
          if (currentRowIndex >= 0 && fileData[currentRowIndex]) {
            const fileDataValue = fileData[currentRowIndex][keyName];
            
            if (typeof fileDataValue === 'string' && fileDataValue !== "" && fileDataValue !== "[object Object]") {
              originalValue = fileDataValue;
            }
          }
        }
        
        // Final fallback
        if (!originalValue || originalValue === "[object Object]" || originalValue === "undefined" || originalValue === "null") {
          originalValue = "[Data needs correction]";
        }

        console.log(`Final original value for ${keyName}:`, originalValue);

        return {
          [keyName]: originalValue, // Return just the string value for now
        };
      });

      if (errorCount > 0) {
        rowStatus = "Error";
      } else if (warningCount > 0) {
        rowStatus = "Warning";
      }

      return {
        ...record,
        RowStatusWithColor: (
          <div className="status-section">
            <div
              className="status-indicator"
              style={{ backgroundColor: rowStatus === "Error" ? "#dc3545" : rowStatus === "Warning" ? "#ffc107" : "#28a745" }}
            ></div>
            <span className="status-text">{rowStatus}</span>
          </div>
        ),
        ...Object.assign({}, ...columnsWithColor),
      };
    });
  }

  const getHeaders = (resp, mappedFields = []) => {
    if (!headers.length && resp && resp.length > 0) {
      const headerNames = Object.keys(resp[0]).filter((x) => {
        return x !== "StatusMessage" && x !== "RowID" && x !== "RowStatus";
      });

      let headers = headerNames.map((name) => {
        return {
          Header: name,
          accessor: name,
        };
      });

      let defaultHeaders = [
        { Header: "Row", accessor: "RowID" },
        { Header: "Status", accessor: "RowStatusWithColor" }
      ];

      defaultHeaders = [...defaultHeaders, ...headers];
      let info = getInfoForColumnNames(headerNames, mappedFields);
      setColumnsInfo(info);
      setHeaders(defaultHeaders);
    }
  };

  function getInfoForColumnNames(headerNames, mappedFields) {
    return headerNames
      .map((header) => {
        const field = mappedFields.find(
          (field) => field.FileColumnName === header
        );
        if (field) {
          return {
            accessor: header,
            info: field.DisplayName ? field.DisplayName : field.ColumnName,
          };
        }
      })
      .filter(Boolean);
  }

  const handleRefreshClick = (resetFilter = false) => {
    setPagerData(defaultPagerData);
    setHeaders([]);
    if (resetFilter) {
      if (filter === "All") {
        setRefresh(!refresh);
      } else {
        setFilter("All");
      }
    } else {
      setRefresh(!refresh);
    }
  };

  const handleStatusSelect = (value) => {
    setManualFilter(true);
    setPagerData(defaultPagerData);
    setFilter(value);
    setRefresh(!refresh);
  };

  const statusOptions = [
    { 
      value: "All", 
      label: "Show All Imported Data", 
      color: "#000000",
      description: "Display all records regardless of status"
    },
    { 
      value: "Success", 
      label: "Show Data Without Errors", 
      color: "#28a745", // Green color for success
      description: "Display only records that passed preflight without errors"
    },
    { 
      value: "Error", 
      label: "Show Data With Errors", 
      color: "#dc3545", // Red color for errors
      description: "Display only records that have preflight errors"
    },
  ];

  const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || '';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const formatValidationName = (type: string): string => {
    return type
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleContinue = () => {
    navigate('/import-wizard/data-quality');
  };

  const handleOverride = () => {
    toast({
      title: "Validation overridden",
      description: "Proceeding to column mapping despite validation issues",
      variant: "destructive"
    });
    navigate('/import-wizard/column-mapping');
  };

  const getCellError = (row, columnName) => {
    if (!row.StatusMessage) return null;
    try {
      const statusMessages = JSON.parse(row.StatusMessage);
      const errorForColumn = statusMessages.find(item => {
        const key = Object.keys(item)[0];
        return key === columnName && item[key].Type === "Error";
      });
      return errorForColumn ? errorForColumn[columnName].Message : null;
    } catch (e) {
      return null;
    }
  };

  const saveInputChange = (field, oldValue, newValue, isTab = false) => {
    var mappedFieldID = preflightFileInfo.MappedFieldIDs?.find(
      (x) => x.FileColumnName == field.JSONProperty
    )?.PreflightFieldID;

    if (isTab) {
      let nextErrorIndex =
        errorCellDetails.findIndex((e) => e.UniqueKey === field.UniqueKey) + 1;
      if (nextErrorIndex < errorCellDetails.length) {
        setErrorCellUniqueKey(errorCellDetails[nextErrorIndex].UniqueKey);
      } else {
        setErrorCellUniqueKey(errorCellDetails[0].UniqueKey);
      }
    } else {
      setErrorCellUniqueKey("");
    }

    if (oldValue !== newValue && newValue !== undefined) {
      setConfirmDialogConfig({
        message: "Do you want to update all fields that have the same old value with the newly entered value?",
        onReject: () => {
          setShowConfirmDialog(false);
          updateData(field, oldValue, newValue, mappedFieldID, false);
        },
        onConfirm: () => {
          setShowConfirmDialog(false);
          updateData(field, oldValue, newValue, mappedFieldID, true);
        }
      });
      setShowConfirmDialog(true);
    } else if (isTab) {
      setLoadGridData(true);
    }
  };

  const updateData = (
    field,
    oldValue,
    newValue,
    mappedFieldID,
    isBatchUpdate
  ) => {
    setLogsPageLoad(true);
    preflightService
      .updateFileData({
        FileID: preflightFileInfo.PreflightFileID,
        RowID: field.RowID,
        ColumnName: field.JSONProperty,
        oldValue: oldValue,
        NewValue: newValue,
        MappedFieldID: mappedFieldID,
        StatusMessage: field.StatusMessage,
        IsBatchUpdate: isBatchUpdate,
        ValidationType: preflightType,
      })
      .then((res: any) => {
        setLoadSidePanelOnSave(false);
        if (res?.content?.Status === "Success") {
          handleRefreshClick();
          // After refresh, the getLogsData function will be called which will check for errors
        } else if (res?.content?.Status === "Error") {
          setLogsPageLoad(false);
          showAlert({
            message: res?.content?.ErrorMessage
              ? res.content.ErrorMessage
              : "Failed to update the data",
          });
        }
      })
      .catch((err) => {
        setLoadSidePanelOnSave(false);
        setLogsPageLoad(false);
        console.log(err);
      });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header currentPage="import-wizard" />

      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">File Preflighting</h2>
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
              isComplete={true}
            />
            <StepConnector isCompleted={true} />
            <ProgressStep 
              icon={<FileCheck />}
              label="File Preflighting"
              isActive={true}
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

          <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-xl font-semibold mb-4">File Preflighting</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-700">
                We're checking your file for proper formatting and data quality. This includes:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>File structure validation</li>
                  <li>Header validation (uniqueness, required columns)</li>
                  <li>Data structure consistency</li>
                  <li>Row count verification</li>
                </ul>
              </p>
            </div>
            <p className="text-gray-600 mb-6">
              If any critical issues are found, you'll need to fix them before proceeding. Warnings can be reviewed but won't block the import process.
            </p>
            
            {isVerifying ? (
              <Loading message="File Preflighting in progress..." />
            ) : (
              <>
                {verificationResults.length > 0 ? (
                  <ValidationStatus 
                    results={verificationResults}
                    title="File Preflighting Results"
                  />
                ) : (
                  <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-700">No Preflight checks were completed. There might be an issue with the file format.</p>
                  </div>
                )}

                {!isVerifying && (
                  <div className="mt-8">
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-4 gap-4">
                      <div className="status-dropdown-container">
                        <StatusDropdown
                          options={statusOptions}
                          defaultText={statusOptions.find((x) => x.value === filter)?.label || "Show All"}
                          onSelect={handleStatusSelect}
                          value={filter}
                          outerStyles={{ width: "280px" }}
                        />
                      </div>
                      <div className="pager-container">
                        <PagerTop
                          pageSize={pagerData.pageSize}
                          currentPageIndex={pagerData.currentPageIndex}
                          currentPageTotal={pagerData.currentPageTotal}
                          total={pagerData.total}
                          handlePageIndexChange={(nextIndex) => {
                            if (nextIndex !== pagerData.currentPageIndex && nextIndex > 0) {
                              setLogsPageLoad(true);
                              setPagerData({
                                ...pagerData,
                                currentPageIndex: nextIndex,
                                isPageIndexChanged: true,
                              });
                            }
                          }}
                          refreshData={handleRefreshClick}
                        />
                      </div>
                    </div>

                    {/* Grid Container with constrained width */}
                    <div className="w-full">
                      <div className="overflow-x-auto border border-gray-200 rounded-lg bg-white shadow-sm">
                        {logsPageLoad ? (
                          <div className="flex justify-center items-center p-8">
                            <Loading message="Loading grid data..." />
                          </div>
                        ) : (
                          <div className="min-w-full">
                            <Grid
                              columnHeaders={headers}
                              gridData={gridData}
                              isAutoAdjustWidth={true}
                              getCellError={getCellError}
                              onCellBlur={(rowIndex, accessor, newValue) => {
                                const row = gridData[rowIndex];
                                const oldValue = row[accessor];
                                saveInputChange({
                                  RowID: row.RowID,
                                  JSONProperty: accessor,
                                  UniqueKey: `${accessor}_${rowIndex + 1}`,
                                  StatusMessage: row.StatusMessage
                                }, oldValue, newValue);
                              }}
                              fixedWidthColumns={[
                                { accessor: "RowID", width: 80 },
                                { accessor: "RowStatusWithColor", width: 120 },
                              ]}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row sm:justify-between items-center gap-4">
            <div className="flex gap-4">
              <Link to="/import-wizard/upload">
                <Button variant="outline">
                  <ArrowLeft className="mr-2" />
                  Back
                </Button>
              </Link>
            </div>
            <div className="flex gap-4">
              {verificationResults.some(v => v.status === 'fail' && v.severity === 'critical') && (
                <Button 
                  variant="destructive"
                  onClick={handleOverride}
                >
                  Override Errors
                </Button>
              )}
              <Button 
                className="bg-[rgb(59,130,246)] hover:bg-[rgb(37,99,235)]"
                onClick={handleContinue}
                disabled={isVerifying || hasErrors || verificationResults.some(v => v.status === 'fail' && v.severity === 'critical')}
              >
                Continue to Data Quality
                <ArrowRight className="ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <div className="absolute right-4 top-4">
            <button
              onClick={() => setShowConfirmDialog(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Update</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialogConfig.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={confirmDialogConfig.onReject}>
              Update Only This Field
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDialogConfig.onConfirm}>
              Update All Similar Fields
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
