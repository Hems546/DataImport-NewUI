
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import { FileText, Table, CheckCircle } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header currentPage="welcome" />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-4xl font-bold text-center mb-4">Data Import Wizard</h1>
        <p className="text-gray-600 text-center mb-8">
          Import, map, transform, and validate your data with ease.
        </p>

        <div className="flex justify-center mb-12">
          <Link to="/import-wizard">
            <Button className="px-6 py-3 text-lg">
              <FileText className="mr-2" /> Start New Import
            </Button>
          </Link>
          <Button variant="outline" className="ml-4 px-6 py-3 text-lg">
            View Import History
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-8 mt-12">
          <div className="text-center p-6 bg-blue-50 rounded-lg">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <FileText className="text-blue-600 w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Upload & Configure</h3>
            <p className="text-gray-600">
              Upload your CSV or Excel files and configure how data should be imported.
            </p>
          </div>

          <div className="text-center p-6 bg-green-50 rounded-lg">
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Table className="text-green-600 w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Map & Transform</h3>
            <p className="text-gray-600">
              Map your columns to the correct fields and apply transformations.
            </p>
          </div>

          <div className="text-center p-6 bg-purple-50 rounded-lg">
            <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-purple-600 w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Validate & Import</h3>
            <p className="text-gray-600">
              Preview your data, validate it, and complete the import process.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
