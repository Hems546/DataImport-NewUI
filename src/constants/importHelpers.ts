// Status and color constants
export const enumStatusColor = Object.freeze({
  "Not Started": "darkgray",
  "In Progress": "orange",
  Success: "green",
  Error: "red",
  Warning: "gold",
  "Verification Pending": "#AB5FA6",
});

// Export configuration
export const exportFileType = Object.freeze([
  { Display: "CSV", Value: "text/csv" },
  { Display: "XLS", Value: "xls" },
  { Display: "XLSX", Value: "xlsx" },
]);

export const exportType = Object.freeze([
  { Display: "Blank Template", Value: 1 },
  { Display: "Export 2 Records Template", Value: 2 },
  { Display: "Export 5 Records Template", Value: 5 },
]);

// Default state objects
export const defaultPreflightQuery = {
  PreflightFileID: 0,
  DocTypeID: 0,
  Name: "",
  FilePath: "",
  FileType: "",
  FileName: "",
  Status: "",
  CreatedBy: 0,
  MappedFieldIDs: "",
  FileInput: "",
  exportFileTypeValue: {
    Display: "CSV",
    Value: 1,
  },
  exportTypeValue: {
    Display: "Blank Template",
    Value: 1,
  },
};

export const defaultPagerData = {
  pageSize: 50,
  currentPageIndex: 1,
  currentPageTotal: 0,
  total: 0,
  isPageIndexChanged: false,
};

export const initialSortState = {
  Property: "",
  ColumnName: "",
  Direction: "ASC",
};

// Navigation and status mapping
export const pageRedirection = {
  "In Progress": "FieldMapping",
  Success: "importLogs",
  Error: "importLogs",
  Warning: "importLogs",
};

export const OrderOfPreflight = {
  "Not Started": "FileUpload",
  "In Progress": "FieldMapping",
  Error: "DataPreflight",
  Warning: "DataValidation",
  "Verification Pending": "DataVerification",
  Success: "Done",
};

// UI Configuration
export const fixedWidthColumns = [
  { accessor: "Name", width: 300 },
  { accessor: "EDIT", width: 30 },
  { accessor: "FileType", width: 90 },
  { accessor: "Action", width: 85 },
  { accessor: "CreatedByWithBubble", width: 130 },
  { accessor: "CreateDate", width: 130 },
  { accessor: "Category", width: 100 },
  { accessor: "DocTypeName", width: 130 },
  { accessor: "StatusWithColor", width: 200 },
];

export const nonResizableColumns = ["EDIT", "Action", "FileType", "CreatedByWithBubble"];

// Field exclusions
export const excludeFieldsArray = [
  {
    Name: "fullname",
    ExcludeFields: ["firstname", "lastname"],
  },
  {
    Name: "salesrepfullname",
    ExcludeFields: ["salesrepfirstname", "salesreplastname"],
  },
  {
    Name: "commissionedrepfullname",
    ExcludeFields: ["commissionedrepfirstname", "commissionedreplastname"],
  },
  {
    Name: "partnerrepfullname",
    ExcludeFields: ["partnerrepfirstname", "partnerreplastname"],
  },
];

// Media Kit Configuration
export const MediaKitType = [{ Display: "RateCard", Value: "RateCard" }];

export const getMediaKitDefaultObj = (date: string, userID: number, editDetails?: any) => {
  return {
    PreflightMediaFileID: editDetails?.PreflightMediaFileID ?? 0,
    Category: editDetails?.Category ?? "RateCard",
    Name: editDetails?.Name ?? `MediaKit_RateCard_${date}`,
    FileType: "application/pdf",
    FileName: editDetails?.FileName ?? "",
    FilePath: editDetails?.FilePath ?? "",
    Status: editDetails?.Status || "Not Started",
    CreatedBy: userID,
    FileInput: "",
  };
};

// Loading states
export const LoadingWaitTexts = {
  START: [
    "Extracting media kit file data, please wait...",
    "Starting data extraction from media kit...",
    "Please wait while we extract file data...",
    "Fetching file data from the media kit, stay tuned...",
  ],
  MID: [
    "Processing extracted data, it won't be long now...",
    "Analyzing media kit content, hang in there...",
    "Organizing extracted data, just a few more seconds...",
    "Compiling information from extracted data, stay patient...",
  ],
  END: [
    "Almost done processing the extracted data...",
    "Finalizing analysis of the extracted data...",
    "Wrapping up extraction process, almost there...",
  ],
};

