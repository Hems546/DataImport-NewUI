import { FileBox, FileCheck, Database, Rows, Waypoints, Upload, ClipboardCheck, ArrowUpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { validations, ValidationCategory } from "@/constants/validations";
import { useState } from "react";
import { EditValidationDialog } from "./EditValidationDialog";
import { useToast } from "@/components/ui/use-toast";

export function ValidationManager() {
  const { toast } = useToast();
  const [localValidations, setLocalValidations] = useState(validations);

  const tabs = [
    { id: "file-upload", label: "File Upload", icon: Upload },
    { id: "verify-file", label: "File Preflighting", icon: FileCheck },
    { id: "column-mapping", label: "Column Mapping", icon: Rows },
    { id: "data-quality", label: "Data Quality", icon: Database },
    { id: "data-normalization", label: "Data Normalization", icon: Waypoints },
    { id: "deduplication", label: "Deduplication", icon: FileBox },
    { id: "final-review", label: "Final Review & Approval", icon: ClipboardCheck },
    { id: "import-push", label: "Import / Push to Target System", icon: ArrowUpCircle }
  ];

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const handleUpdateValidation = (updatedValidation: any) => {
    setLocalValidations(prev => 
      prev.map(v => v.id === updatedValidation.id ? updatedValidation : v)
    );
    
    toast({
      title: "Validation Updated",
      description: `${updatedValidation.name} has been moved to ${updatedValidation.category}`,
    });
  };

  const renderValidationItem = (validation: any) => (
    <AccordionItem value={validation.id} key={validation.id} className="border rounded-lg mb-4 bg-white">
      <AccordionTrigger className="px-4 hover:no-underline">
        <div className="flex items-center gap-4 w-full">
          <div className="grid place-items-center w-8 h-8">
            <svg className="w-6 h-6 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 6H20M9 12H20M9 18H20M5 6V6.01M5 12V12.01M5 18V18.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold">{validation.name}</h3>
              <EditValidationDialog 
                validation={validation}
                onSave={handleUpdateValidation}
              />
            </div>
            <p className="text-sm text-gray-500">{validation.description}</p>
          </div>
          <div className="flex gap-2">
            {validation.severity && (
              <Badge variant={getSeverityColor(validation.severity)} className="rounded-full">
                {validation.severity}
              </Badge>
            )}
            {validation.type && (
              <Badge variant="secondary" className="rounded-full">
                {validation.type}
              </Badge>
            )}
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <div className="pl-16">
          <h4 className="font-medium mb-2">Validation Details</h4>
          <ul className="list-disc pl-5 text-sm text-gray-600">
            <li>Category: {validation.category}</li>
            <li>Type: {validation.type || 'Not specified'}</li>
            <li>Severity: {validation.severity || 'Not specified'}</li>
            {validation.failAction && (
              <li>Fail Action: {validation.failAction}</li>
            )}
          </ul>
          {validation.category === ValidationCategory.VERIFY_FILE && (
            <p className="mt-3 text-sm text-amber-700 bg-amber-50 p-2 rounded-md">
              <strong>Note:</strong> File preflight checks must pass before proceeding. If these validations fail, 
              users will need to re-upload a corrected file.
            </p>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Validation Checks Manager</h2>
        <p className="text-gray-600 max-w-3xl mx-auto">
          Configure and manage validation checks for different stages of the import process.
        </p>
      </div>

      <Tabs defaultValue="file-upload" className="w-full">
        <TabsList className="w-full bg-gray-50 p-1 h-auto flex-wrap">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex items-center gap-2 py-2 px-4 data-[state=active]:bg-white"
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-xl font-bold">{tab.label} Validation Checks</h3>
                {tab.id === "verify-file" && (
                  <p className="text-sm text-gray-600 mt-2">
                    Structural checks to determine if the file can be processed at all. 
                    Failures here require the user to upload a fixed file.
                  </p>
                )}
                {tab.id === "file-upload" && (
                  <p className="text-sm text-gray-600 mt-2">
                    Initial checks performed when a file is uploaded (file type, size, format recognition).
                  </p>
                )}
                {tab.id === "column-mapping" && (
                  <p className="text-sm text-gray-600 mt-2">
                    These checks verify that the imported data can be correctly mapped to expected fields.
                    The system auto-maps columns and users can manually adjust if needed.
                  </p>
                )}
                {tab.id === "data-quality" && (
                  <p className="text-sm text-gray-600 mt-2">
                    Row-by-row and field-by-field validation of the actual data content. Checks data formats,
                    required fields, value ranges, and identifies duplicates. Users can fix issues directly
                    in a spreadsheet-like interface.
                  </p>
                )}
                {tab.id === "data-normalization" && (
                  <p className="text-sm text-gray-600 mt-2">
                    Automated cleanups and data standardization tasks. Includes trimming whitespace, 
                    converting dates to standard formats, and normalizing common variations 
                    (e.g., "USA" vs "U.S." vs "United States") to ensure data consistency.
                  </p>
                )}
                {tab.id === "deduplication" && (
                  <p className="text-sm text-gray-600 mt-2">
                    Identifies and manages duplicate records using configurable matching rules. 
                    Can check against both the current upload and existing database records. 
                    Supports manual review or automatic handling based on defined rules.
                  </p>
                )}
                {tab.id === "final-review" && (
                  <p className="text-sm text-gray-600 mt-2">
                    Final review of all data corrections, including auto-fixed issues, manual corrections,
                    and overview of any ignored or missing data. Users must approve the final dataset
                    before import completion.
                  </p>
                )}
                {tab.id === "import-push" && (
                  <p className="text-sm text-gray-600 mt-2">
                    Final stage validations for pushing cleaned, validated, and deduplicated data 
                    to the target system (database, CRM, ERP, etc).
                  </p>
                )}
              </div>
              <Button variant="outline">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Add Check
              </Button>
            </div>
            <Accordion type="single" collapsible>
              {localValidations
                .filter(validation => validation.category === tab.id)
                .map(renderValidationItem)}
            </Accordion>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
