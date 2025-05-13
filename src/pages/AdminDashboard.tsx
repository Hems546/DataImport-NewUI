
import React, { useState } from "react";
import { FileText, Shield, Database, ChevronLeft, StickyNote, Files, Map, HelpCircle, ToggleLeft } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import TemplateCard from "@/components/admin/TemplateCard";
import { ValidationManager } from "@/components/admin/ValidationManager";
import Header from "@/components/Header";
import { systemTemplates } from "@/data/systemTemplates";
import { useToast } from "@/hooks/use-toast";
import IndexingFiles from "@/components/admin/IndexingFiles";
import { useInstructionMode } from "@/contexts/InstructionContext";
import CombinedInstructionManager from "@/components/admin/CombinedInstructionManager";
import AdminHelpCenter from "@/components/admin/AdminHelpCenter";
import ImportTypeManager from "@/components/admin/ImportTypeManager";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('templates');
  const [templates, setTemplates] = useState([...systemTemplates]);
  const { toast } = useToast();

  const handleUpdateTemplate = (index: number, updatedTemplate: any) => {
    const newTemplates = [...templates];
    newTemplates[index] = updatedTemplate;
    setTemplates(newTemplates);
    
    toast({
      title: "Template Updated",
      description: `${updatedTemplate.title} template has been updated successfully.`,
    });
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
              <StickyNote className="w-5 h-5 mr-2" /> Instructions
            </button>
            <button 
              onClick={() => setActiveTab('indexing')}
              className={`flex items-center px-4 py-2 rounded-lg ${
                activeTab === 'indexing' ? 'bg-white shadow text-primary' : 'text-gray-600 hover:bg-white/80'
              }`}
            >
              <Files className="w-5 h-5 mr-2" /> Indexing Files
            </button>
            <button 
              onClick={() => setActiveTab('import-types')}
              className={`flex items-center px-4 py-2 rounded-lg ${
                activeTab === 'import-types' ? 'bg-white shadow text-primary' : 'text-gray-600 hover:bg-white/80'
              }`}
            >
              <ToggleLeft className="w-5 h-5 mr-2" /> Import Types
            </button>
            <button 
              onClick={() => setActiveTab('help')}
              className={`flex items-center px-4 py-2 rounded-lg ${
                activeTab === 'help' ? 'bg-white shadow text-primary' : 'text-gray-600 hover:bg-white/80'
              }`}
            >
              <HelpCircle className="w-5 h-5 mr-2" /> Help
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
                      {templates.map((template, index) => (
                        <TemplateCard
                          key={template.title}
                          title={template.title}
                          description={template.description}
                          fields={template.fields}
                          maxRowCount={template.maxRowCount}
                          onUpdate={(updatedTemplate) => handleUpdateTemplate(index, updatedTemplate)}
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

          {activeTab === 'instructions' && <CombinedInstructionManager />}

          {activeTab === 'indexing' && <IndexingFiles />}
          
          {activeTab === 'import-types' && <ImportTypeManager />}
          
          {activeTab === 'help' && <AdminHelpCenter />}
        </div>
      </div>
    </div>
  );
}
