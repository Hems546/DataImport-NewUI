import React, { useState } from "react";
import { FileText, Shield, Database, ChevronLeft, StickyNote, FileCode2, BookText, Files } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import TemplateCard from "@/components/admin/TemplateCard";
import { ValidationManager } from "@/components/admin/ValidationManager";
import Header from "@/components/Header";
import { systemTemplates } from "@/data/systemTemplates";
import InstructionModeToggle from "@/components/instructions/InstructionModeToggle";
import InstructionManagementTable from "@/components/admin/InstructionManagementTable";
import { generateCodeBundle } from "@/utils/codeExporter";
import { useToast } from "@/hooks/use-toast";
import IndexingFiles from "@/components/admin/IndexingFiles";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('templates');
  const { toast } = useToast();

  const handleExportCode = async () => {
    try {
      await generateCodeBundle();
      toast({
        title: "Export Successful",
        description: "The instruction tool code has been exported successfully.",
      });
    } catch (error) {
      console.error("Export failed:", error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting the instruction tool code.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header currentPage="admin" />
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link to="/">
              <Button variant="outline" className="mr-4">
                <ChevronLeft className="w-5 h-5 mr-2" />
                Back to Welcome
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          </div>
          <Link to="/context">
            <Button variant="outline" className="flex items-center gap-2">
              <BookText className="w-5 h-5" />
              Application Context
            </Button>
          </Link>
        </div>
        
        <div className="w-full bg-gray-50 rounded-lg p-4 mb-8">
          <nav className="flex space-x-4 overflow-x-auto">
            <button 
              onClick={() => setActiveTab('templates')}
              className={`flex items-center px-4 py-2 rounded-lg ${
                activeTab === 'templates' ? 'bg-white shadow text-primary' : 'text-gray-600 hover:bg-white/80'
              }`}
            >
              <FileText className="w-5 h-5 mr-2" /> Templates
            </button>
            <button 
              onClick={() => setActiveTab('validations')}
              className={`flex items-center px-4 py-2 rounded-lg ${
                activeTab === 'validations' ? 'bg-white shadow text-primary' : 'text-gray-600 hover:bg-white/80'
              }`}
            >
              <Shield className="w-5 h-5 mr-2" /> Validations
            </button>
            <button 
              onClick={() => setActiveTab('instructions')}
              className={`flex items-center px-4 py-2 rounded-lg ${
                activeTab === 'instructions' ? 'bg-white shadow text-primary' : 'text-gray-600 hover:bg-white/80'
              }`}
            >
              <StickyNote className="w-5 h-5 mr-2" /> Developer Instructions
            </button>
            <button 
              onClick={() => setActiveTab('indexing')}
              className={`flex items-center px-4 py-2 rounded-lg ${
                activeTab === 'indexing' ? 'bg-white shadow text-primary' : 'text-gray-600 hover:bg-white/80'
              }`}
            >
              <Files className="w-5 h-5 mr-2" /> Indexing Files
            </button>
          </nav>
        </div>

        <div className="max-w-4xl mx-auto">
          {activeTab === 'templates' && (
            <>
              <h2 className="text-2xl font-bold mb-4">Template Management</h2>
              <p className="text-gray-600 mb-6">
                Create, edit, and manage field templates that users can apply during the data import process.
              </p>

              <Tabs defaultValue="system" className="mb-8">
                <TabsList>
                  <TabsTrigger value="system">System Templates</TabsTrigger>
                  <TabsTrigger value="user">User Templates</TabsTrigger>
                </TabsList>
                <TabsContent value="system">
                  <div className="mt-6">
                    <h3 className="text-xl font-bold mb-6">System-defined Templates</h3>
                    <div className="grid grid-cols-1 gap-4">
                      {systemTemplates.map((template) => (
                        <TemplateCard
                          key={template.title}
                          title={template.title}
                          description={template.description}
                          fields={template.fields}
                        />
                      ))}
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="user">
                  <div className="mt-6">
                    <h3 className="text-xl font-bold mb-6">User-defined Templates</h3>
                    <p className="text-gray-500">No user templates found. Create your first template.</p>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
          
          {activeTab === 'validations' && <ValidationManager />}

          {activeTab === 'instructions' && (
            <>
              <h2 className="text-2xl font-bold mb-4">Developer Instructions</h2>
              <p className="text-gray-600 mb-6">
                Enable the instruction mode to add guidance boxes for developers across the application.
              </p>
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-8">
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Instruction Mode</h3>
                    <p className="text-gray-600 mb-4">
                      When enabled, you can add draggable instruction boxes anywhere in the application. 
                      These boxes can be positioned and configured to provide guidance to developers.
                    </p>
                    <div className="flex items-center gap-3">
                      <InstructionModeToggle />
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-medium mb-2">How to Use</h3>
                    <ol className="list-decimal pl-5 space-y-2 text-gray-600">
                      <li>Enable Instruction Mode using the toggle above</li>
                      <li>Click the "+" button that appears in the bottom-right corner of any page</li>
                      <li>Drag the instruction box to position it where needed</li>
                      <li>Edit the text by clicking the pencil icon</li>
                      <li>Optionally draw a pointer to highlight specific UI elements</li>
                    </ol>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Export Tool</h3>
                      <Button 
                        onClick={handleExportCode}
                        className="gap-2"
                        variant="outline"
                      >
                        <FileCode2 size={16} /> Export Code
                      </Button>
                    </div>
                    <p className="text-gray-600 mt-2">
                      Export the code for this instruction tool to use in another project.
                    </p>
                  </div>
                </div>
              </div>
              
              <InstructionManagementTable />
            </>
          )}

          {activeTab === 'indexing' && <IndexingFiles />}
        </div>
      </div>
    </div>
  );
}
