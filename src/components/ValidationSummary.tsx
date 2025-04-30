
import React from 'react';
import { Check, X, AlertTriangle } from 'lucide-react';
import { ValidationCategory } from '@/constants/validations';
import { Badge } from "@/components/ui/badge";

interface ValidationSummaryProps {
  category: ValidationCategory;
  results: {
    id: string;
    name: string;
    status: 'pending' | 'pass' | 'fail' | 'warning';
    severity?: string;
  }[];
}

const ValidationSummary: React.FC<ValidationSummaryProps> = ({ category, results }) => {
  const passCount = results.filter(r => r.status === 'pass').length;
  const failCount = results.filter(r => r.status === 'fail').length;
  const warningCount = results.filter(r => r.status === 'warning').length;
  const totalCount = results.length;
  
  const hasCriticalErrors = results.some(r => r.status === 'fail' && r.severity === 'critical');
  
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium">{category} Validations</h3>
        
        <div className="flex gap-2">
          {hasCriticalErrors ? (
            <Badge variant="destructive" className="flex items-center gap-1">
              <X className="h-3 w-3" />
              <span>Critical Errors</span>
            </Badge>
          ) : warningCount > 0 ? (
            <Badge variant="warning" className="flex items-center gap-1 bg-yellow-100 text-yellow-800">
              <AlertTriangle className="h-3 w-3" />
              <span>Warnings</span>
            </Badge>
          ) : (
            <Badge variant="success" className="flex items-center gap-1 bg-green-100 text-green-800">
              <Check className="h-3 w-3" />
              <span>Passed</span>
            </Badge>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        <div className="flex items-center gap-1 text-sm">
          <Check className="h-3 w-3 text-green-500" />
          <span className="text-gray-600">{passCount} passed</span>
        </div>
        <div className="flex items-center gap-1 text-sm">
          <X className="h-3 w-3 text-red-500" />
          <span className="text-gray-600">{failCount} failed</span>
        </div>
        <div className="flex items-center gap-1 text-sm">
          <AlertTriangle className="h-3 w-3 text-yellow-500" />
          <span className="text-gray-600">{warningCount} warnings</span>
        </div>
      </div>
      
      <div className="mt-2">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="h-2 rounded-full flex"
            style={{ width: '100%' }}
          >
            <div
              className="bg-green-500 h-full rounded-l-full"
              style={{ width: `${(passCount/totalCount) * 100}%` }}
            ></div>
            <div
              className="bg-yellow-500 h-full"
              style={{ width: `${(warningCount/totalCount) * 100}%` }}
            ></div>
            <div
              className="bg-red-500 h-full rounded-r-full"
              style={{ width: `${(failCount/totalCount) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValidationSummary;
