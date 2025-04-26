import { FileBox, FileCheck, Database, Rows, Waypoints } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { validations, ValidationCategory } from "@/constants/validations";

export function ValidationManager() {
  const tabs = [
    { id: "file-preflight", label: "File Preflighting", icon: FileCheck },
    { id: "column-mapping", label: "Column Mapping", icon: Rows },
    { id: "data-quality", label: "Data Quality", icon: Database },
    { id: "data-corrections", label: "Data Corrections", icon: Waypoints },
    { id: "deduplication", label: "Deduping", icon: FileBox }
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
            <h3 className="text-base font-semibold">{validation.name}</h3>
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
          </ul>
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

      <Tabs defaultValue="file-preflight" className="w-full">
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
              <h3 className="text-xl font-bold">{tab.label} Validation Checks</h3>
              <Button variant="outline">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Add Check
              </Button>
            </div>
            <Accordion type="single" collapsible>
              {validations
                .filter(validation => {
                  switch(tab.id) {
                    case 'file-preflight':
                      return validation.category === ValidationCategory.FILE_PREFLIGHT;
                    case 'column-mapping':
                      return validation.category === ValidationCategory.COLUMN_MAPPING;
                    case 'data-quality':
                      return validation.category === ValidationCategory.DATA_QUALITY;
                    case 'data-corrections':
                      return validation.category === ValidationCategory.DATA_TRANSFORMATION;
                    case 'deduplication':
                      return validation.category === ValidationCategory.DEDUPLICATION;
                    default:
                      return false;
                  }
                })
                .map(renderValidationItem)}
            </Accordion>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
