import { apiCall } from '@/utils/apiCall';

export const API_PREFLIGHT_TYPE_DATA = `/services/Admin/Masters/MasterData/58`;
export const API_PREFLIGHT_FILES_SAVE = `/services/PreflightImports/File`;
export const API_PREFLIGHT_FILES_GET_ALL = "/services/PreflightImports/Files";
export const API_PREFLIGHT_IMPORT_GET_FIELD_MAPPING = "/services/PreflightImports/FieldsMapping";
export const API_PREFLIGHT_FIELDS_GET_ALL = "/services/PreflightImports/Fields";
export const API_PREFLIGHT_FIELDS_GET_SAMPLE = "/services/PreflightImports/SampleFields";
export const API_PREFLIGHT_FILE_DELETE = "/services/PreflightImports/File";
export const API_PREFLIGHT_IMPORT_GET_LOGS = "/services/PreflightImports/Logs";
export const API_PREFLIGHT_IMPORT_TEMP_TABLE_DELETE = "/services/PreflightImports/TempTable";
export const API_PREFLIGHT_IMPORT_FILE_DATA_UPDATE = "/services/PreflightImports/FileData";
export const API_PREFLIGHT_IMPORT_SEND_MAIL = "/services/PreflightImports/SendMail";
export const API_MEDIA_KIT_FILES_GET_ALL = "/services/MediaKit/Files";
export const API_PREFLIGHT_MEDIA_GET_DATA = "/services/MediaKit/Data";
export const API_MEDIA_KIT_FILE_DELETE = "/services/MediaKit/File";
export const API_PREFLIGHT_MEDIAKIT_SAVE_DATA = "/services/MediaKit/SaveData";
export const API_PREFLIGHT_MEDIAKITFILES_GET_FILESBASE64 = "/services/MediaKit/FilesBase64";
export const API_PREFLIGHT_GET_HISTORY = "/services/PreflightImports/History";
export const API_PREFLIGHT_SAVE_HISTORY = "/services/PreflightImports/SaveHistory";
export const API_PREFLIGHT_IMPORT_DATA_SUMMARY = "/services/PreflightImports/DataSummary";
export const API_PREFLIGHT_IMPORT_DATA_FIXES = "/services/PreflightImports/DataFixes";
export const API_PREFLIGHT_IMPORT_GET_DROPDOWNDATA_BY_ID = "/services/PreflightImports/DropdownDataByID";
export const API_PREFLIGHT_VALIDATION_LIST = "/services/PreflightImports/MissingMasterData";
export const API_PREFLIGHT_VALIDATION_LIST_SAVE = "/services/PreflightImports/ValidMasterData";
export const API_PREFLIGHT_VALIDATE_WARNINGS = "/services/PreflightImports/ValidateWarnings";
export const API_PREFLIGHT_DATA_VERIFICATION_OPTIONS = "/services/PreflightImports/DataVerificationOptions";
export const API_PREFLIGHT_DATA_VERIFICATION_UPDATE = "/services/PreflightImports/DataVerificationUpdate";
export const API_PREFLIGHT_DATA_SPLIT_ADDRESS = "/services/PreflightImports/SplitAddressIntoSubFields";
export const API_PREFLIGHT_IMPORT_FILE_MASTER_COLUMN_DATA_UPDATE = "/services/PreflightImports/MasterColumnDataUpdate";
export const API_ADMIN_SITESETTINGS_INITIATE_EMAILVERIFICATION = "/services/Admin/SiteSettings/InitiateEmailVerification";

export interface PreflightType {
  Value: number;
  Display: string;
  IsSelected: boolean;
}

export interface MappedFieldsResponse {
  content: {
    Status: string;
    Data: {
      MappedData: string;
      FieldsData: string;
    };
  };
}

