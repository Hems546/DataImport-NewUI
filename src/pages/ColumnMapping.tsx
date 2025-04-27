
import React from "react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ColumnMappingForm } from "@/components/admin/ColumnMappingForm";
import { 
  FileCheck,
  ArrowRight,
  ArrowLeft,
  FileBox,
  ClipboardCheck,
  ArrowUpCircle
} from "lucide-react";
import MapColumns from "@/components/icons/MapColumns";
import DataQuality from "@/components/icons/DataQuality";
import TransformData from "@/components/icons/TransformData";
import ProgressStep from "@/components/ProgressStep";
import StepConnector from "@/components/StepConnector";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

export default function ColumnMapping() {
  const { toast } = useToast();
  
  const handleMappingSave = () => {
    toast({
      title: "Column mapping saved",
      description: "Your column mapping has been saved successfully."
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header currentPage="import-wizard" />

      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <Link to="/import-wizard/verification">
                <Button variant="outline">
                  <ArrowLeft className="mr-2" />
                  Back
                </Button>
              </Link>
              <h2 className="text-2xl font-bold">Column Mapping</h2>
            </div>
            <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
              Target: customers
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-between items-center mb-12">
            <ProgressStep 
              icon={<FileCheck />}
              label="File Upload"
              isComplete={true}
            />
            <StepConnector isCompleted={true} />
            <ProgressStep 
              icon={<FileCheck />}
              label="File Preflighting"
              isComplete={true}
            />
            <StepConnector isCompleted={true} />
            <ProgressStep 
              icon={<MapColumns />}
              label="Column Mapping"
              isActive={true}
            />
            <StepConnector />
            <ProgressStep 
              icon={<DataQuality />}
              label="Data Quality"
            />
            <StepConnector />
            <ProgressStep 
              icon={<TransformData />}
              label="Data Normalization"
            />
            <StepConnector />
            <ProgressStep 
              icon={<FileBox />}
              label="Deduplication"
            />
            <StepConnector />
            <ProgressStep 
              icon={<ClipboardCheck />}
              label="Final Review & Approval"
            />
            <StepConnector />
            <ProgressStep 
              icon={<ArrowUpCircle />}
              label="Import / Push"
            />
          </div>

          {/* Instructions Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Map Your Columns</CardTitle>
              <CardDescription>
                Match your file columns with our system fields to ensure data is imported correctly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Choose a mapping strategy:
                  <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                    <li><strong>Auto-Map:</strong> Automatically matches columns based on similar names</li>
                    <li><strong>Manual:</strong> Manually select matches for each column</li>
                    <li><strong>AI-Assisted:</strong> Uses AI to suggest the best matches</li>
                  </ul>
                </AlertDescription>
              </Alert>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-medium">Tips for successful mapping:</p>
                  <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                    <li>Required fields are marked with a red asterisk (*)</li>
                    <li>Use "Ignore this column" for data you don't want to import</li>
                    <li>Review auto-mapped fields for accuracy</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Column Mapping Form */}
          <div className="bg-white p-8 rounded-lg border border-gray-200">
            <ColumnMappingForm />
          </div>

          {/* Navigation */}
          <div className="mt-8 flex justify-between items-center">
            <div className="flex gap-4">
              <Link to="/import-wizard/verification">
                <Button variant="outline">
                  <ArrowLeft className="mr-2" />
                  Back
                </Button>
              </Link>
            </div>
            <Link to="/import-wizard/data-quality">
              <Button 
                className="bg-brand-purple hover:bg-brand-purple/90"
                onClick={handleMappingSave}
              >
                Continue to Data Quality
                <ArrowRight className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
