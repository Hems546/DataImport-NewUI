
import React from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Upload,
  FileCheck,
  MapColumns,
  DataQuality,
  TransformData, 
  Eye,
  RotateCcw,
  ArrowRight,
  ArrowLeft
} from "lucide-react";
import ProgressStep from "@/components/ProgressStep";
import StepConnector from "@/components/StepConnector";

export default function ImportUpload() {
  const [progress] = React.useState(16);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-brand-purple">
        <Header currentPage="import-wizard" />
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center text-white">
            <div className="flex items-center gap-4">
              <Link to="/import-wizard">
                <Button variant="ghost" className="text-white hover:text-white hover:bg-white/20">
                  <ArrowLeft className="mr-2" />
                  Back
                </Button>
              </Link>
              <h1 className="text-2xl font-semibold">Data Import</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" className="text-white hover:text-white hover:bg-white/20">
                Audit History
                <span className="ml-2 bg-white text-brand-purple rounded-full w-5 h-5 flex items-center justify-center text-xs">11</span>
              </Button>
              <Button variant="ghost" className="text-white hover:text-white hover:bg-white/20">
                File History
                <span className="ml-2 bg-white text-brand-purple rounded-full w-5 h-5 flex items-center justify-center text-xs">11</span>
              </Button>
              <Button variant="ghost" className="text-white hover:text-white hover:bg-white/20">
                Admin
              </Button>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="flex justify-between items-center text-white mb-2">
              <span>Upload Progress</span>
              <span>{progress}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>

      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Upload Data</h2>
            <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
              Target: customers
            </div>
          </div>

          <div className="flex justify-between items-center mb-12">
            <ProgressStep 
              icon={<Upload />}
              label="Upload File"
              isActive={true}
            />
            <StepConnector />
            <ProgressStep 
              icon={<FileCheck />}
              label="Verify File"
            />
            <StepConnector />
            <ProgressStep 
              icon={<MapColumns />}
              label="Map Columns"
            />
            <StepConnector />
            <ProgressStep 
              icon={<DataQuality />}
              label="Data Quality"
            />
            <StepConnector />
            <ProgressStep 
              icon={<TransformData />}
              label="Transform Data"
            />
            <StepConnector />
            <ProgressStep 
              icon={<Eye />}
              label="Preview & Import"
            />
          </div>

          <div className="bg-white p-8 rounded-lg border border-gray-200">
            <h3 className="text-xl font-semibold mb-4">Upload Your Data File</h3>
            <p className="text-gray-600 mb-8">
              Upload a CSV or Excel file to begin the import process. Your file should include header rows.
            </p>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
              <div className="flex flex-col items-center">
                <Upload className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 mb-1">
                  Drag & drop your file here, or <span className="text-blue-600">browse</span>
                </p>
                <p className="text-gray-500 text-sm mb-4">
                  Supports CSV, XLS, XLSX (max 10MB)
                </p>
                <Button>Select File</Button>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-between items-center">
            <div className="flex gap-4">
              <Link to="/import-wizard">
                <Button variant="outline">
                  <ArrowLeft className="mr-2" />
                  Back
                </Button>
              </Link>
              <Button variant="outline">
                <RotateCcw className="mr-2" />
                Start Over
              </Button>
            </div>
            <Button>
              Continue
              <ArrowRight className="ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
