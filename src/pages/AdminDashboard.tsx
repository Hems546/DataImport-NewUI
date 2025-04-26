import React, { useState } from "react";
import { FileText, Shield, Database } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import TemplateCard from "@/components/admin/TemplateCard";
import { ValidationManager } from "@/components/admin/ValidationManager";
import Header from "@/components/Header";
import { systemTemplates } from "@/data/systemTemplates";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('templates');

  return (
    <div className="min-h-screen flex flex-col">
      <Header currentPage="admin" />
      <div className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Admin Dashboard</h1>
        
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
            <button className="flex items-center px-4 py-2 rounded-lg text-gray-600 hover:bg-white/80">
              <Database className="w-5 h-5 mr-2" /> Data Management
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
        </div>
      </div>
    </div>
  );
}
