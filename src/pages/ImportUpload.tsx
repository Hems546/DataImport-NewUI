
import React from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { FileBox } from "@/components/FileBox";

export default function ImportUpload() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header currentPage="import-wizard" />
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Upload Data File</h1>
          
          <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm">
            <FileBox />
            
            <div className="mt-8 flex justify-between">
              <Link to="/import-wizard">
                <Button variant="outline">Back</Button>
              </Link>
              <Button>Continue</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
