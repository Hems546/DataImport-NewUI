import { apiCall } from '@/utils/apiCall';

export const API_PREFLIGHT_TYPE_DATA = `/services/Admin/Masters/MasterData/58`;
export const API_PREFLIGHT_FILES_SAVE = `/services/PreflightImports/File`;

export interface PreflightType {
  Value: number;
  Display: string;
  IsSelected: boolean;
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
    }

}; 