
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Book, Star, CalendarDays, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

// Define feature interface for type safety
interface Feature {
  id: string;
  title: string;
  content: React.ReactNode;
  dateAdded: string;
  formattedDate: string; // For display
}

// Helper function to format date for features
const formatFeatureDate = (date: string): string => {
  return format(new Date(date), 'MMMM d, yyyy');
};

const AdminHelpCenter: React.FC = () => {
  const { toast } = useToast();
  // Updated features data with comprehensive system features
  const [features, setFeatures] = useState<Feature[]>([
    {
      id: 'item-1',
      title: 'Combined Instructions Management',
      dateAdded: '2025-05-13',
      formattedDate: formatFeatureDate('2025-05-13'),
      content: (
        <>
          <p className="mb-2">
            The Instructions Management has been consolidated into a single, powerful tab that combines both developer instructions and page-specific instructions.
          </p>
          <p className="mb-2">
            This unified interface allows administrators to manage all guidance in one place, with clear separation between global and page-specific instructions.
          </p>
          <p className="font-medium mt-3">Key improvements:</p>
          <ul className="list-disc pl-5 space-y-1 mt-1">
            <li>Tabbed interface for better organization of instructions</li>
            <li>Global toggle for instruction visibility</li>
            <li>Page-specific instruction management</li>
            <li>Streamlined workflow for creating and editing instructions</li>
          </ul>
        </>
      )
    },
    {
      id: 'item-2',
      title: 'Import Type Management',
      dateAdded: '2025-05-10',
      formattedDate: formatFeatureDate('2025-05-10'),
      content: (
        <>
          <p className="mb-2">
            The new Import Type Management system allows administrators to control which import methods are available to users.
          </p>
          <p className="font-medium mt-3">Features include:</p>
          <ul className="list-disc pl-5 space-y-1 mt-1">
            <li>Enable/disable specific import types</li>
            <li>Configure import type properties and behavior</li>
            <li>Set default import types for different user roles</li>
            <li>Visual interface for managing import workflows</li>
          </ul>
        </>
      )
    },
    {
      id: 'item-3',
      title: 'Advanced File Indexing',
      dateAdded: '2025-05-05',
      formattedDate: formatFeatureDate('2025-05-05'),
      content: (
        <>
          <p className="mb-2">
            Our new file indexing system creates searchable indexes of uploaded files, making data retrieval faster and more efficient.
          </p>
          <p className="font-medium mt-3">Key capabilities:</p>
          <ul className="list-disc pl-5 space-y-1 mt-1">
            <li>Automated indexing of uploaded files</li>
            <li>Full-text search across all indexed content</li>
            <li>Manual re-indexing triggers for updated files</li>
            <li>Indexing status monitoring and logs</li>
            <li>Configurable indexing rules and priorities</li>
          </ul>
        </>
      )
    },
    {
      id: 'item-4',
      title: 'Template Management System',
      dateAdded: '2025-04-20',
      formattedDate: formatFeatureDate('2025-04-20'),
      content: (
        <>
          <p className="mb-2">
            The Template Management System allows administrators to create and edit field mapping templates for faster data imports.
          </p>
          <p className="font-medium mt-3">System features:</p>
          <ul className="list-disc pl-5 space-y-1 mt-1">
            <li>System-defined and user-defined templates</li>
            <li>Template editor with field configuration</li>
            <li>Field validation rules integrated into templates</li>
            <li>Template versioning and history</li>
            <li>Reusable templates across different import types</li>
          </ul>
        </>
      )
    },
    {
      id: 'item-5',
      title: 'Validation Rule Management',
      dateAdded: '2025-04-15',
      formattedDate: formatFeatureDate('2025-04-15'),
      content: (
        <>
          <p className="mb-2">
            Our data validation framework allows administrators to define custom validation rules that enforce data quality standards during import processes.
          </p>
          <p className="font-medium mt-3">Key features:</p>
          <ul className="list-disc pl-5 space-y-1 mt-1">
            <li>Rule creation with custom conditions and error messages</li>
            <li>Different validation severity levels (warning, error, info)</li>
            <li>Field-specific and cross-field validations</li>
            <li>Testing interface for validating rules against sample data</li>
            <li>Bulk activation/deactivation of validation rules</li>
          </ul>
        </>
      )
    },
    {
      id: 'item-6',
      title: 'Help Center',
      dateAdded: '2025-04-01',
      formattedDate: formatFeatureDate('2025-04-01'),
      content: (
        <>
          <p className="mb-2">
            The new Help Center (you're looking at it now!) provides centralized access to information about features and guides for using the system.
          </p>
          <p className="font-medium mt-3">Help Center features:</p>
          <ul className="list-disc pl-5 space-y-1 mt-1">
            <li>Feature announcements and descriptions</li>
            <li>Step-by-step guides for system functionality</li>
            <li>Troubleshooting information</li>
            <li>Keyboard shortcuts reference</li>
            <li>Searchable help content</li>
          </ul>
        </>
      )
    },
    {
      id: 'item-7',
      title: 'Enhanced Data Quality Analysis',
      dateAdded: '2025-03-28',
      formattedDate: formatFeatureDate('2025-03-28'),
      content: (
        <>
          <p className="mb-2">
            Our data quality analysis tools now provide deeper insights into your data, including pattern recognition and anomaly detection.
          </p>
          <p className="font-medium mt-3">Key improvements:</p>
          <ul className="list-disc pl-5 space-y-1 mt-1">
            <li>Detailed statistical analysis of numerical columns</li>
            <li>Pattern detection for text fields</li>
            <li>Visualizations for data distributions</li>
            <li>Automated suggestions for data cleaning</li>
            <li>Data profiling reports with quality metrics</li>
            <li>Comparison of data quality between imports</li>
          </ul>
        </>
      )
    },
    {
      id: 'item-8',
      title: 'File History and Analytics',
      dateAdded: '2025-03-15',
      formattedDate: formatFeatureDate('2025-03-15'),
      content: (
        <>
          <p className="mb-2">
            The File History system now includes advanced analytics and tracking for all imported files, providing better visibility into your data operations.
          </p>
          <p className="font-medium mt-3">New capabilities:</p>
          <ul className="list-disc pl-5 space-y-1 mt-1">
            <li>Comprehensive file import history with detailed logs</li>
            <li>Import statistics and performance metrics</li>
            <li>Visual timeline of file processing stages</li>
            <li>Error tracking and resolution history</li>
            <li>User activity tracking for auditing purposes</li>
            <li>Export of history logs for compliance reporting</li>
          </ul>
        </>
      )
    },
    {
      id: 'item-9',
      title: 'Context Document System',
      dateAdded: '2025-03-01',
      formattedDate: formatFeatureDate('2025-03-01'),
      content: (
        <>
          <p className="mb-2">
            The Context Document system allows teams to create and share important reference documents that provide context for data imports and business processes.
          </p>
          <p className="font-medium mt-3">System features:</p>
          <ul className="list-disc pl-5 space-y-1 mt-1">
            <li>Markdown-based document creation and editing</li>
            <li>Document categorization with tags</li>
            <li>Version control for documents</li>
            <li>Searchable document repository</li>
            <li>Access control based on user roles</li>
            <li>Integration with related import templates</li>
          </ul>
        </>
      )
    },
    {
      id: 'item-10',
      title: 'Normalization Engine',
      dateAdded: '2025-02-15',
      formattedDate: formatFeatureDate('2025-02-15'),
      content: (
        <>
          <p className="mb-2">
            The Data Normalization Engine standardizes imported data according to configurable rules, ensuring consistency across all data sources.
          </p>
          <p className="font-medium mt-3">Engine capabilities:</p>
          <ul className="list-disc pl-5 space-y-1 mt-1">
            <li>Predefined normalization rules for common data types</li>
            <li>Custom rule creation for specialized data</li>
            <li>Normalization previews before applying changes</li>
            <li>Bulk normalization operations</li>
            <li>Normalization templates for reuse</li>
            <li>Rule chaining for complex transformations</li>
          </ul>
        </>
      )
    }
  ]);

  // State for new feature form
  const [newFeature, setNewFeature] = useState({
    title: '',
    content: '',
    dateAdded: format(new Date(), 'yyyy-MM-dd')
  });

  // Function to add a new feature
  const handleAddFeature = () => {
    if (newFeature.title.trim() === '' || newFeature.content.trim() === '') {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    const newFeatureItem: Feature = {
      id: `item-${features.length + 1}`,
      title: newFeature.title,
      content: (
        <p className="whitespace-pre-wrap">{newFeature.content}</p>
      ),
      dateAdded: newFeature.dateAdded,
      formattedDate: formatFeatureDate(newFeature.dateAdded)
    };

    setFeatures([newFeatureItem, ...features]);
    setNewFeature({
      title: '',
      content: '',
      dateAdded: format(new Date(), 'yyyy-MM-dd')
    });

    toast({
      title: "Feature Added",
      description: "The new feature has been added to the help center",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Help Center</CardTitle>
            <CardDescription>
              Find information about new features and get help with using the system
            </CardDescription>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-1">
                <Plus className="h-4 w-4" /> Add Feature
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Feature</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Feature Title</Label>
                  <Input 
                    id="title" 
                    value={newFeature.title}
                    onChange={(e) => setNewFeature({...newFeature, title: e.target.value})}
                    placeholder="Enter feature title"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="content">Feature Description</Label>
                  <Textarea 
                    id="content" 
                    value={newFeature.content}
                    onChange={(e) => setNewFeature({...newFeature, content: e.target.value})}
                    placeholder="Describe the feature"
                    rows={5}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="date">Date Added</Label>
                  <Input 
                    id="date" 
                    type="date" 
                    value={newFeature.dateAdded}
                    onChange={(e) => setNewFeature({...newFeature, dateAdded: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddFeature}>Add Feature</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
                {features.map((feature) => (
                  <AccordionItem key={feature.id} value={feature.id}>
                    <AccordionTrigger className="font-medium">
                      <div className="flex items-center justify-between w-full pr-4">
                        <span>{feature.title}</span>
                        <div className="flex items-center gap-2 text-sm text-gray-500 font-normal">
                          <CalendarDays className="h-4 w-4" />
                          <span>{feature.formattedDate}</span>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600">
                      {feature.content}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabsContent>
            
            <TabsContent value="help-section">
              <div className="bg-green-50 p-4 rounded-lg border border-green-100 flex items-start gap-3 mb-6">
                <Book className="h-6 w-6 text-green-600 shrink-0 mt-1" />
                <div>
                  <h3 className="font-medium text-green-900">Help & Documentation</h3>
                  <p className="text-green-700 text-sm">
                    Get step-by-step instructions for using each section of the system
                  </p>
                </div>
              </div>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="help-landing">
                  <AccordionTrigger className="font-medium">
                    Landing Page
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    <h4 className="font-medium mb-2">Getting Started</h4>
                    <ol className="list-decimal pl-5 space-y-2 mb-4">
                      <li>
                        <span className="font-medium">Welcome Screen:</span> The landing page provides an overview of available import options.
                      </li>
                      <li>
                        <span className="font-medium">Recent Imports:</span> View your most recent import activities and their status.
                      </li>
                      <li>
                        <span className="font-medium">Import Options:</span> Select from various import options like "Import New Data" or "Templates".
                      </li>
                      <li>
                        <span className="font-medium">Admin Access:</span> Click the "Admin Dashboard" button to access administrative functions.
                      </li>
                      <li>
                        <span className="font-medium">File History:</span> Access your complete file import history through the navigation.
                      </li>
                    </ol>
                    
                    <div className="bg-yellow-50 p-3 rounded-md border border-yellow-100 mb-3">
                      <h5 className="font-medium text-yellow-800 mb-1">Pro Tip</h5>
                      <p className="text-yellow-700 text-sm">
                        Use the Recent Imports section to quickly resume any paused or incomplete imports without starting over.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                {/* Feature info embedded in help section */}
                <AccordionItem value="help-features">
                  <AccordionTrigger className="font-medium">
                    New Features
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    <div className="space-y-4">
                      {features.map((feature) => (
                        <div key={`help-${feature.id}`} className="border-b border-gray-200 pb-4 last:border-0">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-gray-800">{feature.title}</h5>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <CalendarDays className="h-3.5 w-3.5" />
                              <span>{feature.formattedDate}</span>
                            </div>
                          </div>
                          <div className="text-gray-600">{feature.content}</div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="help-import-wizard">
                  <AccordionTrigger className="font-medium">
                    Import Wizard
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    <h4 className="font-medium mb-2">Import Process Step-by-Step</h4>
                    
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-700 mb-1">1. Import Type Selection</h5>
                      <ol className="list-decimal pl-5 space-y-1 mb-3">
                        <li>Navigate to the Import Wizard from the landing page</li>
                        <li>Choose from options like "Standard Import", "Template-Based Import", or "API Import"</li>
                        <li>Select the destination for your imported data</li>
                        <li>Click "Continue" to proceed to the file upload step</li>
                      </ol>
                    </div>
                    
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-700 mb-1">2. File Upload</h5>
                      <ol className="list-decimal pl-5 space-y-1 mb-3">
                        <li>Drag and drop your file or click to browse your files</li>
                        <li>Supported formats: CSV, XLSX, XLS, and TXT</li>
                        <li>Maximum file size: 50MB</li>
                        <li>Wait for the file to upload and pre-process</li>
                        <li>Click "Continue" once the upload is complete</li>
                      </ol>
                      
                      <div className="bg-yellow-50 p-3 rounded-md border border-yellow-100 mb-3">
                        <h6 className="font-medium text-yellow-800 mb-1">Pro Tip</h6>
                        <p className="text-yellow-700 text-sm">
                          For large files, consider using our batch import option which can handle files up to 500MB by splitting them into smaller chunks.
                        </p>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-700 mb-1">3. File Verification</h5>
                      <ol className="list-decimal pl-5 space-y-1 mb-3">
                        <li>Review the detected file properties (encoding, delimiter, etc.)</li>
                        <li>Adjust file reading parameters if necessary</li>
                        <li>Preview the first few rows of data to ensure correct parsing</li>
                        <li>Click "Continue" when the file looks correct</li>
                      </ol>
                    </div>
                    
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-700 mb-1">4. Column Mapping</h5>
                      <ol className="list-decimal pl-5 space-y-1 mb-3">
                        <li>Map each column from your file to the corresponding field in the system</li>
                        <li>Use the auto-map feature to quickly match common field names</li>
                        <li>Apply a saved template if available</li>
                        <li>Mark required fields and set data types for each column</li>
                        <li>Click "Continue" once mapping is complete</li>
                      </ol>
                    </div>
                    
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-700 mb-1">5. Data Quality Analysis</h5>
                      <ol className="list-decimal pl-5 space-y-1 mb-3">
                        <li>Review automatic data quality checks</li>
                        <li>Identify issues like missing values, outliers, or format problems</li>
                        <li>Use the "Fix Automatically" option for common issues</li>
                        <li>Manually edit problem cells if necessary</li>
                        <li>Click "Continue" after addressing major data quality issues</li>
                      </ol>
                    </div>
                    
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-700 mb-1">6. Data Normalization</h5>
                      <ol className="list-decimal pl-5 space-y-1 mb-3">
                        <li>Apply formatting rules to standardize your data</li>
                        <li>Choose from preset normalization options for common fields</li>
                        <li>Create custom normalization rules if needed</li>
                        <li>Preview the normalized data</li>
                        <li>Click "Continue" to move to deduplication</li>
                      </ol>
                    </div>
                    
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-700 mb-1">7. Deduplication</h5>
                      <ol className="list-decimal pl-5 space-y-1 mb-3">
                        <li>Set matching criteria for identifying duplicate records</li>
                        <li>Choose how to handle duplicates (keep newest, merge, etc.)</li>
                        <li>Review potential duplicates</li>
                        <li>Manually resolve or apply bulk actions to duplicates</li>
                        <li>Click "Continue" to proceed to final review</li>
                      </ol>
                      
                      <div className="bg-yellow-50 p-3 rounded-md border border-yellow-100 mb-3">
                        <h6 className="font-medium text-yellow-800 mb-1">Pro Tip</h6>
                        <p className="text-yellow-700 text-sm">
                          Use fuzzy matching for text fields like names and addresses to catch duplicates with minor differences in spelling.
                        </p>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-700 mb-1">8. Final Review</h5>
                      <ol className="list-decimal pl-5 space-y-1 mb-3">
                        <li>Review a complete summary of your import</li>
                        <li>Check modification statistics and warnings</li>
                        <li>Save your import configuration as a template for future use</li>
                        <li>Click "Import Data" to finalize the process</li>
                      </ol>
                    </div>
                    
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-700 mb-1">9. Import Process</h5>
                      <ol className="list-decimal pl-5 space-y-1">
                        <li>Monitor real-time import progress</li>
                        <li>View detailed logs of the import operation</li>
                        <li>Access the imported data once complete</li>
                        <li>Get a summary report of the import results</li>
                      </ol>
                    </div>
                    
                    <Button variant="outline" className="mt-2">
                      Download Import Wizard PDF Guide
                    </Button>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="help-file-history">
                  <AccordionTrigger className="font-medium">
                    File History
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    <h4 className="font-medium mb-2">Managing Your Import History</h4>
                    <ol className="list-decimal pl-5 space-y-2 mb-4">
                      <li>
                        <span className="font-medium">Accessing File History:</span> Click the "File History" link in the main navigation.
                      </li>
                      <li>
                        <span className="font-medium">Viewing Past Imports:</span> Browse the list of previous imports sorted by date.
                      </li>
                      <li>
                        <span className="font-medium">Filtering Options:</span>
                        <ul className="list-disc pl-5 mt-1 space-y-1">
                          <li>Filter by date range</li>
                          <li>Filter by status (completed, failed, in progress)</li>
                          <li>Filter by import type or destination</li>
                        </ul>
                      </li>
                      <li>
                        <span className="font-medium">Import Details:</span> Click on any import to view detailed information.
                      </li>
                      <li>
                        <span className="font-medium">Actions:</span>
                        <ul className="list-disc pl-5 mt-1 space-y-1">
                          <li>Download the original file</li>
                          <li>View import logs</li>
                          <li>Clone the import to reuse settings</li>
                          <li>Export results as CSV or Excel</li>
                        </ul>
                      </li>
                      <li>
                        <span className="font-medium">History Retention:</span> Import history is kept for 90 days by default.
                      </li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="help-admin-dashboard">
                  <AccordionTrigger className="font-medium">
                    Admin Dashboard
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    <h4 className="font-medium mb-2">Administrative Functions</h4>
                    
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-700 mb-1">1. Templates Management</h5>
                      <ol className="list-decimal pl-5 space-y-1 mb-3">
                        <li>Navigate to the "Templates" tab in the Admin Dashboard</li>
                        <li>View existing system and user templates</li>
                        <li>Click a template card to expand its details</li>
                        <li>Use the "Edit" button to modify template properties</li>
                        <li>Add, remove, or reorder fields within a template</li>
                        <li>Save changes or cancel to discard modifications</li>
                      </ol>
                    </div>
                    
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-700 mb-1">2. Validation Rules</h5>
                      <ol className="list-decimal pl-5 space-y-1 mb-3">
                        <li>Go to the "Validations" tab in the Admin Dashboard</li>
                        <li>Browse existing validation rules</li>
                        <li>Create new validations with the "Add Validation" button</li>
                        <li>Configure validation properties:</li>
                        <ul className="list-disc pl-5 mt-1 space-y-1">
                          <li>Field selection</li>
                          <li>Validation type (format, range, required, etc.)</li>
                          <li>Error message and severity</li>
                          <li>Conditions for applying the validation</li>
                        </ul>
                        <li>Test validations against sample data</li>
                        <li>Enable or disable validations as needed</li>
                      </ol>
                    </div>
                    
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-700 mb-1">3. Developer Instructions</h5>
                      <ol className="list-decimal pl-5 space-y-1 mb-3">
                        <li>Access the "Developer Instructions" tab</li>
                        <li>Toggle Instruction Mode on/off</li>
                        <li>Show or hide all instructions with the visibility toggle</li>
                        <li>View all instruction boxes in the table below</li>
                        <li>Enable or disable specific instructions</li>
                        <li>Delete individual instructions or clear all</li>
                        <li>Export the instruction tool code for use in other projects</li>
                      </ol>
                    </div>
                    
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-700 mb-1">4. Page Instructions</h5>
                      <ol className="list-decimal pl-5 space-y-1 mb-3">
                        <li>Go to the "Page Instructions" tab</li>
                        <li>Add new instructions for specific page paths</li>
                        <li>Use the tabs to navigate between different pages</li>
                        <li>View all instructions for a selected page</li>
                        <li>Edit instruction text by clicking the edit button</li>
                        <li>Save changes or cancel editing</li>
                      </ol>
                    </div>
                    
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-700 mb-1">5. Indexing Files</h5>
                      <ol className="list-decimal pl-5 space-y-1 mb-3">
                        <li>Navigate to the "Indexing Files" tab</li>
                        <li>View the indexing status of uploaded files</li>
                        <li>Trigger manual re-indexing as needed</li>
                        <li>Configure indexing preferences</li>
                        <li>View indexing logs and statistics</li>
                      </ol>
                    </div>
                    
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-700 mb-1">6. Help Center</h5>
                      <ol className="list-decimal pl-5 space-y-1">
                        <li>Access the "Help" tab from the admin navigation</li>
                        <li>Browse new features information</li>
                        <li>View detailed help instructions for each section</li>
                        <li>Access downloadable guides and resources</li>
                      </ol>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="help-context-document">
                  <AccordionTrigger className="font-medium">
                    Context Document
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    <h4 className="font-medium mb-2">Working with Context Documents</h4>
                    <ol className="list-decimal pl-5 space-y-2 mb-4">
                      <li>
                        <span className="font-medium">Accessing Context Documents:</span> Navigate to the Context Document page from the main menu.
                      </li>
                      <li>
                        <span className="font-medium">Document Purpose:</span> Context documents provide background information and guidelines for specific processes.
                      </li>
                      <li>
                        <span className="font-medium">Viewing Documents:</span>
                        <ul className="list-disc pl-5 mt-1 space-y-1">
                          <li>Browse available documents from the list</li>
                          <li>Click a document title to read its contents</li>
                          <li>Use the search function to find specific information</li>
                        </ul>
                      </li>
                      <li>
                        <span className="font-medium">Creating Documents:</span> (Admin only)
                        <ul className="list-disc pl-5 mt-1 space-y-1">
                          <li>Click "Create New Document"</li>
                          <li>Add a title, description, and content using Markdown</li>
                          <li>Add tags to categorize the document</li>
                          <li>Save and publish the document</li>
                        </ul>
                      </li>
                      <li>
                        <span className="font-medium">Editing Documents:</span> (Admin only)
                        <ul className="list-disc pl-5 mt-1 space-y-1">
                          <li>Click the "Edit" button while viewing a document</li>
                          <li>Make changes to the content</li>
                          <li>Save changes or cancel to discard modifications</li>
                        </ul>
                      </li>
                    </ol>
                    
                    <div className="bg-yellow-50 p-3 rounded-md border border-yellow-100 mb-3">
                      <h5 className="font-medium text-yellow-800 mb-1">Pro Tip</h5>
                      <p className="text-yellow-700 text-sm">
                        Use the bookmark feature to save frequently referenced documents for quick access from your dashboard.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="help-troubleshooting">
                  <AccordionTrigger className="font-medium">
                    Troubleshooting
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    <h4 className="font-medium mb-2">Common Issues and Solutions</h4>
                    
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-700 mb-1">File Upload Issues</h5>
                      <ul className="list-disc pl-5 space-y-2">
                        <li>
                          <span className="font-medium">File too large:</span> Try splitting your file into smaller chunks or use our batch import feature.
                        </li>
                        <li>
                          <span className="font-medium">Unsupported format:</span> Convert your file to CSV, XLSX, or another supported format.
                        </li>
                        <li>
                          <span className="font-medium">Upload timeout:</span> Check your internet connection or try uploading during off-peak hours.
                        </li>
                      </ul>
                    </div>
                    
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-700 mb-1">Data Quality Problems</h5>
                      <ul className="list-disc pl-5 space-y-2">
                        <li>
                          <span className="font-medium">Encoding issues:</span> Try changing the file encoding in the verification step.
                        </li>
                        <li>
                          <span className="font-medium">Wrong delimiter detected:</span> Manually set the correct delimiter in file verification.
                        </li>
                        <li>
                          <span className="font-medium">Many validation errors:</span> Use batch editing to fix common issues or adjust validation rules if appropriate.
                        </li>
                      </ul>
                    </div>
                    
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-700 mb-1">System Errors</h5>
                      <ul className="list-disc pl-5 space-y-2">
                        <li>
                          <span className="font-medium">Import process fails:</span> Check the logs for specific error messages and contact support if needed.
                        </li>
                        <li>
                          <span className="font-medium">Page won't load:</span> Clear your browser cache and cookies, then try again.
                        </li>
                        <li>
                          <span className="font-medium">Instructions not appearing:</span> Make sure instruction mode is enabled and the instructions are active.
                        </li>
                      </ul>
                    </div>
                    
                    <div className="mt-4">
                      <h5 className="font-medium text-gray-700 mb-1">Getting Help</h5>
                      <p className="mb-2">
                        If you encounter an issue not covered here, please contact support through one of these channels:
                      </p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Email: support@example.com</li>
                        <li>In-app chat: Click the support icon in the bottom right</li>
                        <li>Knowledge Base: Visit our online help center at help.example.com</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="help-keyboard-shortcuts">
                  <AccordionTrigger className="font-medium">
                    Keyboard Shortcuts
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    <h4 className="font-medium mb-3">Available Shortcuts</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium text-gray-700 mb-2">Navigation</h5>
                        <ul className="space-y-2">
                          <li className="flex items-center justify-between">
                            <span>Go to Dashboard</span>
                            <code className="bg-gray-100 px-2 py-1 rounded text-sm">Alt + H</code>
                          </li>
                          <li className="flex items-center justify-between">
                            <span>Go to Import Wizard</span>
                            <code className="bg-gray-100 px-2 py-1 rounded text-sm">Alt + I</code>
                          </li>
                          <li className="flex items-center justify-between">
                            <span>Go to File History</span>
                            <code className="bg-gray-100 px-2 py-1 rounded text-sm">Alt + F</code>
                          </li>
                          <li className="flex items-center justify-between">
                            <span>Go to Admin</span>
                            <code className="bg-gray-100 px-2 py-1 rounded text-sm">Alt + A</code>
                          </li>
                        </ul>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-gray-700 mb-2">Actions</h5>
                        <ul className="space-y-2">
                          <li className="flex items-center justify-between">
                            <span>Save Changes</span>
                            <code className="bg-gray-100 px-2 py-1 rounded text-sm">Ctrl + S</code>
                          </li>
                          <li className="flex items-center justify-between">
                            <span>Cancel / Close</span>
                            <code className="bg-gray-100 px-2 py-1 rounded text-sm">Esc</code>
                          </li>
                          <li className="flex items-center justify-between">
                            <span>Search</span>
                            <code className="bg-gray-100 px-2 py-1 rounded text-sm">Ctrl + F</code>
                          </li>
                          <li className="flex items-center justify-between">
                            <span>Toggle Help</span>
                            <code className="bg-gray-100 px-2 py-1 rounded text-sm">F1</code>
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <h5 className="font-medium text-gray-700 mb-2">Import Wizard Specific</h5>
                      <ul className="space-y-2">
                        <li className="flex items-center justify-between">
                          <span>Next Step</span>
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm">Alt + Right</code>
                        </li>
                        <li className="flex items-center justify-between">
                          <span>Previous Step</span>
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm">Alt + Left</code>
                        </li>
                        <li className="flex items-center justify-between">
                          <span>Auto-map Columns</span>
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm">Alt + M</code>
                        </li>
                        <li className="flex items-center justify-between">
                          <span>Apply Template</span>
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm">Alt + T</code>
                        </li>
                      </ul>
                    </div>
                    
                    <Button variant="outline" className="mt-6">
                      Print Keyboard Shortcuts
                    </Button>
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

