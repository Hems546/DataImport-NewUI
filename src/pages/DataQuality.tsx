import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight,
  ArrowLeft,
  Info,
  AlertTriangle,
  FileSpreadsheet,
  X
} from "lucide-react";
import { ImportStepHeader } from "@/components/ImportStepHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loading } from "@/components/ui/loading";
import { preflightService } from "@/services/preflightService";
import Grid from '@/components/GridGrouping';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import StatusDropdown from '@/components/StatusDropdown';
import PagerTop from '@/components/Pager';
import { MasterDataSelection } from '@/components/MasterDataSelection';
import '@/styles/components/MasterDataSelection.css';

interface WarningData {
  Type: string;
  Message: string;
  Value?: string;
}

interface Warning {
  [key: string]: WarningData;
}

interface PreflightResponse {
  content: {
    Status: string;
    Data?: {
      Result?: string;
      Count?: number;
      MappedFields?: string;
      Warnings?: Warning[];
      DataStatus?: string;
      ID?: number;
      Status?: string;
    };
  };
}

interface GridData {
  field: string;
  type: string;
  message: string;
  value: string;
}

const defaultPagerData = {
  pageSize: 10,
  currentPageIndex: 1,
  total: 0,
  currentPageTotal: 0
};

const statusOptions = [
  { value: 'All', label: 'Show All', color: '#6B7280', description: 'Display all records' },
  { value: 'Success', label: 'Show Data Without Warnings', color: '#10B981', description: 'Display only records without warnings' },
  { value: 'Warning', label: 'Show Data With Warnings', color: '#FFD700', description: 'Display only records with warnings' }
];

