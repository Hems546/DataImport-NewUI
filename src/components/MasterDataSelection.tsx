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
  preflightFileID: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface MasterDataResponse {
  content: {
    Data: string;
    Status: string;
    ErrorMessage?: string;
  };
}

interface MasterDataItem {
  Value: string;
  Display: string;
  ParentType?: number;
}

interface ProductType {
  Value: number;
  Display: string;
}

export function MasterDataSelection({ preflightFileID, onClose, onSuccess }: MasterDataSelectionProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [masterListHeaderName, setMasterListHeaderName] = useState({
    HeaderName: "",
    AliasName: "",
    ParentTypeText: "",
  });
  const [validationList, setValidationList] = useState<any[]>([]);
  const [masterData, setMasterData] = useState<MasterDataItem[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [successMode, setSuccessMode] = useState(false);
  const [confirmShowPopup, setConfirmShowPopup] = useState(false);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);

  useEffect(() => {
    getProductTypes();
    getSectionsData();
  }, []);

  const getProductTypes = async () => {
    try {
      const res = await apiCall('/services/Admin/Masters/MasterData/58', 'GET');
      if (res?.content?.List) {
        const data = res.content.List.map((item: any) => ({
          Display: item.Display,
          Value: Number(item.Value),
        }));
        setProductTypes(data);
      }
    } catch (error) {
      console.error('Error fetching product types:', error);
    }
  };

  const getSectionsData = async () => {
    setIsLoading(true);
    try {
      const res = await apiCall(`/services/PreflightImports/MissingMasterColumns/${preflightFileID}`, 'GET');
      if (res?.content?.Data) {
        const data = JSON.parse(res.content.Data);
        setSections(data);
        if (data.length > 0) {
          fetchValidationListForSection(data[0].ColumnName, data[0].ParentType, data[0].AliasName);
          fetchDropdownData(data[0].ColumnName, data[0].ParentType, data[0].AliasName);
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch sections.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchValidationListForSection = async (sectionName: string, parentType: number, aliasName: string) => {
    setIsLoading(true);
    try {
      const res = await preflightService.getPreFlightValidationList({
        PreflightFileID: preflightFileID,
        ColumnName: sectionName,
        ParentType: parentType,
      });
      const data = typeof res === 'string' ? JSON.parse(res) : [];
      setValidationList(
        data.map((item: any) => ({
          ...item,
          SelectedValue: "",
          UpdatedValue: "",
          UpdatedID: "",
          IsMarked: false,
          IsNewInsert: true,
          ID: item.CurrentValue,
        }))
      );
      setMasterListHeaderName({
        HeaderName: sectionName,
        AliasName: aliasName,
        ParentTypeText: parentType !== -1 ? (productTypes.find(x => x.Value === parentType)?.Display || "") : "",
      });
    } catch (error) {
      setValidationList([]);
      toast({
        title: "Error",
        description: "Failed to fetch validation list.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDropdownData = async (sectionName: string, parentType: number, aliasName: string) => {
    try {
      const mappedField = JSON.parse(localStorage.getItem('columnMappings') || '[]')
        .find((mapping: any) => mapping.sourceColumn === sectionName);
      let actionType = aliasName?.includes("Full Name (First Name Last Name)") ? "FullName Update" : "Update";
      if (mappedField?.PreflightFieldID) {
        const dropdownRes = await preflightService.getDropDownDataByID(
          mappedField.PreflightFieldID,
          parentType,
          actionType
        ) as MasterDataResponse;
        if (dropdownRes?.content?.Data) {
          setMasterData(JSON.parse(dropdownRes.content.Data));
        }
      }
    } catch (error) {
      setMasterData([]);
    }
  };

  const handleDropdownChange = (index: number, value: string) => {
    const selectedOption = masterData.find(option => option.Value === value);
    setValidationList(prev => prev.map((item, i) => 
      i === index ? {
        ...item,
        UpdatedValue: selectedOption?.Display || "",
        UpdatedID: value,
        IsNewInsert: false
      } : item
    ));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      console.log('Starting save operation...');
      console.log('Current validation list:', validationList);
      
      // Process data exactly like legacy code
      const data = validationList.map(item => {
        const processedItem = { ...item };
        if (processedItem.UpdatedID === "") {
          processedItem.UpdatedID = "-100";
          processedItem.UpdatedValue = processedItem.CurrentValue;
        }
        return processedItem;
      });
      
      // Remove ID from first item as per legacy code
      if (data.length > 0) {
        delete data[0].ID;
      }
      
      console.log('Processed data:', data);
      
      const section = sections[currentSectionIndex];
      console.log('Current section:', section);
      
      const columnMappings = JSON.parse(localStorage.getItem('columnMappings') || '[]');
      console.log('Column mappings:', columnMappings);
      
      const mappedField = columnMappings.find((mapping: any) => mapping.sourceColumn === data[0]?.ColumnName);
      console.log('Found mapped field:', mappedField);
      
      if (!mappedField?.PreflightFieldID) {
        throw new Error(`No PreflightFieldID found for column: ${data[0]?.ColumnName}`);
      }
      
      const savePayload = {
        PreflightFileID: preflightFileID,
        JsonData: JSON.stringify(data),
        FieldID: mappedField.PreflightFieldID,
        ActionType: masterListHeaderName.AliasName?.includes("Full Name (First Name Last Name)") ? "FullName Update" : "Update",
      };
      
      console.log('Save payload:', savePayload);
      
      const response = await preflightService.SavePreflightValidationList(savePayload);
      console.log('Save response:', response);
      
      if (response && typeof response === 'object' && 'content' in response && (response.content as any)?.Status === "Success") {
        // Update validation list to mark items as processed
        let tempArr = [...validationList];
        data.forEach((item) => {
          let index = tempArr.findIndex(
            (x) => x.CurrentValue === item.CurrentValue && x.ParentType === item.ParentType
          );
          if (index !== -1) {
            tempArr[index].IsMarked = true;
          }
        });
        setValidationList(tempArr);
        setSuccessMode(true);
      } else {
        const errorMessage = response && typeof response === 'object' && 'content' in response 
          ? (response.content as any)?.ErrorMessage 
          : "Save operation failed";
        throw new Error(errorMessage || "Save operation failed");
      }
    } catch (error) {
      console.error('Save operation failed:', error);
      toast({
        title: "Error",
        description: `Failed to save master data: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setConfirmShowPopup(false);
    }
  };

  const renderElements = () => {
    const ColumnName = masterListHeaderName.AliasName || masterListHeaderName.HeaderName;
    return (
      <div className="masterlist-container h-full flex flex-col">
        <div className="mb-4 p-4 bg-gray-50 rounded-lg" style={{ lineHeight: "1.6", fontSize: "12px" }}>
          You have Company & Contact Data in your file that have a {ColumnName} that is not included in your new site's {ColumnName} dropdown. <br />
          If you would like to add these Company & Contact Data into the site with the {ColumnName} listed in your file you can do so by leaving the {ColumnName} field in your site unselected.
          If you would like to associate these Company & Contact Data with a new {ColumnName}, pick the correct one from the dropdown list. Once you have made all of your selections click the <b>"Fix Missing {ColumnName} Data"</b> button.
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="header-container flex gap-4 justify-center mb-4 p-2 bg-gray-100 rounded">
            <h3 className="flex-1 text-center font-semibold text-sm uppercase" title={`${ColumnName} Found in Your File`}>
              {ColumnName} Found in Your File
            </h3>
            <h3 className="flex-1 text-center font-semibold text-sm uppercase" title={`Existing ${ColumnName} from your Site`}>
              Existing {ColumnName} from your Site
            </h3>
          </div>
          
          <div className="options-container space-y-3 px-2">
            {validationList.map((item, index) => (
              <div key={index} className="options-container-row flex gap-4 p-3 border rounded-lg bg-white">
                <div className="options-left flex-1">
                  <div className="font-medium text-sm mb-1">
                    {item.CurrentValue}
                  </div>
                  {item.UpdatedValue ? (
                    <div className="text-xs text-gray-600">
                      will be mapped to: <b>{item.UpdatedValue}</b>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-600">
                      will be added to your site.
                    </div>
                  )}
                </div>
                <div className="options-right flex-1">
                  <Select
                    value={item.UpdatedID}
                    onValueChange={(value) => handleDropdownChange(index, value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={`Select ${ColumnName}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {masterData.map((option) => (
                        <SelectItem key={option.Value} value={option.Value}>
                          {option.Display}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        </div>

        {!successMode && (
          <div className="footer-masterlist mt-4 p-4 border-t">
            <Button 
              onClick={() => setConfirmShowPopup(true)}
              className="w-full" 
            >
              {`Fix Missing ${ColumnName} Data`}
            </Button>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return <Loading />;
  }

  if (successMode) {
    const isLastSection = currentSectionIndex >= sections.length - 1;
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <svg className="tick-success" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52" width="64" height="64">
          <circle className="tick-success-circle" cx="26" cy="26" r="25" fill="none" stroke="#10B981" strokeWidth="2" />
          <path className="tick-success-check" fill="none" stroke="#10B981" strokeWidth="3" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
        </svg>
        <div className="mt-4 text-lg font-semibold text-green-600 text-center">
          {`${masterListHeaderName.AliasName || masterListHeaderName.HeaderName} is successfully validated, please proceed to ${isLastSection ? 'finish' : 'validate the next field'}`}
        </div>
        <Button className="mt-4" onClick={() => {
          if (!isLastSection) {
            getSectionsData();
            setSuccessMode(false);
          } else {
            onClose();
            onSuccess();
          }
        }}>
          {isLastSection ? 'Finish' : 'Validate the Next Field'}
        </Button>
      </div>
    );
  }

  return (
    <>
      {renderElements()}
      {confirmShowPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Are You Sure?</h3>
            <div className="validation-confirmation-panel space-y-3 mb-4">
              {validationList.map((item, index) => (
                <div key={index} className="validation-confirmation-container p-3 border rounded">
                  <div className="font-medium text-sm mb-1">
                    {item.CurrentValue}
                  </div>
                  {item.UpdatedValue ? (
                    <div className="text-xs text-gray-600">
                      will be mapped to: <b>{item.UpdatedValue}</b>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-600">
                      will be added as a new <b>{masterListHeaderName.AliasName || masterListHeaderName.HeaderName}</b>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="validation-confirmation-buttons flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setConfirmShowPopup(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                Submit
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 