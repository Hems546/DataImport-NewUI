// Status and color constants
export const enumStatusColor = Object.freeze({
  "Not Started": "darkgray",
  "In Progress": "orange",
  Success: "green",
  Error: "red",
  Warning: "gold",
  "Verification Pending": "#AB5FA6",
});

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

export const OrderOfPreflight = {
  "Not Started": "FileUpload",
  "In Progress": "FieldMapping",
  Error: "DataPreflight",
  Warning: "DataValidation",
  "Verification Pending": "DataVerification",
  Success: "ImportPush",
};

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