
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MarkdownDisplay from '@/components/markdown/MarkdownDisplay';
import contextMarkdown from '@/data/Context.MD?raw';
import readmeMarkdown from '@/README.md?raw';

const IndexingFiles = () => {
  const [activeFile, setActiveFile] = useState<'context' | 'readme'>('context');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Indexing Files</h2>
        <p className="text-gray-500 text-sm">Files used to help maintain and understand the application</p>
      </div>
      
      <Tabs defaultValue="context" className="w-full" onValueChange={(value) => setActiveFile(value as 'context' | 'readme')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="context">Context.MD</TabsTrigger>
          <TabsTrigger value="readme">README.md</TabsTrigger>
        </TabsList>
        <TabsContent value="context" className="p-4 border rounded-md mt-4 bg-white">
          <div className="mb-4 pb-2 border-b">
            <h3 className="text-lg font-semibold">Application Context</h3>
            <p className="text-sm text-gray-600">
              Comprehensive documentation of the application architecture, components, and behavior.
            </p>
          </div>
          <div className="max-h-[70vh] overflow-auto">
            <MarkdownDisplay content={contextMarkdown} />
          </div>
        </TabsContent>
        <TabsContent value="readme" className="p-4 border rounded-md mt-4 bg-white">
          <div className="mb-4 pb-2 border-b">
            <h3 className="text-lg font-semibold">README.md</h3>
            <p className="text-sm text-gray-600">
              Project overview, setup instructions, and development guidelines.
            </p>
          </div>
          <div className="max-h-[70vh] overflow-auto">
            <MarkdownDisplay content={readmeMarkdown} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IndexingFiles;
