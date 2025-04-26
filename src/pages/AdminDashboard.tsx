
import { FileText, Shield, Database } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import TemplateCard from "@/components/admin/TemplateCard";

export default function AdminDashboard() {
  const systemTemplates = [
    { title: "Contacts", fields: 14, required: 3 },
    { title: "Orders", fields: 15, required: 6 },
    { title: "Subscribers", fields: 12, required: 3 },
    { title: "Subscriptions", fields: 16, required: 10 },
    { title: "Custom", fields: 0, required: 0 },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Admin Dashboard</h1>
      
      <div className="w-full bg-gray-50 rounded-lg p-4 mb-8">
        <nav className="flex space-x-4">
          <button className="flex items-center px-4 py-2 rounded-lg bg-white shadow text-primary">
            <FileText className="w-5 h-5 mr-2" /> Templates
          </button>
          <button className="flex items-center px-4 py-2 rounded-lg text-gray-600 hover:bg-white/80">
            <Shield className="w-5 h-5 mr-2" /> Validations
          </button>
          <button className="flex items-center px-4 py-2 rounded-lg text-gray-600 hover:bg-white/80">
            <FileText className="w-5 h-5 mr-2" /> Deduplication
          </button>
          <button className="flex items-center px-4 py-2 rounded-lg text-gray-600 hover:bg-white/80">
            <Database className="w-5 h-5 mr-2" /> Data Management
          </button>
        </nav>
      </div>

      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Template Management</h2>
        <p className="text-gray-600 mb-6">
          Create, edit, and manage field templates that users can apply during the data import process.
        </p>

        <Tabs defaultValue="system" className="mb-8">
          <TabsList>
            <TabsTrigger value="system">System Templates</TabsTrigger>
            <TabsTrigger value="user">User Templates</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="mb-8">
          <h3 className="text-xl font-bold mb-6">System-defined Templates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {systemTemplates.map((template) => (
              <TemplateCard
                key={template.title}
                title={template.title}
                fields={template.fields}
                required={template.required}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