// Step definitions
export const STEPS = [
  {
    id: 1,
    tab: "HowTo",
    title: "How To",
    subtitle: "Getting started",
    color: "#4B89DC",
    active: true,
  },
  {
    id: 2,
    tab: "FileUpload",
    title: "File Upload",
    subtitle: "Select your files",
    color: "#0587A2",
  },
  {
    id: 3,
    tab: "FieldMapping",
    title: "Mapping",
    subtitle: "Configure data fields",
    color: "#7209B7",
  },
  {
    id: 4,
    tab: "DataPreflight",
    title: "Preflight",
    subtitle: "Check data format",
    color: "#F72585",
  },
  {
    id: 5,
    tab: "DataValidation",
    title: "Validation",
    subtitle: "Check data",
    color: "#B86901",
  },
  {
    id: 6,
    tab: "DataVerification",
    title: "Verification",
    subtitle: "Verify data",
    color: "#4CC9F0",
  },
  {
    id: 7,
    tab: "Done",
    title: "Done",
    subtitle: "Process complete",
    color: "#5FAB60",
  },
];

export const SectionSteps = [
  "HowTo",
  "FileUpload",
  "FieldMapping",
  "DataPreflight",
  "DataValidation",
  "DataVerification",
  "Done",
];

// Utility functions
export const convertToCSV = (objArray: any[]): string => {
  const array = typeof objArray !== "object" ? JSON.parse(objArray) : objArray;
  let str = "";
  const headers = Object.keys(array[0]);

  // Enclose headers in double quotes
  str += headers.map((header) => `"${header}"`).join(",") + "\r\n";

  array.forEach((item) => {
    const line = headers
      .map((header) => {
        let cell = item[header] || ""; // Get the cell data

        // Escape double quotes by replacing them with two double quotes
        if (typeof cell === "string") {
          cell = cell.replace(/"/g, '""');
        }

        // Enclose cell data in double quotes
        return `"${cell}"`;
      })
      .join(",");
    str += line + "\r\n";
  });

  return str;
};

export const removeHtmlTags = (str: string): string => {
  return str.replace(/<\/?[^>]+(>|$)/g, "");
};

export const getCurrentSectionName = (name: string): string => {
  switch (name) {
    case "DataMapping":
      return "Data Mapping";
    case "FileUpload":
      return "File Upload";
    case "FieldMapping":
      return "Field Mapping";
    case "DataPreflight":
      return "Data Preflight";
    case "DataValidation":
      return "Data Validation";
    case "DataVerification":
      return "Data Verification";
    default:
      return "";
  }
};

// Instructions and documentation
export const mediakitInstructions = `<section>
  <h3>Instructions & Info</h3>
  <div>
    <p>
      The Media Kit AI Files page enables admins to upload their Media Kits and have the AI extract data points, formatting them into files ready for import.
    </p>
    <p>
      This will bring you to the Extract Files page where the Extraction name defaults to read 
      <strong>MediaKit_RateCard_Year-Month-Day Time</strong> can be edited using the pencil icon beside it.
    </p>
    <p>
      Beside the Extraction File Name are two labels: <strong>File Status</strong> and <strong>Extraction Type</strong>.
    </p>
    <p>
      The File Status indicates the current state of the extraction, which can be 
      <strong style="color: darkgray;">Not Started</strong>, 
      <strong style="color: orange;">In Progress</strong>, 
      <strong style="color: green;">Success</strong>, or 
      <strong style="color: red;">Error</strong>.
    </p>
    <p>
      The Extraction Type displays the type of Extraction.
    </p>
    <p>
      At the top-right of the page, you will see a <strong>Notify Data Team</strong> button and a <strong>History</strong> icon. 
    </p>
    <ul style="margin-left: 15px !important;">
      <li><strong>Notify Data Team:</strong> Clicking this will send an email to the data team, notifying them that an extraction file is ready for review.<br>
        <strong>NOTE:</strong> This button will be disabled if the imported file is in 
        <strong style="color: darkgray;">Not Started</strong> or 
        <strong style="color: red;">Error</strong> status.
      </li>
      <li><strong>History:</strong> This will open a side panel showing the representative, date, and timestamp for each action.</li>
    </ul>
     <p>
      Once the Media Kit file is extracted and displayed, the button text will automatically update to <strong>'Read Media Kit again'</strong>. This allows admins to re-read the Media Kit file and obtain the necessary details.
    </p>
  </div>
</section>`;

export const dataPreflightInstructions = `<section>
  <h3>How to Use This Tool</h3>
  <div>
    <h4 class="default-blue">1. File Upload</h4>
    <p>Select one of our sample data files or upload your own file. Supported data types include:</p>
    <ul>
      <li>Company & Contact Data</li>
      <li>Orders/Sales</li>
      <li>Mirabel Application Users & Sales Reps</li>
      <li>Contact/Company Notes</li>
      <li>Accounts Receivables - Open Invoices</li>
      <li>Subscriptions & Subscribers (for ChargeBrite)</li>
      <li>Rate Cards</li>
    </ul>

    <h4 class="default-blue">2. Mapping</h4>
    <p>Map your source data fields to the corresponding target fields in our system. This ensures your data is correctly interpreted. Use this section to align your data columns with the system's required fields. Utilize the toggles in the side panel to select the fields you want to import, and ensure all required fields are mapped correctly to avoid errors during the preflight process.</p>

    <h4 class="default-blue">3. Preflight</h4>
    <p>Once mapping is complete, the system will validate the data and display a summary in the <strong>Preflight</strong> section, including any successes or errors. Preflight validation includes:</p>
    <ul>
      <li>Email format validation</li>
      <li>Date format checking</li>
      <li>Required field validation</li>
      <li>Custom validation rules</li>
    </ul>

    <h4 class="default-blue">4. Validation</h4>
    <p>To address warnings and view the warning summary, click the <strong>Fix Data</strong> option in the <strong>Validation</strong> section.</p>

    <h4 class="default-blue">5. Verification</h4>
    <p>After the validation process is complete, the Verification section will be enabled if your import contains Full Name, Full Address, or Email fields. The following sections will be shown based on your imported fields:</p>
    <ul>
      <li>Full Name Split Section</li>
      <li>Full Address Split Section</li>
      <li>Email Verification Section</li>
    </ul>

    <h4 class="default-blue">6. Done</h4>
    <p>Once all process steps are completed:</p>
    <ul>
      <li>Review the final summary</li>
      <li>Download the processed data</li>
      <li>Click the Notify Data Team button when all data is processed successfully</li>
      <li>Generate reports by clicking the Preview icon and selecting <strong>Download W/ Changes</strong> button</li>
    </ul>

    <h4 class="default-blue">Additional Notes:</h4>
    <ul>
      <li><strong>Re-Check Data:</strong> Use this option to update or refresh the Preflight Data Summary.</li>
      <li><strong>File Status:</strong> The file status will update throughout the process and can be one of the following:
        <strong style="color: darkgray;">Not Started</strong>,
        <strong style="color: orange;">In Progress</strong>,
        <strong style="color: green;">Success</strong>,
        <strong style="color: gold;">Warning</strong>, or
        <strong style="color: red;">Error</strong>
      </li>
      <li><strong>Notify Data Team:</strong> After successful preflighting the data, a <strong>Notify Data Team</strong> button will be available to alert the team that the validated file is ready for review.</li>
      <li><strong>History:</strong> Click the History icon in the top-right corner to open a side panel showing the representative, date, and timestamp for all actions, including file uploads, data validation, and data summary rechecks.</li>
    </ul>
  </div>
</section>`;

// Info instructions
export const InfoInstructions = {
  DataValidation_Warning: "Please fix the warnings, using the \"Fix Data\" button, click \"Next\" to proceed",
  DataValidation_All: "To see the rows with warnings, click the \"Show data with warnings\" filter on the dropdown. Click on \"Fix Data\" button to fix warnings",
  DataPreflight_Error: "Please fix the errors and then click \"Next\" to proceed",
  DataPreflight_All: "To see the rows with errors, click the \"Show data with errors\" filter on the dropdown",
  DataVerification: " Please complete the below steps and click \"Next\" to complete the process",
  FileUpload: "Please select the import file type and upload the file.",
  FieldMapping: "Map the fields from your file to fields on your site by selecting the correct field from your site."
};

// Data grid preview titles
export const dataGridPreview = Object.freeze({
  DataPreflight: "Data Preflight Preview",
  DataValidation: "Data Validation Preview",
  DataVerification: "Data Verification Preview",
});

// Verification columns
export const verificationColumns = [
  "First Name_Verify",
  "Last Name_Verify",
  "Address Line 1_Verify",
  "Address Line 2_Verify",
  "City_Verify",
  "State/Region_Verify",
  "Zip Code_Verify",
];

// Address columns
export const addressColumns = [
  "Full Address",
  "Address Line 1",
  "Address Line 2",
  "City",
  "State/Region",
  "Zip Code",
]; 