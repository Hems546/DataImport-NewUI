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
  //let baseURL = process.env.VITE_API_BASE_URL || "http://localhost:3000";
  //const domain = process.env.VITE_DOMAIN || "localhost";
  //const token = localStorage.getItem("token") || "";
  let baseURL = "https://tier1-feature7.magazinemanager.com/";
  const domain = "tier1-feature7";
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJMb2dnZWRJblVzZXJJRCI6IjEiLCJMb2dnZWRJblNpdGVDbGllbnRJRCI6Ijk5NTkiLCJMb2dnZWRJblNpdGVDdWx0dXJlVUkiOiJlbi1VUyIsIkRhdGVUaW1lIjoiNS8yMy8yMDI1IDg6MDY6NTcgQU0iLCJMb2dnZWRJblNpdGVDdXJyZW5jeVN5bWJvbCI6IiIsIkxvZ2dlZEluU2l0ZURhdGVGb3JtYXQiOiIiLCJEb21haW4iOiJ0aWVyMS1mZWF0dXJlMTIiLCJMb2dnZWRJblNpdGVUaW1lQWRkIjpbIjAiLCIwIl0sIlNvdXJjZSI6IlRNTSIsIkVtYWlsIjoic2FAbWFnYXppbmVtYW5hZ2VyLmNvbSIsIklzQVBJVXNlciI6IkZhbHNlIiwibmJmIjoxNzQ3OTg3NjE3LCJleHAiOjE3NDgwMDIwMTcsImlhdCI6MTc0Nzk4NzYxNywiaXNzIjoiTWFnYXppbmVNYW5hZ2VyIiwiYXVkIjoiKiJ9.f39t6pZjjtNEmeXT-qfTITzHssvpNOtRQFpLI2t6dlU";

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
        // Handle unauthorized access
        localStorage.removeItem("token");
        window.location.href = "/login";
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