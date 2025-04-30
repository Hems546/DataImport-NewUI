
import React from "react";
import { Badge } from "@/components/ui/badge";

interface ValidationResult {
  id: string;
  name: string;
  status: "pending" | "pass" | "fail" | "warning";
  severity?: string;
  description?: string;
  technical_details?: string | string[];
}

interface ValidationSummaryProps {
  category: string;
  results: ValidationResult[];
}

const ValidationSummary: React.FC<ValidationSummaryProps> = ({ category, results }) => {
  if (!results || results.length === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-500">No validation results available for {category}.</p>
      </div>
    );
  }

  // Count validations by status
  const statusCount = {
    pass: results.filter((r) => r.status === "pass").length,
    fail: results.filter((r) => r.status === "fail").length,
    warning: results.filter((r) => r.status === "warning").length,
    pending: results.filter((r) => r.status === "pending").length,
  };

  // Custom badge variants
  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "fail": return "destructive";
      case "warning": return "outline"; // Using outline for warnings
      case "pending": return "secondary";
      case "pass": return "outline"; // Using outline for pass
      default: return "default";
    }
  };

  return (
    <div className="bg-white rounded-lg">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium">{category}</h3>
        <div className="flex gap-2">
          {statusCount.pass > 0 && (
            <Badge variant={getBadgeVariant("pass")} className="bg-green-100 text-green-800 hover:bg-green-200">
              {statusCount.pass} Passed
            </Badge>
          )}
          {statusCount.warning > 0 && (
            <Badge variant={getBadgeVariant("warning")} className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
              {statusCount.warning} Warnings
            </Badge>
          )}
          {statusCount.fail > 0 && (
            <Badge variant="destructive">
              {statusCount.fail} Failed
            </Badge>
          )}
          {statusCount.pending > 0 && (
            <Badge variant="secondary">
              {statusCount.pending} Pending
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

export default ValidationSummary;
