
import React from 'react';
import { Check, X, Loader, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export interface ValidationResult {
  id: string;
  name: string;
  status: 'pending' | 'pass' | 'fail';
  description?: string;
  failureReason?: string;
  remediation?: string;
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

  return (
    <div className="space-y-6">
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

      {failedChecks.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-semibold text-red-600">Failed Checks Details</h4>
          {failedChecks.map((check) => (
            <Alert key={check.id} variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{check.name}</AlertTitle>
              <AlertDescription>
                <div className="mt-2 space-y-2">
                  {check.failureReason && (
                    <p><strong>Issue:</strong> {check.failureReason}</p>
                  )}
                  {check.remediation && (
                    <p><strong>How to fix:</strong> {check.remediation}</p>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}
    </div>
  );
};

export default ValidationStatus;
