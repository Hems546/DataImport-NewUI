
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Book, Star } from 'lucide-react';

const AdminHelpCenter: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Help Center</CardTitle>
          <CardDescription>
            Find information about new features and get help with using the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="new-features" className="w-full">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="new-features">New Features</TabsTrigger>
              <TabsTrigger value="help-section">Help Section</TabsTrigger>
            </TabsList>
            
            <TabsContent value="new-features" className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-start gap-3 mb-6">
                <Star className="h-6 w-6 text-blue-600 shrink-0 mt-1" />
                <div>
                  <h3 className="font-medium text-blue-900">Latest Updates</h3>
                  <p className="text-blue-700 text-sm">
                    Check out our newest features and improvements below
                  </p>
                </div>
              </div>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="font-medium">
                    Page Instructions Management
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    <p className="mb-2">
                      The new Page Instructions Management feature allows you to create and edit instructions specific to different pages in your application. 
                    </p>
                    <p className="mb-2">
                      Instructions can be organized by page path, making it easier to manage guidance for complex applications with multiple screens.
                    </p>
                    <p className="font-medium mt-3">How to use:</p>
                    <ul className="list-disc pl-5 space-y-1 mt-1">
                      <li>Navigate to the "Page Instructions" tab in the Admin Dashboard</li>
                      <li>Add a new page path to create instructions for that specific page</li>
                      <li>Edit existing instructions by clicking the edit button</li>
                      <li>Instructions will automatically appear on their designated pages when instruction mode is enabled</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-2">
                  <AccordionTrigger className="font-medium">
                    Advanced Data Quality Analysis
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    <p className="mb-2">
                      Our data quality analysis tools now provide deeper insights into your data, including pattern recognition and anomaly detection.
                    </p>
                    <p className="font-medium mt-3">Key improvements:</p>
                    <ul className="list-disc pl-5 space-y-1 mt-1">
                      <li>Detailed statistical analysis of numerical columns</li>
                      <li>Pattern detection for text fields</li>
                      <li>Visualizations for data distributions</li>
                      <li>Automated suggestions for data cleaning</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-3">
                  <AccordionTrigger className="font-medium">
                    Help Center
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    <p>
                      The new Help Center (you're looking at it now!) provides centralized access to information about new features and helpful guides for using the system.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </TabsContent>
            
            <TabsContent value="help-section">
              <div className="bg-green-50 p-4 rounded-lg border border-green-100 flex items-start gap-3 mb-6">
                <Book className="h-6 w-6 text-green-600 shrink-0 mt-1" />
                <div>
                  <h3 className="font-medium text-green-900">Help & Documentation</h3>
                  <p className="text-green-700 text-sm">
                    Get answers to common questions and learn how to use the system more effectively
                  </p>
                </div>
              </div>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="help-1">
                  <AccordionTrigger className="font-medium">
                    How to manage instruction boxes
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    <p className="mb-3">To manage instruction boxes:</p>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>
                        <span className="font-medium">Enable Instruction Mode:</span> Toggle on the instruction mode in the Developer Instructions tab.
                      </li>
                      <li>
                        <span className="font-medium">Add Instructions:</span> Click the "+" button that appears in the bottom right corner of any page.
                      </li>
                      <li>
                        <span className="font-medium">Position Instructions:</span> Drag the instruction box to position it where needed.
                      </li>
                      <li>
                        <span className="font-medium">Edit Content:</span> Click the pencil icon to edit the text content.
                      </li>
                      <li>
                        <span className="font-medium">Save Changes:</span> Your changes are automatically saved.
                      </li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="help-2">
                  <AccordionTrigger className="font-medium">
                    Working with templates
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    <p className="mb-3">Templates help standardize data imports:</p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        <span className="font-medium">System Templates:</span> Pre-defined templates for common data structures.
                      </li>
                      <li>
                        <span className="font-medium">Custom Templates:</span> Create your own templates for specific data formats.
                      </li>
                      <li>
                        <span className="font-medium">Editing Templates:</span> Update field definitions, validation rules, and other template properties.
                      </li>
                      <li>
                        <span className="font-medium">Applying Templates:</span> Select a template during the import process to automatically map columns.
                      </li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="help-3">
                  <AccordionTrigger className="font-medium">
                    Setting up validations
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    <p className="mb-3">Validations ensure data quality and consistency:</p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        <span className="font-medium">Creating Validations:</span> Define rules for data fields in the Validations tab.
                      </li>
                      <li>
                        <span className="font-medium">Validation Types:</span> Pattern matching, range checking, required fields, and more.
                      </li>
                      <li>
                        <span className="font-medium">Error Handling:</span> Configure how validation errors are presented to users.
                      </li>
                      <li>
                        <span className="font-medium">Testing:</span> Validate your rules against sample data to ensure they work correctly.
                      </li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="help-4">
                  <AccordionTrigger className="font-medium">
                    Exporting instruction code
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    <p className="mb-3">Export instruction functionality to other projects:</p>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>Navigate to the Developer Instructions tab</li>
                      <li>Click "Export Code" button</li>
                      <li>The exported code bundle includes all necessary components and styles</li>
                      <li>Follow the README instructions in the exported bundle for integration steps</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminHelpCenter;
