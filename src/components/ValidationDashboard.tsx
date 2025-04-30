
import React, { useState, useEffect } from 'react';
import { ValidationCategory } from '@/constants/validations';
import ValidationSummary from './ValidationSummary';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getValidationIdsForStage } from '@/services/validationRunner';

interface ValidationResult {
  id: string;
  name: string;
  status: 'pending' | 'pass' | 'fail' | 'warning';
  severity?: string;
}

interface ValidationDashboardProps {
  validationResults: Record<ValidationCategory, ValidationResult[]>;
}

const ValidationDashboard: React.FC<ValidationDashboardProps> = ({ validationResults }) => {
  const [activeTab, setActiveTab] = useState<ValidationCategory>(ValidationCategory.FILE_UPLOAD);
  
  // Generate summary data for all validation stages
  const summaryData = Object.entries(ValidationCategory).map(([_, category]) => {
    const categoryResults = validationResults[category as ValidationCategory] || [];
    const validationIds = getValidationIdsForStage(category as ValidationCategory);
    
    // For stages that haven't been run yet, create pending results
    const allResults = categoryResults.length > 0 
      ? categoryResults 
      : validationIds.map(id => ({
          id,
          name: id, // We would need to get the actual name
          status: 'pending' as const
        }));
    
    return {
      category: category as ValidationCategory,
      results: allResults
    };
  });
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Validation Status</h2>
      
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ValidationCategory)}>
        <TabsList className="w-full bg-gray-100 p-1 flex flex-wrap">
          {Object.values(ValidationCategory).map((category) => (
            <TabsTrigger key={category} value={category} className="flex-1">
              {category}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {Object.values(ValidationCategory).map((category) => {
          const categoryData = summaryData.find(data => data.category === category);
          
          return (
            <TabsContent key={category} value={category}>
              {categoryData ? (
                <>
                  <ValidationSummary 
                    category={category} 
                    results={categoryData.results} 
                  />
                  
                  <Button variant="outline" className="mt-4">
                    View Detailed Results
                  </Button>
                </>
              ) : (
                <p>No validation data available for this stage.</p>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};

export default ValidationDashboard;
