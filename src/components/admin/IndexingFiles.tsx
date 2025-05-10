
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MarkdownDisplay from '@/components/markdown/MarkdownDisplay';
import contextMarkdown from '@/data/Context.MD?raw';
import readmeMarkdown from '/README.md?raw';
import { format } from 'date-fns';

const IndexingFiles = () => {
  const [activeFile, setActiveFile] = useState<'context' | 'readme'>('context');
  const [lastUpdated, setLastUpdated] = useState<Record<string, Date>>({
    context: new Date(),
    readme: new Date()
  });
  const [contentVersions, setContentVersions] = useState({
    context: contextMarkdown,
    readme: readmeMarkdown
  });

  // Function to check for file changes
  useEffect(() => {
    // Create a simple polling mechanism to check for changes
    const checkForChanges = () => {
      // Check if content has changed by comparing with current imports
      if (contextMarkdown !== contentVersions.context) {
        setContentVersions(prev => ({ ...prev, context: contextMarkdown }));
        setLastUpdated(prev => ({ ...prev, context: new Date() }));
        console.log('Context file updated');
      }
      
      if (readmeMarkdown !== contentVersions.readme) {
        setContentVersions(prev => ({ ...prev, readme: readmeMarkdown }));
        setLastUpdated(prev => ({ ...prev, readme: new Date() }));
        console.log('README file updated');
      }
    };

    // Initial check
    checkForChanges();
    
    // Set up polling interval (every 10 seconds)
    const intervalId = setInterval(checkForChanges, 10000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  // Format the timestamp for display
  const formatTimestamp = (date: Date) => {
    return format(date, 'MMM d, yyyy HH:mm:ss');
  };

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
            <p className="text-xs text-gray-400 mt-1">
              Last updated: {formatTimestamp(lastUpdated.context)}
            </p>
          </div>
          <div className="max-h-[70vh] overflow-auto">
            <MarkdownDisplay content={contentVersions.context} />
          </div>
        </TabsContent>
        <TabsContent value="readme" className="p-4 border rounded-md mt-4 bg-white">
          <div className="mb-4 pb-2 border-b">
            <h3 className="text-lg font-semibold">README.md</h3>
            <p className="text-sm text-gray-600">
              Project overview, setup instructions, and development guidelines.
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Last updated: {formatTimestamp(lastUpdated.readme)}
            </p>
          </div>
          <div className="max-h-[70vh] overflow-auto">
            <MarkdownDisplay content={contentVersions.readme} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IndexingFiles;
