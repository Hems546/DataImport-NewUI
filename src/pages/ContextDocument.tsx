
import React from 'react';
import Header from "@/components/Header";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import MarkdownDisplay from '@/components/markdown/MarkdownDisplay';
import contextMarkdown from '@/data/Context.MD?raw';

export default function ContextDocument() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header currentPage="context" />
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Link to="/admin">
            <Button variant="outline" className="mr-4">
              <ChevronLeft className="w-5 h-5 mr-2" />
              Back to Admin
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Application Context</h1>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <MarkdownDisplay content={contextMarkdown} />
        </div>
      </div>
    </div>
  );
}
