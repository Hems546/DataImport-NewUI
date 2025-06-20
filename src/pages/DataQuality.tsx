import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { 
  FileCheck,
  ArrowRight,
  ArrowLeft,
  FileBox,
  ClipboardCheck,
  ArrowUpCircle,
  Info,
  AlertTriangle,
  FileSpreadsheet
} from "lucide-react";
import MapColumns from "@/components/icons/MapColumns";
import DataQualityIcon from "@/components/icons/DataQuality";
import TransformData from "@/components/icons/TransformData";
import ProgressStep from "@/components/ProgressStep";
import StepConnector from "@/components/StepConnector";
import ValidationStatus, { ValidationResult as ValidationStatusResult } from '@/components/ValidationStatus';
import { validateDataQuality } from "@/services/fileValidation";
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loading } from "@/components/ui/loading";
import { preflightService } from "@/services/preflightService";
import Grid from '@/components/GridGrouping';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import StatusDropdown from '@/components/StatusDropdown';
import PagerTop from '@/components/Pager';
import Modal from '@/components/Modal';
import { MasterDataSelection } from '@/components/MasterDataSelection';
import '@/styles/components/MasterDataSelection.css';
import SidePanel from '@/components/SidePanel';

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
  currentPageIndex: 1,
  pageSize: 10,
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
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [validationResults, setValidationResults] = useState<ValidationStatusResult[]>([]);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [gridData, setGridData] = useState<GridData[]>([]);
  const [filteredGridData, setFilteredGridData] = useState<GridData[]>([]);
  const [headers, setHeaders] = useState<{
    Header: string;
    accessor: string;
  }[]>([]);
  const [preflightType] = useState("DataValidation");
  const [isFixingData, setIsFixingData] = useState(false);
  const [filter, setFilter] = useState('All');
  const [pagerData, setPagerData] = useState(defaultPagerData);
  const [logsPageLoad, setLogsPageLoad] = useState(false);
  const [manualFilter, setManualFilter] = useState(false);
  const [showFixDataPanel, setShowFixDataPanel] = useState(false);
  const [isLoadingMaster, setIsLoadingMaster] = useState(false);

  // Filter grid data based on selected status
  useEffect(() => {
    if (filter === 'All') {
      setFilteredGridData(gridData);
    } else {
      setFilteredGridData(gridData.filter(item => item.type === filter));
    }
  }, [filter, gridData]);

  const handleStatusSelect = (value: string) => {
    setFilter(value);
  };

  const getImportLogs = (preflightFileID: string, ExcludeSystemColumns = false) => {
    setLogsPageLoad(true);
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
      }
    })
    .catch((err) => {
      console.log(err);
      setLogsPageLoad(false);
    });
  };

  const getLogsData = (res: PreflightResponse) => {
    if (res?.content?.Data?.Result) {
      let records = JSON.parse(res.content.Data.Result);
      const mappedFields = JSON.parse(res.content.Data?.MappedFields || "[]");
      
      setParsedData(records);
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
      setFilteredGridData(getGridData(records));
      
      setPagerData({
        ...pagerData,
        total: res.content.Data.Count || 0,
        currentPageTotal: records.length,
      });
    }
    setLogsPageLoad(false);
  };

  const getHeaders = (records: any[], mappedFields: any[]) => {
    if (records.length === 0) {
      setHeaders([]);
      return;
    }

    const firstRecord = records[0];
    const headerKeys = Object.keys(firstRecord);

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
      try {
        const preflightFileID = localStorage.getItem('preflightFileID');
        if (!preflightFileID) {
          toast({
            title: "Error",
            description: "No preflight file ID found. Please upload a file first.",
            variant: "destructive",
          });
          return;
        }

        const storedColumnMappings = JSON.parse(localStorage.getItem('columnMappings') || '[]');
        const request = {
          MappedFieldIDs: [
            ...storedColumnMappings.map(mapping => ({
              FileColumnName: mapping.sourceColumn,
              PreflightFieldID: mapping.PreflightFieldID,
              IsCustom: mapping.IsCustom,
              Location: mapping.Locations
            })),
          ],
          IsValidate: true,
          Action: "Field Mappings",
          AddColumns: "",
          FilePath: localStorage.getItem('uploadedFilePath') || "",
          FileType: JSON.parse(localStorage.getItem('uploadedFileInfo') || '{}').type || "",
          PreflightFileID: localStorage.getItem('preflightFileID') || "",
          FileName: JSON.parse(localStorage.getItem('uploadedFileInfo') || '{}').name || "",
          ImportName: "Preflight_" + (localStorage.getItem('selectedImportTypeName') || "Unknown") + "_" + new Date().toISOString(),
          DocTypeID: parseInt(localStorage.getItem('selectedImportType') || '1'),
          Status: "Warning"
        };

        const response = await preflightService.validateWarnings(request) as PreflightResponse;
        if (response?.content?.Status === "Success") {
          getImportLogs(preflightFileID);
        }

      } catch (error) {
        console.error('Error analyzing data quality:', error);
        toast({
          title: "Error",
          description: "Failed to analyze data quality. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsAnalyzing(false);
      }
    };

    analyzeDataQuality();
  }, []);

  const handleFixDataClick = () => {
    console.log('Fix Data button clicked');
    setIsLoadingMaster(true);
    
    // Directly call getSectionsData method
    const getSectionsData = async () => {
      try {
        const preflightFileID = localStorage.getItem('preflightFileID');
        if (!preflightFileID) {
          toast({
            title: "Error",
            description: "No preflight file ID found.",
            variant: "destructive",
          });
          return;
        }

        const res = await preflightService.getMissingMasterColumns(preflightFileID) as any;
        if (res?.content?.Data) {
          const data = JSON.parse(res.content.Data);
          if (data.length > 0) {
            setShowFixDataPanel(true);
          } else {
            toast({
              title: "Info",
              description: "No missing master data found to fix.",
              variant: "default",
            });
          }
        } else {
          toast({
            title: "Info",
            description: "No missing master data found to fix.",
            variant: "default",
          });
        }
      } catch (error) {
        console.error('Error fetching sections data:', error);
        toast({
          title: "Error",
          description: "Failed to fetch sections data.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingMaster(false);
      }
    };

    getSectionsData();
  };

  const handleRefreshClick = () => {
    setPagerData(defaultPagerData);
    setHeaders([]);
    setLogsPageLoad(true);
    const preflightFileID = localStorage.getItem('preflightFileID');
    if (preflightFileID) {
      getImportLogs(preflightFileID);
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
    const preflightFileID = localStorage.getItem('preflightFileID');
    if (preflightFileID) {
      getImportLogs(preflightFileID);
    }
    // eslint-disable-next-line
  }, [pagerData.currentPageIndex]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header currentPage="import-wizard" />

      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <Link to="/import-wizard/verification">
                <Button variant="outline">
                  <ArrowLeft className="mr-2" />
                  Back
                </Button>
              </Link>
              <h2 className="text-2xl font-bold">Data Quality</h2>
            </div>
          </div>

          {/* Progress Steps */}
          <ScrollArea className="w-full pb-4">
            <div className="flex justify-between items-center mb-12 min-w-max pr-6">
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
                isComplete={true}
              />
              <StepConnector isCompleted={true} />
              <ProgressStep 
                icon={<DataQualityIcon />}
                label="Data Quality"
                isActive={true}
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
          </ScrollArea>
          
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
            {isAnalyzing || logsPageLoad ? (
              <Loading message="Analyzing data quality..." />
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
                        disabled={isLoadingMaster}
                      >
                        <FileSpreadsheet className="h-4 w-4" />
                        {isLoadingMaster ? 'Fixing Data...' : 'Fix Data'}
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
                          refreshData={handleRefreshClick}
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
              <Link to="/import-wizard/verification">
                <Button variant="outline">
                  <ArrowLeft className="mr-2" />
                  Back
                </Button>
              </Link>
            </div>
            <Link to="/import-wizard/normalization">
              <Button 
                className="bg-[rgb(59,130,246)] hover:bg-[rgb(37,99,235)]"
                disabled={isAnalyzing || logsPageLoad}
              >
                Continue to Data Normalization
                <ArrowRight className="ml-2" />
              </Button>
            </Link>
          </div>

          {showFixDataPanel && (
            <SidePanel
              title="Fix Missing Master Data"
              isMouseOutClose={false}
              isBackgroundDisable={true}
              style={{ width: "60%", zIndex: 9999, right: 0, position: "fixed", height: "100vh", top: 0, overflow: "hidden" }}
              onClose={() => setShowFixDataPanel(false)}
            >
              <MasterDataSelection
                preflightFileID={localStorage.getItem('preflightFileID') || ''}
                onClose={() => setShowFixDataPanel(false)}
                onSuccess={() => {
                  handleRefreshClick();
                  setShowFixDataPanel(false);
                }}
              />
              <div id="side-panel-fallback" style={{display: 'none', color: 'red'}}>If you see this, the side panel failed to render.</div>
            </SidePanel>
          )}
        </div>
      </div>
    </div>
  );
}
