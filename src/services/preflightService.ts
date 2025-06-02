import { apiCall } from '@/utils/apiCall';

export const API_PREFLIGHT_TYPE_DATA = `/services/Admin/Masters/MasterData/58`;
export const API_PREFLIGHT_FILES_SAVE = `/services/PreflightImports/File`;
export const API_PREFLIGHT_FILES_GET_ALL = "/services/PreflightImports/Files";
export const API_PREFLIGHT_IMPORT_GET_FIELD_MAPPING = "/services/PreflightImports/FieldsMapping";

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
  }
}; 