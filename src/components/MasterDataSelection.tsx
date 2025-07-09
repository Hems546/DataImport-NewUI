import React, { useState, useEffect } from 'react';
import { preflightService } from '../services/preflightService';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Loading } from './ui/loading';
import { useToast } from '../hooks/use-toast';
import { apiCall } from '@/utils/apiCall';

interface MasterDataSelectionProps {
  preflightFileInfo: {
    PreflightFileID: string | number;
    ImportTypeName: string;
    DataValidationStatus: string;
    Status: string;
    MappedFieldIDs?: Array<{
      FileColumnName: string;
      PreflightFieldID: number;
    }>;
  };
  setMasterListHeaderName: (value: any) => void;
  setMasterDropdownData: (value: any) => void;
  fetchValidateData: (sectionName: string, parentType: number) => Promise<any[]>;
  getImportLogs: (fileId: string | number) => void;
  productTypes: Array<{
    Value: number;
    Display: string;
  }>;
  columnsInfo: Array<{
    info: string;
    accessor: string;
    RegexFormat?: string;
    MaxLength?: number;
    RegexDesc?: string;
  }>;
  showSuccessAnimation: (message: string) => React.ReactNode;
  masterListHeaderName: {
    HeaderName: string;
    AliasName: string;
    ParentTypeText: string;
  };
  isLoad: boolean;
  setIsLoad: (value: boolean) => void;
  handleRefreshClick: () => void;
}

interface MasterDataItem {
  Value: string;
  Display: string;
  ParentType?: number;
}

interface ValidationItem {
  ColumnName: string;
  CurrentValue: string;
  UpdatedValue: string;
  UpdatedID: string;
  IsNewInsert: boolean;
  IsMarked: boolean;
  ID: string;
  ParentType: number;
  MasterID?: number;
  [key: string]: any;
}

interface Section {
  ColumnName: string;
  ParentType: number;
  AliasName: string;
}

// Custom Spinner Component
const CustomSpinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="flex flex-col items-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="text-sm text-gray-600">Loading validation data...</p>
    </div>
  </div>
);

