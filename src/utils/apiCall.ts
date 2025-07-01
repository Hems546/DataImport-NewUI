export const apiCall = async (
  endpoint: string,
  method: string = "GET",
  data: any = {},
  headers: Record<string, string> = {},
  cache: RequestCache = "no-cache",
  mode: RequestMode = "cors",
  options: RequestInit = {},
  apiOptions: any = false,
  dynamicBaseURL?: string
) => {
    let token = "";
    let domain = "";
    let baseURL = "";

    // Get MMClientVars from localStorage
    const mmClientVars = localStorage.getItem("MMClientVars");
    const clientData = mmClientVars ? JSON.parse(mmClientVars) : null;

    if (import.meta.env.MODE === "development") {
        // Development environment
        domain = "localhost";
        baseURL = "http://localhost";
        //baseURL = `https://tier1-feature12.magazinemanager.com/`;
        //domain = "tier1-feature12";  // Just the subdomain part
        token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJMb2dnZWRJblVzZXJJRCI6IjEiLCJMb2dnZWRJblNpdGVDbGllbnRJRCI6Ijk5MjAiLCJMb2dnZWRJblNpdGVDdWx0dXJlVUkiOiJlbi11cyIsIkRhdGVUaW1lIjoiMzAtMDYtMjAyNSAwOTozNjoxNSIsIkxvZ2dlZEluU2l0ZUN1cnJlbmN5U3ltYm9sIjoiIiwiTG9nZ2VkSW5TaXRlRGF0ZUZvcm1hdCI6IiIsIkRvbWFpbiI6ImxvY2FsaG9zdCIsIkxvZ2dlZEluU2l0ZVRpbWVBZGQiOlsiMCIsIjAiXSwiU291cmNlIjoiVE1NIiwiRW1haWwiOiJzYUBtYWdhemluZW1hbmFnZXIuY29tIiwiSXNBUElVc2VyIjoiRmFsc2UiLCJuYmYiOjE3NTEyNzYxNzUsImV4cCI6MTc1NDI3NjE3NSwiaWF0IjoxNzUxMjc2MTc1LCJpc3MiOiJNYWdhemluZU1hbmFnZXIiLCJhdWQiOiIqIn0.Ge_2nnq8N0MF_a0iHtrFmE4X9fe-NIB3zl01uI5_mI8";
        console.log("configCheck_Dev", baseURL, domain);
    
      } else {
        // Production or other environments
        const envBaseUrl = import.meta.env.BASE_URL;
        
        if (envBaseUrl) {
          // Use environment variable if available
          baseURL = `${window.location.origin}`;
          domain = window.location.hostname.split('.')[0];  // Get just the subdomain part
        } 
        console.log("configCheck", baseURL, domain);
        
        // Get token from localStorage
        token = clientData?.Token || "";
      }
  //let baseURL = process.env.VITE_API_BASE_URL || "http://localhost:8088";
  //const domain = process.env.VITE_DOMAIN || "localhost";
  //const token = getSessionValue("token") || "";
  //let baseURL = "https://tier1-feature12.magazinemanager.com/";
  //const domain = "tier1-feature12";
  //const domain = "localhost";
  //let baseURL = "http://localhost";
  //const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJMb2dnZWRJblVzZXJJRCI6IjEiLCJMb2dnZWRJblNpdGVDbGllbnRJRCI6Ijk5MjAiLCJMb2dnZWRJblNpdGVDdWx0dXJlVUkiOiJlbi11cyIsIkRhdGVUaW1lIjoiMjgtMDUtMjAyNSAwOToyMzo1MyIsIkxvZ2dlZEluU2l0ZUN1cnJlbmN5U3ltYm9sIjoiIiwiTG9nZ2VkSW5TaXRlRGF0ZUZvcm1hdCI6IiIsIkRvbWFpbiI6ImxvY2FsaG9zdCIsIkxvZ2dlZEluU2l0ZVRpbWVBZGQiOlsiMCIsIjAiXSwiU291cmNlIjoiVE1NIiwiRW1haWwiOiJzYUBtYWdhemluZW1hbmFnZXIuY29tIiwiSXNBUElVc2VyIjoiRmFsc2UiLCJuYmYiOjE3NDg0MjQyMzMsImV4cCI6MTc0ODQ0MjIzMywiaWF0IjoxNzQ4NDI0MjMzLCJpc3MiOiJNYWdhemluZU1hbmFnZXIiLCJhdWQiOiIqIn0.vsDa3vwh7H2Out6Rdm-wuEHRK3mZOcvHkunZE2eh0MM";

  const fullUrl = (dynamicBaseURL ? dynamicBaseURL : baseURL) + endpoint;
  const _headers = new Headers({
    Accept: "application/json",
    "Content-Type": "application/json",
    domain,
    Authorization: `Bearer ${token}`,
    ...headers
  });

  const requestOptions: RequestInit = {
    method,
    mode,
    cache,
    headers: _headers,
    ...options
  };

  if (method !== "GET") {
    requestOptions.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(fullUrl, requestOptions);
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized access");
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("API call error:", error);
    throw error;
  }
}; 