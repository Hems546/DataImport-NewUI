
import React from 'react';
import { Check, X, Loader } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ValidationResult {
  id: string;
  name: string;
  status: 'pending' | 'pass' | 'fail';
  description?: string;
}

interface ValidationStatusProps {
  results: ValidationResult[];
  title: string;
}

const ValidationStatus = ({ results, title }: ValidationStatusProps) => {
  const getStatusIcon = (status: ValidationResult['status']) => {
    switch (status) {
      case 'pass':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'fail':
        return <X className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Loader className="h-4 w-4 text-gray-500 animate-spin" />;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="font-semibold mb-4">{title}</h3>
      <div className="space-y-3">
        {results.map((result) => (
          <div
            key={result.id}
            className={cn(
              "flex items-center justify-between p-2 rounded",
              result.status === 'fail' ? 'bg-red-50' : 'bg-gray-50'
            )}
          >
            <div className="flex-1">
              <p className="font-medium">{result.name}</p>
              {result.description && (
                <p className="text-sm text-gray-500">{result.description}</p>
              )}
            </div>
            <div className="ml-4">
              {getStatusIcon(result.status)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ValidationStatus;