export function MasterDataSelection(props: MasterDataSelectionProps) {
  const {
    preflightFileInfo,
    setMasterListHeaderName,
    setMasterDropdownData,
    fetchValidateData,
    getImportLogs,
    productTypes,
    columnsInfo,
    showSuccessAnimation,
    masterListHeaderName,
    isLoad,
    setIsLoad,
    handleRefreshClick,
  } = props;

  const { toast } = useToast();
  const [ValidationList, setValidationList] = useState<ValidationItem[]>([]);
  const [masterData, setMasterData] = useState<MasterDataItem[]>([]);
  const [currentSection, setCurrentSection] = useState("");
  const [sections, setSections] = useState<Section[]>([]);
  const [newValueData, setNewValueData] = useState<number[]>([]);
  const [confirmShowPopup, setConfirmShowPopup] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [successMode, setSuccessMode] = useState(false);

  // Check if current section is product section
  const isProductSection = columnsInfo?.find((x) => x.info === "Product Name")?.accessor === currentSection;

  // At initial load, it will fetch the data all sections.
  useEffect(() => {
    getSectionsData();
  }, []);

  // It will fetch the data for the selected section.
  const getSectionsData = async () => {
    setNewValueData([]);
    setIsLoad(true);
    
    if (
      preflightFileInfo.DataValidationStatus.toLowerCase() !== "success" &&
      preflightFileInfo.Status.toLowerCase() !== "success"
    ) {
      try {
        const res = await apiCall(
          `/services/PreflightImports/MissingMasterColumns/${preflightFileInfo.PreflightFileID}`,
          "GET"
        );

        if (res?.content?.Data) {
          const data = JSON.parse(res.content.Data) as Section[];
          setSections(data);
          
          const currentSectionName = data[0]?.ColumnName;
          const headerAliasName = data[0]?.AliasName;
          const parentType = data[0]?.ParentType;
          
          let parentTypeText = "";
          if (parentType !== -1) {
            parentTypeText = productTypes?.find((x) => x.Value === parentType)?.Display || "";
          }
          
          setMasterListHeaderName((prev: any) => ({
            ...prev,
            HeaderName: currentSectionName,
            AliasName: headerAliasName,
            ParentTypeText: parentTypeText,
          }));
          
          setCurrentSection(currentSectionName);
          await fetchData(currentSectionName, parentType);
          await fetchMasterData(currentSectionName, parentType, headerAliasName);
          getImportLogs(preflightFileInfo.PreflightFileID);
        } else {
          setIsLoad(false);
          setValidationList([]);
          setMasterDropdownData((prev: any) => ({
            ...prev,
            ShowSidePanel: false,
            shouldRefreshOnClose: false,
          }));
          if (res?.content?.ErrorMessage) {
            toast({
              title: "Error",
              description: res.content.ErrorMessage,
              variant: "destructive",
            });
          }
        }
      } catch (err) {
        console.log(err);
        toast({
          title: "Error",
          description: "Unable to fetch the data",
          variant: "destructive",
        });
        setIsLoad(false);
      }
    } else {
      setIsLoad(false);
      setValidationList([]);
      setMasterDropdownData((prev: any) => ({ ...prev, ShowSidePanel: false, shouldRefreshOnClose: false }));
    }
  };

  // It will fetch the data based on the selected section using ID.
  const fetchMasterData = async (currentSection: string, parentType = -1, aliasName: string) => {
    try {
      // Fetching the Master Data for the selected section.
      const actionType = aliasName?.includes("Full Name (First Name Last Name)")
        ? "FullName Update"
        : "Update";
      
      const fieldID = preflightFileInfo.MappedFieldIDs?.find(
        (x) => x.FileColumnName === currentSection
      )?.PreflightFieldID;

      if (fieldID) {
        const res = await preflightService.getDropDownDataByID(fieldID, parentType, actionType);
        
        // Type guard for response
        const isValidResponse = (resp: unknown): resp is { content: { Data?: string; Status?: string } } => {
          return typeof resp === 'object' && 
                 resp !== null && 
                 'content' in resp &&
                 typeof (resp as any).content === 'object';
        };
        
        if (isValidResponse(res) && res.content.Data) {
          const masterDataList = JSON.parse(res.content.Data);
          setMasterData(masterDataList);
        } else {
          setMasterData([]);
          toast({
            title: "Warning",
            description: `No master data found for ${aliasName || currentSection}. Please click on the "Fix Missing ${aliasName || currentSection} Data" button to fix the data.`,
            variant: "default",
          });
        }
      }
    } catch (err) {
      console.log(err);
      setMasterData([]);
    }
  };

  // It will fetch the data for the selected section columns to validate.
  const fetchData = async (sectionName: string, parentType: number) => {
    try {
      const data = await fetchValidateData(sectionName, parentType);
      
      if (data.length > 0) {
        const isProductSectionLocal = columnsInfo?.find((x) => x.info === "Product Name")?.accessor === sectionName;
        
        const makeValidationList = data.map((item: any) => ({
          ColumnName: item.ColumnName,
          CurrentValue: item.CurrentValue,
          UpdatedValue: "",
          UpdatedID: "",
          IsNewInsert: true,
          IsMarked: false,
          ID: item.CurrentValue,
          ParentType: isProductSectionLocal
            ? item.MasterID !== -1
              ? item.MasterID
              : productTypes.find((x) => x.Display === "Print")?.Value || -1
            : -1,
          ...item,
        }));
        
        setValidationList(makeValidationList);
        setIsLoad(false);
      } else {
        setIsLoad(false);
        setValidationList([]);
        setMasterDropdownData((prev: any) => ({ ...prev, ShowSidePanel: false, shouldRefreshOnClose: false }));
        toast({
          title: "Info",
          description: "No data found",
          variant: "default",
        });
      }
    } catch (error) {
      setIsLoad(false);
      setValidationList([]);
      toast({
        title: "Error",
        description: "Failed to fetch validation data",
        variant: "destructive",
      });
    }
  };

  // It will change the UpdatedValue and UpdatedID for the selected column item.
  const labelChangeHandler = (e: any, item: ValidationItem) => {
    const { value, display, isNewOption } = e.target;
    const TempUniqueID = new Date().getTime();

    const tempArr = [...ValidationList];
    const index = tempArr.findIndex((x) => x.ID === item.ID);
    
    if (index !== -1) {
      tempArr[index].UpdatedValue = display;
      tempArr[index].UpdatedID = isNewOption ? TempUniqueID : value;
      tempArr[index].IsNewInsert = isNewOption;
      setValidationList(tempArr);
    }
  };

  // It will change the ParentType for only if the section is Product Name.
  const selectProductTypeHandler = (e: any, item: ValidationItem) => {
    const { value } = e.target;
    
    const tempArr = [...ValidationList];
    const index = tempArr.findIndex((x) => x.ID === item.ID);
    
    if (index !== -1) {
      tempArr[index].ParentType = Number(value);
      tempArr[index].UpdatedID = "";
      tempArr[index].UpdatedValue = "";
      setValidationList(tempArr);
    }
  };

  // It will save the data to the server.
  const saveValidationList = async (data: ValidationItem[]) => {
    try {
      // Process data like legacy code
      const processedData = data.map((item) => {
        const processedItem = { ...item };
        if (processedItem.UpdatedID === "") {
          processedItem.UpdatedID = "-100";
          processedItem.UpdatedValue = processedItem.CurrentValue;
        }
        return processedItem;
      });

      // Remove ID from first item as per legacy code
      if (processedData.length > 0) {
        delete processedData[0].ID;
      }

      const fieldID = preflightFileInfo.MappedFieldIDs?.find(
        (x) => x.FileColumnName === processedData[0]?.ColumnName
      )?.PreflightFieldID;

      const payload = {
        PreflightFileID: preflightFileInfo.PreflightFileID,
        JsonData: JSON.stringify(processedData),
        FieldID: fieldID,
        ActionType: masterListHeaderName.AliasName?.includes("Full Name (First Name Last Name)")
          ? "FullName Update"
          : "Update",
      };

      setIsLoad(true);
      
      const res = await preflightService.SavePreflightValidationList(payload);
      
      // Type guard for response
      const isValidResponse = (resp: unknown): resp is { content: { Status: string; ErrorMessage?: string } } => {
        return typeof resp === 'object' && 
               resp !== null && 
               'content' in resp &&
               typeof (resp as any).content === 'object' &&
               'Status' in (resp as any).content;
      };

      if (isValidResponse(res) && res.content.Status === "Success") {
        getImportLogs(preflightFileInfo.PreflightFileID);
        
        const tempArr = [...ValidationList];
        processedData.forEach((item) => {
          const index = tempArr.findIndex(
            (x) => x.CurrentValue === item.CurrentValue && x.ParentType === item.ParentType
          );
          if (index !== -1) {
            tempArr[index].IsMarked = true;
          }
        });
        
        setSuccessMode(true);
        setValidationList(tempArr);
      } else {
        const errorMessage = isValidResponse(res) && res.content.ErrorMessage
          ? res.content.ErrorMessage
          : "Unable to save the data, Please contact Admin.";
        
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (err) {
      console.log(err);
      toast({
        title: "Error",
        description: "Unable to save the data, Please contact Admin.",
        variant: "destructive",
      });
    } finally {
      setIsLoad(false);
    }
  };

  const onSubmitMasterListData = () => {
    saveValidationList(ValidationList);
    setConfirmShowPopup(false);
  };


  // It will render the elements for the masterlist with the data.
  const renderElements = () => {
    const ColumnName = masterListHeaderName.AliasName || masterListHeaderName.HeaderName;
    
    return (
      <div className="flex flex-col h-full">
        {/* Header Row with Info Icon */}
        <div className="grid grid-cols-2 gap-4 mb-3 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="text-center">
            <h3 className="font-semibold text-gray-900 text-xs uppercase tracking-wide">
              {ColumnName} Found in Your File
            </h3>
          </div>
          <div className="text-center relative">
            <h3 className="font-semibold text-gray-900 text-xs uppercase tracking-wide">
              Existing {ColumnName} from Your Site
            </h3>
            {/* Info Icon */}
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="absolute -top-1 -right-1 p-1 rounded-full hover:bg-gray-200 transition-colors"
              title="Click for instructions"
            >
              <svg className="w-3 h-3 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* Collapsible Instructions */}
        {showInstructions && (
          <div className="mb-3 p-2 bg-amber-50 border border-amber-200 rounded-md">
            <div className="flex items-start gap-2">
              <div className="text-amber-600 mt-0.5">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-xs leading-tight text-amber-800">
                <p className="font-medium mb-1">Important: Before starting the import:</p>
                <ul className="list-disc list-inside space-y-0 text-xs leading-tight">
                  <li>Make sure all critical validation issues are resolved</li>
                  <li>Review your data mapping selections below</li>
                  <li>You can leave items unselected to add them as new entries</li>
                  <li>Click <strong>"Fix Missing {ColumnName} Data"</strong> when ready</li>
                </ul>
              </div>
            </div>
          </div>
        )}
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto min-h-0 border border-gray-200 rounded-lg bg-white">
          <div className="divide-y divide-gray-100">
            {ValidationList.map((item, index) => (
              <div
                key={index}
                className={`grid grid-cols-2 gap-4 p-3 hover:bg-gray-50 transition-colors ${
                  item.IsMarked ? 'hidden' : ''
                }`}
              >
                {/* Left Column - File Data */}
                <div className="space-y-1">
                  <div className="font-medium text-gray-900 break-words text-sm" title={item.CurrentValue}>
                    {item.CurrentValue}
                    <span className="text-xs text-gray-600 ml-2">
                      {item.UpdatedValue ? (
                        <>
                          will be mapped to: <span className="font-medium text-blue-600">{item.UpdatedValue}</span>
                        </>
                      ) : (
                        <span className="text-green-600">will be added to your site.</span>
                      )}
                    </span>
                  </div>
                </div>
                
                {/* Right Column - Dropdowns */}
                <div className="space-y-2">
                  {/* Product Type Dropdown (only for product sections) */}
                  {isProductSection && productTypes.length > 0 && (
                    <div>
                      <select
                        className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={item.ParentType || ''}
                        onChange={(e) => {
                          const event = {
                            target: { value: e.target.value }
                          };
                          selectProductTypeHandler(event, item);
                        }}
                      >
                        <option value="">Select Product Type</option>
                        {productTypes.map((type) => (
                          <option key={type.Value} value={type.Value}>
                            {type.Display}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  {/* Main Selection Dropdown */}
                  <div>
                    <select
                      className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={item.UpdatedID || ''}
                      onChange={(e) => {
                        const selectedItem = isProductSection
                          ? masterData.filter(x => x.ParentType == item.ParentType).find(x => x.Value == e.target.value)
                          : masterData.find(x => x.Value == e.target.value);
                        
                        const event = {
                          target: {
                            value: e.target.value,
                            display: selectedItem?.Display || '',
                            isNewOption: false
                          }
                        };
                        labelChangeHandler(event, item);
                      }}
                    >
                      <option value="">Select {ColumnName}</option>
                      {(isProductSection
                        ? masterData.filter(x => x.ParentType == item.ParentType)
                        : masterData
                      ).map((masterItem, idx) => (
                        <option key={idx} value={masterItem.Value}>
                          {masterItem.Display}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex justify-center">
            <Button
              onClick={() => setConfirmShowPopup(true)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Fix Missing {ColumnName} Data
            </Button>
          </div>
        </div>
      </div>
    );
  };

  if (isLoad) {
    return <CustomSpinner />;
  }

  // Show success mode when all items are processed
  const unprocessedItems = ValidationList.filter(item => !item.IsMarked);
  if (successMode || (ValidationList.length > 0 && unprocessedItems.length === 0)) {
    return (
      <>
        {showSuccessAnimation(
          `${masterListHeaderName.AliasName || currentSection} is successfully validated, please proceed to ${
            sections.length > 1 ? "validate the next field" : "Finish"
          }`
        )}
        <div className="flex justify-center">
          <Button
            onClick={() => {
              if (sections.length > 1) {
                getSectionsData();
                setSuccessMode(false);
              } else {
                setMasterDropdownData((prev: any) => ({ ...prev, ShowSidePanel: false, shouldRefreshOnClose: false }));
              }
            }}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            {sections.length > 1 ? 'Validate the Next Field' : 'Finish'}
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      {ValidationList.some((item) => !item.IsMarked) ? (
        renderElements()
      ) : (
        <>
          {showSuccessAnimation(
            `${masterListHeaderName.AliasName || currentSection} is successfully validated, please proceed to ${
              sections.length > 1 ? "validate the next field" : "Finish"
            }`
          )}
          <div className="flex justify-center">
            <Button
              onClick={() => {
                getSectionsData();
                setSuccessMode(false);
              }}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Validate the Next Field
            </Button>
          </div>
        </>
      )}

      {confirmShowPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl w-[90vw] max-w-md mx-4 max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Are You Sure?</h3>
              <p className="text-sm text-gray-600 mt-1">Please review the items that will be processed:</p>
            </div>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
              <div className="space-y-3">
                {ValidationList.filter(item => !item.IsMarked).map((item, index) => (
                  <div key={index} className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                    <div className="font-medium text-sm text-gray-900 mb-1" title={item.CurrentValue}>
                      {item.CurrentValue}
                    </div>
                    <div className="text-xs text-gray-600">
                      {item.UpdatedValue ? (
                        <>
                          will be mapped to: <span className="font-medium text-blue-600">{item.UpdatedValue}</span>
                        </>
                      ) : (
                        <>
                          will be added as a new <span className="font-medium text-green-600">{masterListHeaderName.AliasName || masterListHeaderName.HeaderName}</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setConfirmShowPopup(false)}
                  className="px-4 py-2"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={onSubmitMasterListData}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Submit
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}




    </>
  );
} 