export const preflightService = {
  getPreflightTypeData: () => {
    return new Promise<PreflightType[]>((resolve, reject) => {
      apiCall(`${API_PREFLIGHT_TYPE_DATA}`, "GET")
        .then((resp) => {
          if (resp.content.Status === "Success") {
            const result = resp.content.Data.PreflightDocType;
            resolve(result);
          } else {
            reject("Error: Not Success");
          }
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  },
  //this api call save the preflight file
  saveFile: (data) => {
    return new Promise((resolve, reject) => {
      apiCall(`${API_PREFLIGHT_FILES_SAVE}`, "POST", data)
        .then((resp) => {
          resolve(resp);
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  },
  //this api call get all the preflight file
  getAllPreflightFiles: (
    StartIndex,
    SortFilter = "[UpdateDate] DESC",
    Filter = "All",
    SearchValue = ""
  ) => {
    let data = {
      StartIndex: StartIndex,
      SortFilter: SortFilter,
      Filter: Filter,
      SearchValue: SearchValue,
    };
    return new Promise((resolve, reject) => {
      apiCall(`${API_PREFLIGHT_FILES_GET_ALL}`, "POST", data)
        .then((resp) => {
          if (resp?.content?.Status === "Success") {
            let result = resp.content.Data;
            resolve(result);
          } else {
            reject("Error: Not Success");
          }
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  }, 
  //this api call get mapped fields for a preflight file
  getMappedFields: (preflightFileID: number) => {
    return new Promise<MappedFieldsResponse>((resolve, reject) => {
      apiCall(`${API_PREFLIGHT_IMPORT_GET_FIELD_MAPPING}/${preflightFileID}`, "GET")
        .then((resp) => {
          if (resp?.content?.Status === "Success") {
            resolve(resp);
          } else {
            reject("Error: Not Success");
          }
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  },
  getAllPreflightImportFields: (DocTypeID) => {
    return new Promise((resolve, reject) => {
      apiCall(`${API_PREFLIGHT_FIELDS_GET_ALL}/${DocTypeID}`, "GET")
        .then((resp) => {
          if (resp.content.Status === "Success") {
            let result = resp.content.List;
            resolve(result);
          } else {
            reject("Error: Not Success");
          }
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  },
  getAllPreflightImportSampleFields: (DocTypeID, Count, MappedFieldIDs) => {
    return new Promise((resolve, reject) => {
      apiCall(`${API_PREFLIGHT_FIELDS_GET_SAMPLE}/${DocTypeID}/${Count}/${MappedFieldIDs}`, "GET")
        .then((resp) => {
          if (resp.content.Status === "Success") {
            let result = resp.content.Data;
            resolve(result);
          } else {
            reject("Error: Not Success");
          }
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  },
  deletePreflightFile: (id, getRecordsAfterDelete, startIndex = 0, sortFilter = "[UpdateDate] DESC", filter = "All", searchValue = "") => {
    let options = {
      StartIndex: startIndex,
      SortFilter: sortFilter,
      Filter: filter,
      SearchValue: searchValue,
    };
    return new Promise((resolve, reject) => {
      apiCall(`${API_PREFLIGHT_FILE_DELETE}/${id}/${getRecordsAfterDelete}`, "DELETE", options)
        .then((resp) => {
          resolve(resp);
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  },
  getPreflightImportLogs: (preFlightFileID, startIndex, pageSize, isExcludeSystemColumns = false, action = "", filter = "All", preflightType) => {
    let obj = {
      PreflightFileID: preFlightFileID,
      StartIndex: startIndex,
      PageSize: pageSize,
      Filter: filter,
      IsExcludeSystemColumns: isExcludeSystemColumns,
      PreflightType: preflightType,
      Action: action
    };
    return new Promise((resolve, reject) => {
      apiCall(`${API_PREFLIGHT_IMPORT_GET_LOGS}`, "POST", obj)
        .then((resp) => {
          resolve(resp);
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  },
  deleteTempTable: (PreflightFileID) => {
    return new Promise((resolve, reject) => {
      apiCall(`${API_PREFLIGHT_IMPORT_TEMP_TABLE_DELETE}/${PreflightFileID}`, "DELETE")
        .then((resp) => {
          resolve(resp);
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  },
  updateFileData: (data) => {
    return new Promise((resolve, reject) => {
      apiCall(`${API_PREFLIGHT_IMPORT_FILE_DATA_UPDATE}`, "POST", data)
        .then((resp) => {
          resolve(resp);
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  },
  sendMail: (PreflightFileID, Type) => {
    return new Promise((resolve, reject) => {
      apiCall(`${API_PREFLIGHT_IMPORT_SEND_MAIL}/${PreflightFileID}/${Type}`, "POST", "")
        .then((resp) => {
          resolve(resp);
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  },
  preflightImportFixes: (obj) => {
    return new Promise((resolve, reject) => {
      apiCall(`${API_PREFLIGHT_IMPORT_DATA_FIXES}`, "POST", obj)
        .then((resp) => {
          resolve(resp);
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  },
  getFilesBase64: (data) => {
    return new Promise((resolve, reject) => {
      apiCall(`${API_PREFLIGHT_MEDIAKITFILES_GET_FILESBASE64}`, "POST", data)
        .then((resp) => {
          resolve(resp);
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  },
  getAllMediaKitFiles: (StartIndex, SortFilter = "[UpdatedDate] DESC", Filter = "All", SearchValue = "") => {
    let data = {
      StartIndex: StartIndex,
      SortFilter: SortFilter,
      Filter: Filter,
      SearchValue: SearchValue,
    };
    return new Promise((resolve, reject) => {
      apiCall(`${API_MEDIA_KIT_FILES_GET_ALL}`, "POST", data)
        .then((resp) => {
          if (resp?.content?.Status === "Success") {
            let result = resp.content.Data;
            resolve(result);
          } else {
            reject("Error: Not Success");
          }
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  },
  deleteMediaKitFile: (id, deleteRow, pageIndex = 0) => {
    return new Promise((resolve, reject) => {
      apiCall(`${API_MEDIA_KIT_FILE_DELETE}/${id}/${deleteRow}/${pageIndex}`, "DELETE")
        .then((resp) => {
          resolve(resp);
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  },
  getMediaKitImportedData: (ID) => {
    return new Promise((resolve, reject) => {
      apiCall(`${API_PREFLIGHT_MEDIA_GET_DATA}/PreflightMediaFileID/${ID}`, "GET")
        .then((resp) => {
          resolve(resp);
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  },
  saveMediaKitResponse: (data) => {
    return new Promise((resolve, reject) => {
      apiCall(`${API_PREFLIGHT_MEDIAKIT_SAVE_DATA}`, "POST", data)
        .then((resp) => {
          resolve(resp);
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  },
  getHistory: (id, action) => {
    return new Promise((resolve, reject) => {
      apiCall(`${API_PREFLIGHT_GET_HISTORY}/${id}/${action}`, "GET")
        .then((resp) => {
          resolve(resp);
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  },
  saveHistory: (payload) => {
    return new Promise((resolve, reject) => {
      apiCall(`${API_PREFLIGHT_SAVE_HISTORY}`, "POST", payload)
        .then((resp) => {
          resolve(resp);
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  },
  CheckPrefligtDataSummaryService: (PreflightFileID, IsRecheckData, SummaryTpye) => {
    return new Promise((resolve, reject) => {
      apiCall(`${API_PREFLIGHT_IMPORT_DATA_SUMMARY}/${PreflightFileID}/${IsRecheckData}/${SummaryTpye}`, "POST", "")
        .then((resp) => {
          resolve(resp);
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  },
  getDropDownDataByID: (PreflightFieldIDs, ParentType = -1, ActionType = "Update") => {
    return new Promise((resolve, reject) => {
      apiCall(`${API_PREFLIGHT_IMPORT_GET_DROPDOWNDATA_BY_ID}/${PreflightFieldIDs}/${ParentType}/${ActionType}`, "GET")
        .then((resp) => {
          resolve(resp);
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  },
  getPreFlightValidationList: (payload) => {
    return new Promise((resolve, reject) => {
      apiCall(`${API_PREFLIGHT_VALIDATION_LIST}`, "POST", payload)
        .then((resp) => {
          if (resp.content.Status === "Success") {
            let result = resp?.content?.Data;
            resolve(result);
          } else {
            reject("Error: Not Success");
          }
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  },
  SavePreflightValidationList: (payload) => {
    return new Promise((resolve, reject) => {
      apiCall(`${API_PREFLIGHT_VALIDATION_LIST_SAVE}`, "POST", payload)
        .then((resp) => {
          if (resp?.content?.Status === "Success") {
            resolve(resp);
          } else {
            reject("Error: Not Success");
          }
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  },
  validateWarnings: (preflightFileInfo) => {
    return new Promise((resolve, reject) => {
      apiCall(`${API_PREFLIGHT_VALIDATE_WARNINGS}`, "POST", preflightFileInfo)
        .then((resp) => {
          resolve(resp);
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  },
  getDataVerificationOptions: (preflightFileID) => {
    return new Promise((resolve, reject) => {
      apiCall(`${API_PREFLIGHT_DATA_VERIFICATION_OPTIONS}/${preflightFileID}`, "GET")
        .then((resp) => {
          resolve(resp);
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  },
  preflightDataVerificationUpdate: (preflightFileID, actionType) => {
    return new Promise((resolve, reject) => {
      apiCall(`${API_PREFLIGHT_DATA_VERIFICATION_UPDATE}/${preflightFileID}/${actionType}`, "POST", "")
        .then((resp) => {
          resolve(resp);
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  },
  splitAddressIntoSubFields: (preflightFileID) => {
    return new Promise((resolve, reject) => {
      apiCall(`${API_PREFLIGHT_DATA_SPLIT_ADDRESS}/${preflightFileID}`, "POST", "")
        .then((resp) => {
          resolve(resp);
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  },
  updateMasterColumnData: (data) => {
    return new Promise((resolve, reject) => {
      apiCall(`${API_PREFLIGHT_IMPORT_FILE_MASTER_COLUMN_DATA_UPDATE}`, "POST", data)
        .then((resp) => {
          resolve(resp);
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  },
  getMissingMasterColumns: (preflightFileID) => {
    console.log('Calling getMissingMasterColumns with ID:', preflightFileID);
    return new Promise((resolve, reject) => {
      apiCall(`/services/PreflightImports/MissingMasterColumns/${preflightFileID}`, "GET")
        .then((resp) => {
          console.log('getMissingMasterColumns response:', resp);
          resolve(resp);
        })
        .catch((error) => {
          console.error('getMissingMasterColumns error:', error);
          reject(error);
        });
    });
  },
  InitiateEmailVerification: (PrevEmailSetting, PresentEmailSetting, IsOnlyVerification) => {
    return new Promise((resolve, reject) => {
      apiCall(`${API_ADMIN_SITESETTINGS_INITIATE_EMAILVERIFICATION}`, "POST", {
        PrevEmailSetting,
        PresentEmailSetting,
        IsOnlyVerification
      })
        .then((resp) => {
          resolve(resp);
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  },
};