function getGridData(records) {
  return records.map((record, index) => {
    const newRow = { ...record };
    let warningCount = 0;
    if (record.StatusMessage) {
      try {
        const warnings = JSON.parse(record.StatusMessage);
        warnings.forEach((warning) => {
          const key = Object.keys(warning)[0];
          if (warning[key].Type === "Warning") {
            warningCount++;
            newRow[key] = (
              <span className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-pointer">
                        <Info className="h-4 w-4 text-yellow-500" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent sideOffset={0} align="center" className="relative shadow-lg rounded-md border border-gray-200 bg-white px-3 py-2">
                      <p className="text-sm text-gray-800">{warning[key].Message}</p>
                      <div className="absolute left-1/2 top-full -translate-x-1/2 mt-1 w-3 h-3 rotate-45 bg-white border-r border-b border-gray-200 shadow z-20"></div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <span>{record[key]}</span>
              </span>
            );
          }
        });
      } catch {}
    }
    
    newRow.rowNumber = index + 1;
    newRow.rowStatus = (
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${warningCount > 0 ? "bg-yellow-500" : "bg-green-500"}`}></span>
        <span>{warningCount > 0 ? "Warning" : "Success"}</span>
      </div>
    );

    return newRow;
  });
}

// Custom Spinner
const Spinner = () => (
  <div className="flex justify-center items-center p-8">
    <svg className="animate-spin h-8 w-8 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
    </svg>
  </div>
);

// Custom Dropdown
const Dropdown = ({ items, placeholder, value, onChange }) => (
  <select
    className="border rounded px-2 py-1 min-w-[120px] focus:outline-none focus:ring-2 focus:ring-blue-400"
    value={value || ''}
    onChange={onChange}
  >
    <option value="" disabled>{placeholder}</option>
    {items && items.map((item, idx) => (
      <option key={idx} value={item.Value || item.value || item}>{item.Display || item.display || item.label || item}</option>
    ))}
  </select>
);

export default function DataQualityPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Get data from location state
  const locationPreflightFileInfo = location.state?.preflightFileInfo;
  const currentStep = location.state?.currentStep;
  const completedSteps = location.state?.completedSteps || [];
  
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [gridData, setGridData] = useState<GridData[]>([]);
  const [headers, setHeaders] = useState<{
    Header: string;
    accessor: string;
  }[]>([]);
  const [preflightType] = useState("DataValidation");
  const [filter, setFilter] = useState('All');
  const [pagerData, setPagerData] = useState(defaultPagerData);
  const [logsPageLoad, setLogsPageLoad] = useState(false);
  const [manualFilter, setManualFilter] = useState(false);
  const [isLoadingMaster, setIsLoadingMaster] = useState(false);
  const [loadingState, setLoadingState] = useState({
    isLoading: false,
    loadingText: "",
    operation: ""
  });
  const [preflightFileInfo, setPreflightFileInfo] = useState(() => 
    locationPreflightFileInfo || {
      PreflightFileID: 0,
      Status: "",
      FileUploadStatus: "Success",
      FieldMappingStatus: "Success",
      DataPreflightStatus: "In Progress",
      DataValidationStatus: "",
      DataVerificationStatus: "",
      ImportName: "",
      Action: "Data Quality",
      AddColumns: "",
      FileName: "",
      FileType: "",
      FileSize: 0,
      FileExtension: "",
      FileData: "",
      DocTypeID: 0,
      ImportTypeName: "",
      MappedFieldIDs: []
    }
  );
  const [productTypes, setProductTypes] = useState<Array<{ Value: number; Display: string }>>([]);
  const [columnsInfo, setColumnsInfo] = useState<Array<{ info: string; accessor: string }>>([]);
  const [masterListHeaderName, setMasterListHeaderName] = useState({
    HeaderName: "",
    AliasName: "",
    ParentTypeText: "",
  });
  const [masterDropdownData, setMasterDropdownData] = useState({ 
    ShowSidePanel: false,
    shouldRefreshOnClose: false
  });

  useEffect(() => {
    // Get data from route state and update preflightFileInfo if available
    const state = location.state as any;
    const { preflightFileInfo: incomingPreflightFileInfo } = state || {};
    
    if (incomingPreflightFileInfo) {
      setPreflightFileInfo(incomingPreflightFileInfo);
    }
  }, [location.state]);

  const handleStatusSelect = (value: string) => {
    setLoadingState({
      isLoading: true,
      loadingText: `Filtering data to show ${value === 'All' ? 'all records' : value === 'Success' ? 'records without warnings' : 'records with warnings'}...`,
      operation: "filter"
    });
    setFilter(value);
    setManualFilter(true);
  };

  const getImportLogs = (preflightFileID: string | number, ExcludeSystemColumns = false) => {
    setLogsPageLoad(true);
    if (!loadingState.isLoading) {
      setLoadingState({
        isLoading: true,
        loadingText: "Loading data quality results from server...",
        operation: "refresh"
      });
    }
    
    preflightService.getPreflightImportLogs(
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
        if(res.content.Data?.Result === "[]" && filter !== "All" && !manualFilter){
          setFilter("All");
          return;
        }
        setManualFilter(false);
        getLogsData(res);
      } else {
        toast({
          title: "Error",
          description: "Unable to fetch the data",
          variant: "destructive",
        });
        setLogsPageLoad(false);
        setLoadingState({ isLoading: false, loadingText: "", operation: "" });
      }
    })
    .catch((err) => {
      console.log(err);
      setLogsPageLoad(false);
      setLoadingState({ isLoading: false, loadingText: "", operation: "" });
    });
  };

  const getLogsData = (res: PreflightResponse) => {
    if (res?.content?.Data?.Result) {
      // Parse and update status information from API response
      let dataStatus: any = res.content.Data?.DataStatus;
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
        PreflightFileID: res.content.Data?.ID || prev.PreflightFileID,
        Status: res.content.Data?.Status || prev.Status,
        FileUploadStatus: dataStatus?.FileUpload || prev.FileUploadStatus,
        FieldMappingStatus: dataStatus?.FieldMapping || prev.FieldMappingStatus,
        DataPreflightStatus: dataStatus?.DataPreflight || prev.DataPreflightStatus,
        DataValidationStatus: dataStatus?.DataValidation || prev.DataValidationStatus,
        DataVerificationStatus: dataStatus?.DataVerification || prev.DataVerificationStatus,
      }));
      
      let records = JSON.parse(res.content.Data.Result);
      const mappedFields = JSON.parse(res.content.Data?.MappedFields || "[]");
      
      getHeaders(records, mappedFields);
      
      // Generate grid data from warnings
      const warnings = records.map(record => {
        if (record.StatusMessage) {
          try {
            return JSON.parse(record.StatusMessage);
          } catch (e) {
            return [];
          }
        }
        return [];
      }).flat();

      const transformedData = warnings.map(warning => {
        const field = Object.keys(warning)[0];
        return {
          field,
          type: warning[field].Type,
          message: warning[field].Message,
          value: warning[field].Value || ''
        };
      });

      setGridData(getGridData(records));
      
      setPagerData({
        ...pagerData,
        total: res.content.Data.Count || 0,
        currentPageTotal: records.length,
      });
    }
    setLogsPageLoad(false);
    setIsAnalyzing(false);
    setLoadingState({ isLoading: false, loadingText: "", operation: "" });
  };

  const getHeaders = (records: any[], mappedFields: any[]) => {
    if (records.length === 0) {
      setHeaders([]);
      return;
    }

    const firstRecord = records[0];
    const headerKeys = Object.keys(firstRecord);

    // Filter out unwanted keys for column processing
    const filteredKeys = headerKeys.filter(key => 
      key !== 'StatusMessage' && 
      key !== 'RowStatusWithColor' && 
      key !== 'PreflightFileID' && 
      key !== 'MappedRecordID' && 
      key !== 'RowID' && 
      key !== 'RowStatus'
    );

    // Process column info for MasterDataSelection
    const info = getInfoForColumnNames(filteredKeys, mappedFields);
    setColumnsInfo(info);

    const generatedHeaders = headerKeys
      .filter(key => key !== 'StatusMessage' && key !== 'RowStatusWithColor' && key !== 'PreflightFileID' && key !== 'MappedRecordID')
      .map(key => {
        const mappedField = mappedFields.find(f => f.Value === key);
        return {
          Header: mappedField ? mappedField.Display : key,
          accessor: key,
        };
      });

    const staticHeaders = [
      { Header: "Row #", accessor: "rowNumber" },
      { Header: "Status", accessor: "rowStatus" }
    ];

    setHeaders([...staticHeaders, ...generatedHeaders]);
  };

  const transformWarningsToGridData = (warnings: Warning[]): GridData[] => {
    return warnings.flatMap(warning => 
      Object.entries(warning).map(([field, data]) => ({
        field,
        type: data.Type,
        message: data.Message,
        value: data.Value || ''
      }))
    );
  };

  useEffect(() => {
    const analyzeDataQuality = async () => {
      setLoadingState({
        isLoading: true,
        loadingText: "Initializing data quality analysis. Please wait...",
        operation: "analyze"
      });
      
      try {
        // Get data from route state instead of localStorage
        const state = location.state as any;
        const { preflightFileInfo } = state || {};
        
        if (!preflightFileInfo?.PreflightFileID) {
          toast({
            title: "Error",
            description: "No preflight file ID found. Please upload a file first.",
            variant: "destructive",
          });
          setLoadingState({ isLoading: false, loadingText: "", operation: "" });
          setIsAnalyzing(false);
          return;
        }

        // Update loading message for validation phase
        setLoadingState({
          isLoading: true,
          loadingText: "Validating data and checking for quality issues...",
          operation: "analyze"
        });

        const request = {
          MappedFieldIDs: preflightFileInfo?.MappedFieldIDs || [],
          IsValidate: true,
          Action: "Field Mappings",
          AddColumns: "",
          FilePath: preflightFileInfo?.FilePath || "",
          FileType: preflightFileInfo?.FileType || "text/csv",
          PreflightFileID: preflightFileInfo.PreflightFileID,
          FileName: preflightFileInfo?.FileName || "",
          ImportName: preflightFileInfo?.ImportName || ("Preflight_Unknown_" + new Date().toISOString()),
          DocTypeID: preflightFileInfo?.DocTypeID || 1,
          Status: "Warning"
        };

        // Update loading message for API call
        setLoadingState({
          isLoading: true,
          loadingText: "Communicating with server to analyze data quality...",
          operation: "analyze"
        });

        const response = await preflightService.validateWarnings(request) as PreflightResponse;
        if (response?.content?.Status === "Success") {
          setLoadingState({
            isLoading: true,
            loadingText: "Loading validation results and preparing data grid...",
            operation: "analyze"
          });
          getImportLogs(preflightFileInfo.PreflightFileID.toString());
        }

      } catch (error) {
        console.error('Error analyzing data quality:', error);
        toast({
          title: "Error",
          description: "Failed to analyze data quality. Please try again.",
          variant: "destructive",
        });
        setLoadingState({ isLoading: false, loadingText: "", operation: "" });
        setIsAnalyzing(false);
      }
    };

    analyzeDataQuality();
  }, [location.state, toast]);

  const handleFixDataClick = () => {
    console.log('Fix Data button clicked - Opening popup modal');
    console.log('masterDropdownData before:', masterDropdownData);
    setMasterDropdownData({ ShowSidePanel: true, shouldRefreshOnClose: true });
    console.log('Popup modal should now be visible');
  };

  // Fetch product types
  useEffect(() => {
    const fetchProductTypes = async () => {
      try {
        // Use preflightService to maintain consistency
        setProductTypes([
          { Value: 1, Display: "Print" },
          { Value: 2, Display: "Digital" },
          { Value: 3, Display: "Other" }
        ]);
      } catch (error) {
        console.error('Error fetching product types:', error);
      }
    };

    fetchProductTypes();
  }, []);

  // Function to fetch validation data
  const fetchValidateData = async (sectionName: string, parentType: number) => {
    const payload = {
      PreflightFileID: preflightFileInfo.PreflightFileID,
      ColumnName: sectionName,
      ParentType: parentType,
    };

    try {
      const res = await preflightService.getPreFlightValidationList(payload);
      if (res) {
        const data = typeof res === 'string' ? JSON.parse(res) : [];
        return data.map((item: any) => ({
          ColumnName: item.ColumnName,
          CurrentValue: item.CurrentValue,
          UpdatedValue: "",
          IsNewInsert: true,
          IsMarked: false,
          ID: item.CurrentValue,
          MasterID: item.MasterID,
        }));
      }
    } catch (error) {
      console.error('Error fetching validation data:', error);
    }
    return [];
  };

  // Function to show success animation
  const showSuccessAnimation = (message: string) => {
    return (
      <div className="success-animation">
        <svg className="tick-success" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52" width="64" height="64">
          <circle className="tick-success-circle" cx="26" cy="26" r="25" fill="none" stroke="#10B981" strokeWidth="2" />
          <path className="tick-success-check" fill="none" stroke="#10B981" strokeWidth="3" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
        </svg>
        <div className="mt-4 text-lg font-semibold text-green-600 text-center">
          {message}
        </div>
      </div>
    );
  };

  const handleRefreshClick = () => {
    setLoadingState({
      isLoading: true,
      loadingText: "Refreshing data quality analysis results...",
      operation: "refresh"
    });
    setPagerData(defaultPagerData);
    setHeaders([]);
    setLogsPageLoad(true);
    if (preflightFileInfo?.PreflightFileID) {
      getImportLogs(preflightFileInfo.PreflightFileID);
    }
  };

  const handlePageIndexChange = (nextIndex) => {
    if (nextIndex !== pagerData.currentPageIndex && nextIndex > 0) {
      setLogsPageLoad(true);
      setPagerData({
        ...pagerData,
        currentPageIndex: nextIndex,
      });
    }
  };

  // Add useEffect to reload data when pagerData.currentPageIndex changes
  useEffect(() => {
    if (preflightFileInfo?.PreflightFileID) {
      getImportLogs(preflightFileInfo.PreflightFileID);
    }
    // eslint-disable-next-line
  }, [pagerData.currentPageIndex]);



  // Function to process column information from mapped fields
  const getInfoForColumnNames = (headerNames: string[], mappedFields: any[]) => {
    const formattedDisplayNames = headerNames
      .map((header) => {
        const field = mappedFields.find(
          (field) => field.FileColumnName === header
        );
        if (field) {
          return {
            accessor: header,
            info: field.DisplayName ? field.DisplayName : field.ColumnName,
            MaxLength: field.Maxlength,
            RegexFormat: field.RegexFormat,
            RegexDesc: field.RegexDesc,
            IsMandatory: field.IsMandatory,
            IsMasterType: field.IsMasterType,
          };
        }
        return null;
      })
      .filter(Boolean); // Filter out undefined values
    return formattedDisplayNames;
  };




  return (
    <div className="min-h-screen flex flex-col">
      {/* Full-Screen Loading Overlay - Similar to Split Full Address */}
      {loadingState.isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md mx-4">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <h3 className="text-lg font-semibold mb-2">
                {loadingState.operation === "analyze" ? "Analyzing Data Quality" :
                 loadingState.operation === "fix" ? "Preparing Data Fix" :
                 loadingState.operation === "refresh" ? "Refreshing Data" :
                 loadingState.operation === "filter" ? "Filtering Results" :
                 "Processing Data"}
              </h3>
              <p className="text-gray-600 text-center">
                {loadingState.loadingText || "Please wait while we process your request..."}
              </p>
              <div className="w-64 bg-gray-200 rounded-full h-2 mt-4">
                <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{
                  width: loadingState.operation === "analyze" ? '75%' :
                         loadingState.operation === "fix" ? '60%' :
                         loadingState.operation === "refresh" ? '85%' :
                         loadingState.operation === "filter" ? '90%' : '50%'
                }}></div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <Header currentPage="import-wizard" />

      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Import Step Header */}
          <ImportStepHeader
            stepTitle="Data Quality"
            status={preflightFileInfo.Status || 'Not Started'}
            docTypeName={preflightFileInfo.ImportTypeName || 'Unknown Type'}
            importName={preflightFileInfo.ImportName || 'Untitled Import'}
            currentStep={currentStep || "DataValidation"}
            completedSteps={completedSteps.length > 0 ? completedSteps : ["FileUpload", "FieldMapping", "DataPreflight"]}
            preflightFileInfo={preflightFileInfo}
            setPreflightFileInfo={setPreflightFileInfo}
          />

          {/* Back Button */}
          <div className="flex items-center gap-4 mb-8">
            <Button 
              variant="outline"
              disabled={loadingState.isLoading}
              onClick={() => navigate('/import-wizard/verification', {
                state: {
                  preflightFileInfo: preflightFileInfo
                }
              })}
            >
              <ArrowLeft className="mr-2" />
              Back
            </Button>
          </div>
          
          {/* Instructions Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Data Quality Analysis</CardTitle>
              <CardDescription>
                We're analyzing your data for quality issues and providing recommendations for improvement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-medium">About Data Quality Analysis:</p>
                  <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                    <li>Fields are being checked for proper formatting, valid values, and logical consistency</li>
                    <li>Critical issues must be resolved before proceeding</li>
                    <li>Warnings can be addressed using the Spreadsheet Mode to fix data issues</li>
                    <li>Click the <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-blue-100 text-blue-800"><FileSpreadsheet className="h-3 w-3 mr-1" />Fix Data</span> button to correct issues</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <div className="bg-white p-8 rounded-lg border border-gray-200">
            {isAnalyzing || logsPageLoad || loadingState.isLoading ? (
              <Loading message={
                loadingState.isLoading ? loadingState.loadingText : 
                isAnalyzing ? "Analyzing data quality..." : 
                "Loading data..."
              } />
            ) : (
              <>
                {gridData.length > 0 ? (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Data Validation Results</h3>
                      <Button 
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={handleFixDataClick}
                        disabled={isLoadingMaster || loadingState.isLoading}
                      >
                        <FileSpreadsheet className="h-4 w-4" />
                        {isLoadingMaster || (loadingState.isLoading && loadingState.operation === "fix") ? 'Preparing Fix...' : 'Fix Data'}
                      </Button>
                    </div>

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
                          handlePageIndexChange={handlePageIndexChange}
                        />
                      </div>
                    </div>
                    
                                          <div className="w-full">
                        <div className="overflow-x-auto border border-gray-200 rounded-lg bg-white shadow-sm">
                          <div className="min-w-full">
                            <Grid
                              columnHeaders={headers}
                              gridData={gridData}
                              isAutoAdjustWidth={true}
                              fixedWidthColumns={headers.map(h => ({ accessor: h.accessor, width: 150 }))}
                            />
                          </div>
                        </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 bg-gray-50 border rounded-md">
                    <AlertTriangle className="h-10 w-10 text-yellow-500 mb-4" />
                    <p className="text-gray-800 font-medium">No data available for analysis</p>
                    <p className="text-gray-500 mt-2">Please ensure a valid file was uploaded in the previous step</p>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="mt-8 flex justify-between items-center">
            <div className="flex gap-4">
              <Button 
                variant="outline"
                disabled={loadingState.isLoading}
                onClick={() => navigate('/import-wizard/verification', {
                  state: {
                    preflightFileInfo: preflightFileInfo
                  }
                })}
              >
                <ArrowLeft className="mr-2" />
                Back
              </Button>
            </div>
            <Button 
              className="bg-[rgb(59,130,246)] hover:bg-[rgb(37,99,235)]"
              disabled={isAnalyzing || logsPageLoad || loadingState.isLoading}
              onClick={() => {
                navigate('/import-step-handler', {
                  state: {
                    requestedStep: 'DataVerification',
                    preflightFileInfo: {
                      ...preflightFileInfo,
                      DataValidationStatus: 'Success',
                      Status: preflightFileInfo.Status || 'Success'
                    }
                  }
                });
              }}
            >
              Continue to Data Normalization
              <ArrowRight className="ml-2" />
            </Button>
          </div>

          {masterDropdownData.ShowSidePanel && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl w-[95vw] max-w-6xl h-[90vh] flex flex-col">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
                  <h2 className="text-lg font-semibold">Fix Missing Master Data</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      console.log('Modal closing...');
                      if (!isLoadingMaster) {
                        if (masterDropdownData.shouldRefreshOnClose) {
                          console.log('Refreshing grid on close');
                          handleRefreshClick();
                        }
                        setMasterDropdownData({ ShowSidePanel: false, shouldRefreshOnClose: false });
                        console.log('Modal closed');
                      }
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Modal Content */}
                <div className="flex-1 overflow-hidden px-2 py-2">
                  <MasterDataSelection
                    preflightFileInfo={preflightFileInfo}
                    setMasterListHeaderName={setMasterListHeaderName}
                    setMasterDropdownData={setMasterDropdownData}
                    fetchValidateData={fetchValidateData}
                    getImportLogs={(fileId) => getImportLogs(fileId)}
                    productTypes={productTypes}
                    columnsInfo={columnsInfo}
                    showSuccessAnimation={showSuccessAnimation}
                    masterListHeaderName={masterListHeaderName}
                    isLoad={isLoadingMaster}
                    setIsLoad={setIsLoadingMaster}
                    handleRefreshClick={handleRefreshClick}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
