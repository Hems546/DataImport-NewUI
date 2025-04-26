import React from 'react';
import Header from '@/components/Header';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Welcome to DataVoyager</h1>
        <p className="text-gray-600 mb-6">
          A powerful platform for data importing and management.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Content blocks can go here */}
        </div>
      </main>
    </div>
  );
};

export default Index;
