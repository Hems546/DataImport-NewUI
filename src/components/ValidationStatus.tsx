
import React from 'react';
import { Check, X, Loader } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ValidationResult {
  id: string;
  name: string;
  status: 'pending' | 'pass' | 'fail';
  description?: string;
  severity?: string;
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

  const failedChecks = results.filter(result => result.status === 'fail');
  const hasCriticalFailures = failedChecks.some(check => check.severity === 'critical');

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">{title}</h3>
          {failedChecks.length > 0 && !hasCriticalFailures && (
            <span className="text-sm text-yellow-600">
              Non-critical issues found - Override available
            </span>
          )}
        </div>
        <div className="space-y-3">
          {results.map((result) => (
            <div
              key={result.id}
              className={cn(
                "flex items-center justify-between p-2 rounded",
                result.status === 'fail' ? 
                  result.severity === 'critical' ? 'bg-red-50' : 'bg-yellow-50' 
                  : 'bg-gray-50'
              )}
            >
              <div className="flex-1">
                <p className="font-medium">{result.name}</p>
              </div>
              <div className="flex items-center gap-2">
                {result.severity === 'critical' && result.status === 'fail' && (
                  <span className="text-xs text-red-600 font-medium">Critical</span>
                )}
                {getStatusIcon(result.status)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ValidationStatus;
