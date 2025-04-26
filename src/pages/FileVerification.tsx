
import React, { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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

export default function FileVerification() {
  const [progress] = React.useState(32);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-brand-purple">
        <Header currentPage="import-wizard" />
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center text-white">
            <div className="flex items-center gap-4">
              <Link to="/import-wizard/upload">
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
            <h2 className="text-2xl font-bold">File Verification</h2>
            <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
              Target: customers
            </div>
          </div>

          <div className="flex justify-between items-center mb-12">
            <ProgressStep 
              icon={<FileCheck />}
              label="File Upload"
              isComplete={true}
            />
            <StepConnector />
            <ProgressStep 
              icon={<FileCheck />}
              label="File Preflighting"
              isActive={true}
            />
            <StepConnector />
            <ProgressStep 
              icon={<MapColumns />}
              label="Column Mapping"
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

          <div className="bg-white p-8 rounded-lg border border-gray-200">
            <h3 className="text-xl font-semibold mb-4">File Verification</h3>
            <p className="text-gray-600 mb-4">
              We're checking your file for proper formatting and data quality.
            </p>
            
            {/* File verification content will go here */}
            <div className="p-4 bg-gray-50 border rounded-md">
              <p className="text-center text-gray-500">File verification in progress...</p>
            </div>
          </div>

          <div className="mt-8 flex justify-between items-center">
            <div className="flex gap-4">
              <Link to="/import-wizard/upload">
                <Button variant="outline">
                  <ArrowLeft className="mr-2" />
                  Back
                </Button>
              </Link>
            </div>
            <Button className="bg-brand-purple hover:bg-brand-purple/90">
              Continue to Column Mapping
              <ArrowRight className="ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
